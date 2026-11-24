const boardDiv = document.getElementById("boardDiv");
let boardTable;
let board;
let selected = null;
let selected2 = null;
let turnTeam = 2;
let winningTeam = null;
let disableBoard = false;

const newGameButton = document.getElementById("newGameBtn");
const switchButton = document.getElementById("switchBtn");
const localTurnMarble = document.getElementById("localTurnMarble");
const gameResult = document.getElementById("gameResult");

function updateBoardControls() {
    const online = onlineTeam !== null;
    const readyForOnlineTurn = connection?.open && roundNumber > 0 && !waitingForRestart;
    disableBoard = Boolean(winningTeam) || (online && (!readyForOnlineTurn || turnTeam !== onlineTeam));
    newGameButton.disabled = online && !readyForOnlineTurn;
    switchButton.disabled = disableBoard || !selected2;
    tempHover(!disableBoard);

    localTurnMarble.hidden = !localTurnLabels.checked || !board || online || disableBoard;
    if (!localTurnMarble.hidden) {
        localTurnMarble.textContent = turnTeam === 2 ? "⚫" : "⚪";
        localTurnMarble.setAttribute("aria-label", turnTeam === 2 ? "Black’s turn" : "White’s turn");
    }
    updateOnlineTurn();

    const result = winningTeam ? (winningTeam === 2 ? "Black wins" : "White wins") : "";
    if (gameResult.textContent !== result) {
        gameResult.textContent = result;
    }
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
    if (cell.tagName !== "TD" || disableBoard) {
        return;
    }

    if (selected2) {
        if (cell.classList.contains("moveable")) {
            submitPairMove(getTdPos(cell));
        } else {
            clearSelection();
        }
    } else if (selected) {
        if (cell.classList.contains("blocked")) {
            return;
        }
        if (cell.classList.contains("pairable")) {
            selected2 = cell;
            selected2.classList.add("selected2");
            boardTable.querySelectorAll(".pairable").forEach(partner => partner.classList.remove("pairable"));
            showMoveable(selected, selected2);
        } else {
            clearSelection();
        }
    } else if (getUnitT(cell).team) {
        selected = cell;
        selected.classList.add("selected");
        showPairs(selected);
    }
    updateBoardControls();
}

function submitPairMove(target = null) {
    if (disableBoard || !selected || !selected2) {
        return;
    }
    const move = { first: getTdPos(selected), second: getTdPos(selected2), target };
    if (applyPairMove(move)) {
        sendOnlineMove(move);
    }
}

function applyPairMove(move) {
    if (!move || !isPlayablePair(move.first, move.second)) {
        return false;
    }

    const { first, second, target } = move;
    const firstUnit = getUnit(first.x, first.y);
    const secondUnit = getUnit(second.x, second.y);
    const destinations = target === null ? [second, first] : slideDestinations(first, second, target);

    if (!destinations) {
        return false;
    }

    clearSelection();
    setUnit(first.x, first.y, Object.create(null));
    setUnit(second.x, second.y, Object.create(null));
    const [firstEnd, secondEnd] = destinations;
    setUnit(firstEnd.x, firstEnd.y, firstUnit);
    setUnit(secondEnd.x, secondEnd.y, secondUnit);

    for (const { x, y } of [first, second, firstEnd, secondEnd]) {
        updateLand(x, y);
    }

    checkVictory(boardTable.rows[firstEnd.y].cells[firstEnd.x], boardTable.rows[secondEnd.y].cells[secondEnd.x]);
    turnTeam = turnTeam === 2 ? 1 : 2;
    updateBoardControls();
    return true;
}
