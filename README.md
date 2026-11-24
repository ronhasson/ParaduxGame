# Paradux
Board game for 2 players. A recreation of the original game with online multiplayer to play with friends from across the world.

## How to play
Each of the 2 plays picks a color, black or white. **The goal of each player is to get 4 marbles of his color in a row** in any rotation.

In a turn, the player need to **select a pair of ajasent balls of a different color** ⚫️⚪️ and then can do only one of the following acations:

- **Move** the pair 1 step together to a direction of his liking (as long as there is space for both of them without rotating them)
- **Switch** between the pair ( ⚫️⚪️ -> ⚪️⚫️ )

Once someone gets 4 marbles of his color in a row, the game ends and he is the winner.

Have fun!

---

### [Continue to the game >](https://ronhasson.github.io/ParaduxGame/game.html)

## Run locally

From the repository root, serve the game with `npx serve -l 8769` and open
`http://localhost:8769/game.html`.

To test online play locally, start the room Worker in a second terminal with
`npx wrangler@4 dev --config worker/wrangler.toml --port 8787`. Start an online
game and open its invite in a separate browser tab.

The online game uses a Cloudflare Worker with a SQLite-backed Durable Object per
room. The Worker validates moves and keeps each room's board and turn available
during a brief disconnect. The frontend is served by GitHub Pages.

#### *todo*
- [x] base game
- [x] improve the ui
- [x] win condition and announce the winner
- [x] online multiplayer
- [ ] matchmaking
