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
let pairDrag = null;
let suppressBoardClick = false;

function updateBoardControls() {
    const { black } = paraduxRules;
    const { online, team, canSend } = roomClient.status();
    disableBoard = !currentGame || Boolean(currentGame.winner) ||
        (online && (!canSend || currentGame.turn !== team));
    newGameButton.disabled = online && !canSend;
    switchButton.disabled = disableBoard || !selected2;
    boardTable?.classList.toggle("pair-selected", !switchButton.disabled);
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
    clearPairDrag();
    boardTable?.querySelectorAll(".selected, .selected2, .pairable, .moveable").forEach(cell => {
        cell.classList.remove("selected", "selected2", "pairable", "moveable");
    });
    selected = null;
    selected2 = null;
}

function tableClicked(event) {
    if (suppressBoardClick && event.detail) {
        suppressBoardClick = false;
        return;
    }
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

function startPairDrag(event) {
    if (!event.isPrimary || event.button !== 0 || pairDrag) return;
    suppressBoardClick = false;
    const source = event.target;
    if (disableBoard || !selected2 || (source !== selected && source !== selected2)) return;
    pairDrag = {
        pointerId: event.pointerId, source, startX: event.clientX, startY: event.clientY,
        preview: null, destination: null
    };
    source.setPointerCapture(event.pointerId);
}

function updatePairDrag(event) {
    const drag = pairDrag;
    if (drag?.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.preview) {
        if (Math.hypot(dx, dy) < 6) return;
        drag.preview = createPairPreview();
        suppressBoardClick = true;
        boardTable.classList.add("pair-dragging");
        if (drag.source === selected2) showMoveable(getTdPos(selected2), getTdPos(selected));
    }
    drag.preview.style.setProperty("--drag-x", `${dx}px`);
    drag.preview.style.setProperty("--drag-y", `${dy}px`);

    const destination = getDropCell(event);
    if (destination === drag.destination) return;
    drag.destination?.classList.remove("drop-target");
    drag.destination = destination;
    destination?.classList.add("drop-target");
}

function createPairPreview() {
    const preview = document.createElement("div");
    preview.className = "pair-drag-preview";
    preview.setAttribute("aria-hidden", "true");
    for (const cell of [selected, selected2]) {
        const rect = cell.getBoundingClientRect();
        const marble = document.createElement("span");
        marble.className = cell.classList.contains("friendly") ? "switch-marble-white" : "switch-marble-black";
        marble.style.left = rect.left + rect.width / 2 + "px";
        marble.style.top = rect.top + rect.height / 2 + "px";
        marble.style.width = rect.width * 0.9 + "px";
        marble.style.height = rect.height * 0.9 + "px";
        preview.append(marble);
    }
    document.body.append(preview);
    return preview;
}

function getDropCell(event) {
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest("td.moveable");
    return cell && boardTable.contains(cell) ? cell : null;
}

function endPairDrag(event) {
    const drag = pairDrag;
    if (drag?.pointerId !== event.pointerId) return;
    const drop = drag.preview && event.type === "pointerup" ? getDropCell(event) : null;
    clearPairDrag();
    if (drop) {
        const first = getTdPos(selected);
        const source = getTdPos(drag.source);
        const target = getTdPos(drop);
        submitPairMove({ x: first.x + target.x - source.x, y: first.y + target.y - source.y });
    }
    if (drag.preview && selected2) showMoveable(getTdPos(selected), getTdPos(selected2));
}

function clearPairDrag() {
    if (!pairDrag) return;
    const { source, pointerId, preview, destination } = pairDrag;
    pairDrag = null;
    preview?.remove();
    destination?.classList.remove("drop-target");
    boardTable.classList.remove("pair-dragging");
    if (source.hasPointerCapture(pointerId)) source.releasePointerCapture(pointerId);
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
