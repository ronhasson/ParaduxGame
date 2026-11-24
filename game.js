const boardDiv = document.getElementById("boardDiv");
const newGameButton = document.getElementById("newGameBtn");
const switchButton = document.getElementById("switchBtn");
const localTurnMarble = document.getElementById("localTurnMarble");
const gameResult = document.getElementById("gameResult");

let boardTable;
let currentGame;
let selected = null;
let selected2 = null;
let disableBoard = false;

function updateBoardControls() {
    const { black } = paraduxRules;
    const { online, team, canSend } = roomClient.status();
    disableBoard = !currentGame || Boolean(currentGame.winner) ||
        (online && (!canSend || currentGame.turn !== team));
    newGameButton.disabled = online && !canSend;
    switchButton.disabled = disableBoard || !selected2;
    tempHover(!disableBoard);

    localTurnMarble.hidden = !localTurnLabels.checked || online || disableBoard;
    if (!localTurnMarble.hidden) {
        const blackTurn = currentGame.turn === black;
        localTurnMarble.dataset.color = blackTurn ? "black" : "white";
        localTurnMarble.setAttribute("aria-label", blackTurn ? "Black’s turn" : "White’s turn");
    }
    roomClient.updateTurn(!disableBoard);
    const winner = currentGame?.winner;
    gameResult.textContent = winner ? (winner === black ? "Black wins" : "White wins") : "";
}

function clearSelection() {
    boardTable?.querySelectorAll(".selected, .selected2, .pairable, .moveable").forEach(cell => {
        cell.classList.remove("selected", "selected2", "pairable", "moveable");
    });
    selected = null;
    selected2 = null;
}

function tableClicked(event) {
    const cell = event.target;
    if (cell.tagName !== "TD" || disableBoard) return;

    const position = getTdPos(cell);
    if (selected2) {
        if (cell.classList.contains("moveable")) submitPairMove(position);
        else clearSelection();
    } else if (selected) {
        if (cell.classList.contains("blocked")) return;
        if (cell.classList.contains("pairable")) {
            selected2 = cell;
            selected2.classList.add("selected2");
            boardTable.querySelectorAll(".pairable").forEach(partner => partner.classList.remove("pairable"));
            showMoveable(getTdPos(selected), position);
        } else clearSelection();
    } else if (currentGame.cells[paraduxRules.boardIndex(position)] > 0) {
        selected = cell;
        selected.classList.add("selected");
        showPairs(position);
    }
    updateBoardControls();
}

function submitPairMove(target = null) {
    if (disableBoard || !selected || !selected2) return;
    const move = { first: getTdPos(selected), second: getTdPos(selected2), target };
    if (roomClient.status().online) {
        roomClient.send("move", move);
        return;
    }
    const next = paraduxRules.playMove(currentGame, move);
    if (next) renderGame(next);
}

function requestNewGame() {
    if (roomClient.status().online) roomClient.send("restart");
    else renderGame(paraduxRules.freshGame());
}
