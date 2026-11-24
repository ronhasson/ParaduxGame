import { DurableObject } from "cloudflare:workers";
import { black, freshGame, playMove, white } from "../rules.js";

const siteOrigin = "https://ronhasson.github.io";
const protocol = "paradux-v2";
const roomIdPattern = /^[a-f0-9]{32}$/;
const localHost = /^(localhost|127\.0\.0\.1)$/;
const idleRoomMs = 2 * 60 * 60 * 1000;
const reconnectMs = 90 * 1000;
const socketOpen = 1;

function token() {
    return crypto.randomUUID().replaceAll("-", "");
}

function response(body, status, origin) {
    const headers = { "Cache-Control": "no-store" };
    if (origin) headers["Access-Control-Allow-Origin"] = origin;
    return body === null ? new Response(null, { status, headers }) : Response.json(body, { status, headers });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const origin = request.headers.get("Origin");
        const localPreview = localHost.test(url.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
        if (origin !== siteOrigin && origin !== url.origin && !localPreview) {
            return response({ error: "Open the game from Paradux." }, 403);
        }

        const [_, route, room, extra] = url.pathname.split("/");
        const isCreate = route === "rooms" && !room && !extra && request.method === "POST";
        const isJoin = route === "rooms" && roomIdPattern.test(room) && extra === undefined &&
            request.headers.get("Upgrade")?.toLowerCase() === "websocket";
        if (!isCreate && !isJoin) return response({ error: "Unknown route." }, 404, origin);

        const ip = request.headers.get("CF-Connecting-IP") || "local";
        const { success } = await env.ROOM_RATE.limit({ key: ip, delta: isCreate ? 3 : 1 });
        if (!success) return response({ error: "Too many room requests. Try again shortly." }, 429, origin);

        if (isCreate) {
            const id = token();
            const hostToken = token();
            const created = await env.ROOMS.getByName(id).fetch("https://room/create", {
                method: "POST",
                body: hostToken
            });
            if (!created.ok) return response({ error: "Couldn’t create a room." }, 503, origin);
            return response({ room: id, token: hostToken }, 201, origin);
        }

        return env.ROOMS.getByName(room).fetch(request);
    }
};

export class GameRoom extends DurableObject {
    #room;
    #activity = new WeakMap();

    constructor(ctx, env) {
        super(ctx, env);
        ctx.blockConcurrencyWhile(async () => {
            this.#room = await ctx.storage.get("room");
        });
        ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    }

    async fetch(request) {
        if (new URL(request.url).pathname === "/create" && request.method === "POST") {
            if (this.#room) return new Response(null, { status: 409 });
            const hostToken = await request.text();
            this.#room = {
                hostToken, guestToken: null, game: freshGame(), version: 0,
                expires: Date.now() + idleRoomMs, awayUntil: null
            };
            await this.ctx.storage.put("room", this.#room);
            await this.ctx.storage.setAlarm(this.#room.expires);
            return new Response(null, { status: 204 });
        }

        const room = this.#room;
        if (!room || room.expires <= Date.now() || (room.awayUntil && room.awayUntil <= Date.now())) {
            return this.#reject("This invite has expired. Ask for a new one.");
        }

        const protocols = (request.headers.get("Sec-WebSocket-Protocol") || "").split(/,\s*/);
        const credential = /^(host|guest)\.([a-f0-9]{32})$/.exec(protocols[1]);
        if (protocols[0] !== protocol || !credential) return new Response(null, { status: 400 });

        const [, role, key] = credential;
        const team = role === "host" ? black : white;
        if (team === black && key !== room.hostToken) return this.#reject("This invite is no longer valid.");
        if (team === white) {
            if (room.guestToken && room.guestToken !== key) return this.#reject("This game already has two players.");
            if (!room.guestToken && !this.#seat(black)) return this.#reject("The host is offline. Try a new invite.");
            if (!room.guestToken) {
                room.guestToken = key;
                await this.ctx.storage.put("room", room);
            }
        }

        const previous = this.#seat(team);
        const [client, server] = Object.values(new WebSocketPair());
        this.ctx.acceptWebSocket(server, [String(team)]);
        server.serializeAttachment(team);
        previous?.close(4000, "Replaced by a new connection");
        if (room.awayUntil && (!room.guestToken || this.#bothPresent())) {
            room.awayUntil = null;
            await this.ctx.storage.put("room", room);
            // The earlier alarm may wake once. It will read the new deadline.
        }
        this.#broadcast();
        return new Response(null, {
            status: 101, webSocket: client, headers: { "Sec-WebSocket-Protocol": protocol }
        });
    }

    async webSocketMessage(socket, data) {
        const team = socket.deserializeAttachment();
        const room = this.#room;
        if (!room || this.#seat(team) !== socket) return;

        if (typeof data !== "string" || data.length > 1024 || !this.#allowMessage(socket)) {
            socket.close(1008, "Too many or invalid messages");
            return;
        }
        let command;
        try {
            command = JSON.parse(data);
        } catch {
            socket.close(1008, "Invalid message");
            return;
        }
        if (!command || typeof command !== "object") return;
        if (command.type === "leave") {
            await this.#closeRoom("Your friend ended the game.");
            return;
        }

        if (!this.#bothPresent() || command.version !== room.version) {
            this.#snapshot(socket);
            return;
        }
        const next = command.type === "restart" ? freshGame() :
            command.type === "move" && room.game.turn === team ? playMove(room.game, command.move) : null;
        if (!next) {
            this.#snapshot(socket);
            return;
        }

        room.game = next;
        room.version++;
        room.expires = Date.now() + idleRoomMs;
        await this.ctx.storage.put("room", room);
        this.#broadcast();
    }

    async webSocketClose(socket, code) {
        if (socket.readyState !== WebSocket.CLOSED && code !== 1006) socket.close();
        await this.#disconnected(socket);
    }

    async webSocketError(socket) {
        if (socket.readyState === socketOpen) socket.close(1011, "Connection interrupted");
        await this.#disconnected(socket);
    }

    async alarm() {
        if (!this.#room) return;
        const deadline = Math.min(this.#room.expires, this.#room.awayUntil ?? Infinity);
        if (deadline <= Date.now()) {
            await this.#closeRoom("The game room has expired.");
        } else {
            await this.ctx.storage.setAlarm(deadline);
        }
    }

    #seat(team) {
        return this.ctx.getWebSockets(String(team)).find(socket => socket.readyState === socketOpen);
    }

    #bothPresent() {
        return Boolean(this.#seat(black) && this.#seat(white));
    }

    #snapshot(socket) {
        if (socket.readyState !== socketOpen) return;
        const { game, version, guestToken } = this.#room;
        socket.send(JSON.stringify({
            type: "state", team: socket.deserializeAttachment(), game, version,
            both: this.#bothPresent(), started: Boolean(guestToken)
        }));
    }

    #broadcast() {
        for (const socket of this.ctx.getWebSockets()) this.#snapshot(socket);
    }

    #allowMessage(socket) {
        const now = Date.now();
        const activity = this.#activity.get(socket);
        if (!activity || now - activity.start >= 1000) {
            this.#activity.set(socket, { start: now, count: 1 });
            return true;
        }
        return ++activity.count <= 12;
    }

    async #disconnected(socket) {
        if (!this.#room || this.#seat(socket.deserializeAttachment())) return;
        const room = this.#room;
        if (!room.awayUntil) {
            room.awayUntil = Date.now() + reconnectMs;
            await this.ctx.storage.put("room", room);
            await this.ctx.storage.setAlarm(Math.min(room.awayUntil, room.expires));
        }
        this.#broadcast();
    }

    #reject(message) {
        const [client, server] = Object.values(new WebSocketPair());
        server.accept();
        server.send(JSON.stringify({ type: "ended", message }));
        server.close(1008, "Room unavailable");
        return new Response(null, {
            status: 101, webSocket: client, headers: { "Sec-WebSocket-Protocol": protocol }
        });
    }

    async #closeRoom(message) {
        this.#room = undefined;
        await this.ctx.storage.deleteAll();
        await this.ctx.storage.deleteAlarm();
        for (const socket of this.ctx.getWebSockets()) {
            if (socket.readyState === socketOpen) {
                socket.send(JSON.stringify({ type: "ended", message }));
                socket.close(1000, "Room closed");
            }
        }
    }
}
