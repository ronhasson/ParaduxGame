import * as rules from "./rules.js?v=1";

const productionRoomURL = "https://paradux-rooms.ron23231.workers.dev";
const local = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const workerPreview = window.location.hostname.endsWith(".workers.dev");
const roomURL = local ? "http://127.0.0.1:8787" :
    workerPreview ? window.location.origin : productionRoomURL;
const storageKey = "paradux-room-v2";
const invitePattern = /^[a-f0-9]{32}$/;
const protocol = "paradux-v2";
const defaultStatus = "Start a game and send the invite link to a friend.";
const reconnectingMarble = { state: "reconnecting", label: "Reconnecting" };

const onlineButton = document.getElementById("multSettBtn");
const action = document.getElementById("eMultiBtn");
const onlineStatus = document.getElementById("onlineStatus");
const invite = document.getElementById("onlineInvite");
const inviteURL = document.getElementById("inviteURL");
const leaveInvite = document.getElementById("leaveInviteBtn");
const copyStatus = document.getElementById("copyStatus");
const onlineMarble = document.getElementById("teamEmoji");

let session = null;
let creating = null;
let socket = null;
let timer;
let retryTimer;
let pongTimer;
let attempts = 0;
let version = -1;
let both = false;
let pending = false;
let team = null;
let connectionCue = null;

const labels = {
    idle: "Start online game",
    opening: "Cancel",
    ready: "Close online game",
    connecting: "Cancel",
    connected: "Disconnect",
    error: "Try again"
};

function remember(value) {
    try {
        if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
        else sessionStorage.removeItem(storageKey);
    } catch {
        // The active connection can still play if browser storage is unavailable.
    }
}

function savedSession() {
    try {
        const value = JSON.parse(sessionStorage.getItem(storageKey));
        return value && invitePattern.test(value.room) && invitePattern.test(value.token) &&
            ["host", "guest"].includes(value.role) ? value : null;
    } catch {
        return null;
    }
}

function token() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)),
        value => value.toString(16).padStart(2, "0")).join("");
}

function showState(state, message, cue = null) {
    connectionCue = cue;
    onlineStatus.textContent = message;
    onlineStatus.dataset.state = state;
    onlineButton.dataset.onlineState = state;
    action.textContent = labels[state];
    action.classList.toggle("panel-primary", state === "idle" || state === "error");
    leaveInvite.hidden = state !== "error" || (!session && !window.location.hash);
}

function showInvite(room) {
    const url = new URL(window.location.href);
    url.hash = room;
    inviteURL.value = url.href;
    invite.hidden = false;
}

function clearInvite() {
    invite.hidden = true;
    inviteURL.value = "";
    copyStatus.textContent = "";
}

function clearHash() {
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(history.state, "", url);
}

function finishOnline(message = defaultStatus) {
    const previous = socket;
    socket = null;
    creating?.abort();
    creating = null;
    clearTimeout(timer);
    clearTimeout(retryTimer);
    clearTimeout(pongTimer);
    if (previous && previous.readyState < WebSocket.CLOSING) previous.close();
    session = null;
    remember(null);
    clearHash();
    attempts = 0;
    version = -1;
    team = null;
    both = false;
    pending = false;
    clearInvite();
    clearSelection();
    showState("idle", message);
    updateBoardControls();
}

function leaveOnline() {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "leave" }));
    finishOnline();
}

async function createRoom() {
    const controller = new AbortController();
    creating = controller;
    const deadline = setTimeout(() => controller.abort(), 12000);
    showState("opening", "Creating your invite…");
    clearSelection();
    updateBoardControls();
    try {
        const result = await fetch(roomURL + "/rooms", { method: "POST", signal: controller.signal });
        const data = await result.json().catch(() => ({}));
        if (creating !== controller) return;
        if (!result.ok || !invitePattern.test(data.room) || !invitePattern.test(data.token)) {
            throw new Error(data.error || "Couldn’t create a game. Try again shortly.");
        }
        creating = null;
        session = { room: data.room, token: data.token, role: "host" };
        remember(session);
        connect();
    } catch (error) {
        if (creating === controller) {
            creating = null;
            showState("error", error.name === "AbortError" ? "Creating the game timed out. Try again." :
                error.message || "Couldn’t reach the game service. Try again.");
            updateBoardControls();
        }
    } finally {
        clearTimeout(deadline);
    }
}

function reconnect() {
    if (!session) return;
    both = false;
    pending = false;
    clearSelection();
    if (attempts >= 5) {
        showState("error", "Connection interrupted. Try to rejoin the game.", {
            state: "disconnected", label: "Connection lost"
        });
    } else {
        showState("connecting", "Reconnecting to the game…", reconnectingMarble);
        retryTimer = setTimeout(connect, Math.min(8000, 500 * 2 ** attempts++));
    }
    updateBoardControls();
}

function handleDisconnect(current, code) {
    if (socket !== current) return;
    socket = null;
    clearTimeout(timer);
    clearTimeout(pongTimer);
    if (code === 4000) finishOnline("This game was opened in another tab.");
    else reconnect();
}

function closeStalledSocket(current) {
    if (socket !== current) return;
    // Start the retry even if the old socket cannot finish its close handshake.
    handleDisconnect(current);
    if (current.readyState < WebSocket.CLOSING) current.close(4001, "Connection timed out");
}

function connect() {
    if (!session || !roomURL) return;
    clearTimeout(retryTimer);
    both = false;
    showState("connecting", version < 0 ? "Connecting to the game…" : "Reconnecting to the game…", reconnectingMarble);
    updateBoardControls();
    const url = new URL("/rooms/" + session.room, roomURL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const current = new WebSocket(url, [protocol, session.role + "." + session.token]);
    socket = current;
    timer = setTimeout(() => closeStalledSocket(current), 9000);

    current.addEventListener("message", event => {
        if (socket !== current) return;
        if (event.data === "pong") {
            clearTimeout(pongTimer);
            return;
        }
        const message = JSON.parse(event.data);
        if (message.type === "ended") {
            finishOnline(message.message);
        } else if (message.type === "state") {
            clearTimeout(timer);
            attempts = 0;
            both = message.both;
            team = message.team;
            pending = false;
            if (both) {
                clearInvite();
                showState("connected", "Your friend is connected.");
            } else if (message.started) {
                clearInvite();
                showState("connecting", "Waiting for your friend to reconnect…", {
                    state: "disconnected", label: "Your friend disconnected"
                });
            } else {
                if (session.role === "host") showInvite(session.room);
                showState("ready", "Invite ready. Waiting for your friend to join.");
            }
            if (version !== message.version) {
                version = message.version;
                renderGame(message.game);
            } else updateBoardControls();
        }
    });
    current.addEventListener("close", event => handleDisconnect(current, event.code));
}

function checkConnection() {
    if (document.visibilityState !== "visible" || socket?.readyState !== WebSocket.OPEN) return;
    const current = socket;
    clearTimeout(pongTimer);
    current.send("ping");
    pongTimer = setTimeout(() => closeStalledSocket(current), 6000);
}

document.addEventListener("visibilitychange", checkConnection);
setInterval(checkConnection, 25000);

function toggleOnline() {
    if (creating || socket || (session && attempts < 5)) {
        leaveOnline();
    } else if (!roomURL) {
        showState("error", "Online play is unavailable on this preview.");
    } else if (session) {
        attempts = 0;
        connect();
    } else {
        createRoom();
    }
}

function status() {
    return { online: Boolean(session || creating), team, canSend: socket?.readyState === WebSocket.OPEN && both && !pending };
}

function send(type, move) {
    if (!status().canSend) return;
    pending = true;
    clearSelection();
    updateBoardControls();
    socket.send(JSON.stringify({ type, version, move }));
}

function updateTurn(canPlay) {
    const color = team === rules.black ? "Black" : team === rules.white ? "White" : "";
    onlineMarble.hidden = !color;
    if (!color) return;

    const label = connectionCue?.label || (canPlay ? "Your turn" : "");
    onlineMarble.dataset.color = color.toLowerCase();
    onlineMarble.dataset.state = connectionCue?.state || (canPlay ? "turn" : "waiting");
    onlineMarble.setAttribute("aria-label", label ? color + " · " + label : color);
    onlineMarble.title = label || "You play " + color.toLowerCase();
}

window.paraduxRules = rules;
window.roomClient = { status, send, updateTurn };
window.toggleOnline = toggleOnline;
window.leaveOnline = leaveOnline;

renderGame(rules.freshGame());
const hash = window.location.hash.slice(1);
const saved = savedSession();
if (roomURL && (hash || saved)) {
    toggleDropdown(onlineButton);
    if (hash && !invitePattern.test(hash)) {
        finishOnline("This invite is invalid. Ask your friend for a new link.");
    } else {
        session = hash && saved?.room !== hash ? { room: hash, token: token(), role: "guest" } : saved;
        remember(session);
        connect();
    }
}
