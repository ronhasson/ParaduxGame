//const helper = require("./helper");
var boardDiv = document.getElementById("boardDiv");
var boardTable;
var board;
let selected = null;
let selected2 = null;
let localTurn = 2;
let winningTeam = null;
var disableBoard = false;

const switchButton = document.getElementById("switchBtn");
const localTurnMarble = document.getElementById("localTurnMarble");
const gameResult = document.getElementById("gameResult");

function updateBoardControls() {
    switchButton.disabled = disableBoard || !selected2;

    localTurnMarble.hidden = !localTurnLabels.checked || !board || Boolean(connection) || disableBoard;
    if (!localTurnMarble.hidden) {
        localTurnMarble.textContent = localTurn === 2 ? "⚫" : "⚪";
        localTurnMarble.setAttribute("aria-label", localTurn === 2 ? "Black’s turn" : "White’s turn");
    }

    const result = winningTeam ? (winningTeam === 2 ? "Black wins" : "White wins") : "";
    if (gameResult.textContent !== result) {
        gameResult.textContent = result;
    }
}

function clearSelection() {
    if (selected) {
        unshowPairs(selected);
        unshowMoveable(selected);
        selected.classList.remove("selected");
    }
    if (selected2) {
        selected2.classList.remove("selected2");
    }
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
            const first = selected;
            const second = selected2;
            clearSelection();
            movePairs(first, second, cell);
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
            unshowPairs(selected);
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

function switchPlaces(firstPosition, secondPosition, fromPeer = false) {
    if (!fromPeer && (disableBoard || !selected2)) {
        return;
    }

    const first = fromPeer ? boardTable.rows[firstPosition.y].cells[firstPosition.x] : selected;
    const second = fromPeer ? boardTable.rows[secondPosition.y].cells[secondPosition.x] : selected2;
    clearSelection();

    const firstUnit = getUnitT(first);
    setUnitT(first, getUnitT(second));
    setUnitT(second, firstUnit);
    updateLand(getTdPos(first).x, getTdPos(first).y);
    updateLand(getTdPos(second).x, getTdPos(second).y);

    if (!fromPeer) {
        endTurn(first, second);
        if (connection != null) {
            connection.send({
                func: "switchPlaces",
                p1: getTdPos(first),
                p2: getTdPos(second),
                p3: true
            });
        }
    }
    updateBoardControls();
}

function movePairs(targetS1, targetS2, targetToLocation, fromPeer = false) {
    if (fromPeer) {
        clearSelection();
        var ox1 = (targetS1).x;
        var oy1 = (targetS1).y;
        var ox2 = (targetS2).x;
        var oy2 = (targetS2).y;
        var tlx = (targetToLocation).x;
        var tly = (targetToLocation).y;
        var targetS1 = boardTable.rows[targetS1.y].cells[targetS1.x];
        var targetS2 = boardTable.rows[targetS2.y].cells[targetS2.x];
        var targetToLocation = boardTable.rows[targetToLocation.y].cells[targetToLocation.x];
    } else {
        var ox1 = getTdPos(targetS1).x;
        var oy1 = getTdPos(targetS1).y;
        var ox2 = getTdPos(targetS2).x;
        var oy2 = getTdPos(targetS2).y;
        var tlx = getTdPos(targetToLocation).x;
        var tly = getTdPos(targetToLocation).y;
    }

    let relX = tlx - ox1;
    let relY = tly - oy1;

    let obj1 = getUnitT(targetS1);
    let obj2 = getUnitT(targetS2);

    setUnitT(targetS1, Object.create(null));
    setUnitT(targetS2, Object.create(null));

    setUnit(ox1 + relX, oy1 + relY, obj1);
    setUnit(ox2 + relX, oy2 + relY, obj2);
    updateLand(ox1, oy1);
    updateLand(ox2, oy2);
    updateLand(ox1 + relX, oy1 + relY);
    updateLand(ox2 + relX, oy2 + relY);

    if (!fromPeer) {
        endTurn(boardTable.rows[oy1 + relY].cells[ox1 + relX], boardTable.rows[oy2 + relY].cells[ox2 + relX]);
        if (connection != null) {
            connection.send({
                func: "movePairs",
                p1: getTdPos(targetS1),
                p2: getTdPos(targetS2),
                p3: getTdPos(targetToLocation),
                p4: true
            })
        }
    }
}

function endTurn(selected1, selected2) {
    if (connection != null) {
        tempHover(false);
        disableBoard = true;
        document.getElementById("teamEmoji").classList.remove("myTurn");
    } else {
        localTurn = localTurn === 2 ? 1 : 2;
    }
    checkVictory(selected1, selected2);
}