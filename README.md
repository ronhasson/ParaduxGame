# Paradux

Paradux is a two-player strategy game on a hexagonal board. Play together on one device or invite a friend to join online.

[Play Paradux](https://ronhasson.github.io/ParaduxGame/game.html)

## How to play

Black moves first. On each turn, select two adjacent marbles of different colors and choose how to move the pair.

- **Slide** both marbles one space in the same direction. Keep the pair in the same orientation and use one of the highlighted destinations.
- **Switch** the marbles to swap their positions.

The first color to form a straight line of four or more marbles wins. If a move forms a winning line for both colors at once, play continues.

On a shared device, enable **Show turns in local play** in **Settings** to see whose turn it is.

## Play online

1. Open **Online** and select **Start online game**.
2. Copy the invite link and send it to your friend. The host plays black and the guest plays white.
3. Watch the toolbar marble as you play. Amber means it's your turn, gray means wait, blue means you're reconnecting, and red indicates a lost connection.

The game tries to reconnect automatically and holds the board for up to 90 seconds after a player disconnects. If you need to rejoin, use the same browser tab.

## Run locally

With Node.js and npm installed, start the static server from the repository root.

```sh
npx serve -l 8769
```

Once the server is running, open the game in your browser. [Local game](http://127.0.0.1:8769/game.html)

To try online play locally, keep the static server running and start the room Worker in a second terminal.

```sh
npx wrangler@4 dev --config worker/wrangler.toml --local --ip 127.0.0.1 --port 8787
```

With the Worker running, start an online game and open the invite in another tab.

GitHub Pages hosts the frontend. A Cloudflare Worker handles WebSocket connections, and a Durable Object validates moves and stores the board and turn for each room. The frontend and Worker share the move rules in [`rules.js`](rules.js).
