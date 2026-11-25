function getTdPos(element) {
    return { x: element.cellIndex, y: element.parentElement.rowIndex };
}

function renderGame(game) {
    const { boardSize, black, white, blocked } = paraduxRules;
    clearSelection();
    currentGame = game;
    if (!boardTable) {
        boardTable = document.createElement("table");
        for (let y = 0; y < boardSize; y++) {
            const row = document.createElement("tr");
            boardTable.appendChild(row);
            for (let x = 0; x < boardSize; x++) row.appendChild(document.createElement("td"));
        }
        boardDiv.appendChild(boardTable);
        boardTable.addEventListener("click", tableClicked);
        boardTable.addEventListener("pointerdown", startPairDrag);
        boardTable.addEventListener("pointermove", updatePairDrag);
        boardTable.addEventListener("pointerup", endPairDrag);
        boardTable.addEventListener("pointercancel", endPairDrag);
        boardTable.addEventListener("lostpointercapture", endPairDrag);
        changeStyle(localStorage.getItem("style") || "def");
    }

    const winning = new Set(game.winningCells);
    game.cells.forEach((piece, index) => {
        const cell = boardTable.rows[Math.floor(index / boardSize)].cells[index % boardSize];
        cell.classList.toggle("blocked", piece === blocked);
        cell.classList.toggle("friendly", piece === white);
        cell.classList.toggle("enemy", piece === black);
        cell.classList.toggle("natural", piece <= 0);
        cell.classList.toggle("winningBall", winning.has(index));
    });
    updateBoardControls();
}

function showPairs(first) {
    const { isPlayablePair, pairDirections } = paraduxRules;
    for (const [dx, dy] of pairDirections) {
        const second = { x: first.x + dx, y: first.y + dy };
        if (isPlayablePair(currentGame.cells, first, second)) {
            boardTable.rows[second.y].cells[second.x].classList.add("pairable");
        }
    }
}

function showMoveable(first, second) {
    const { slideDestinations, pairDirections } = paraduxRules;
    boardTable.querySelectorAll(".moveable").forEach(cell => cell.classList.remove("moveable"));
    for (const [dx, dy] of pairDirections) {
        const target = { x: first.x + dx, y: first.y + dy };
        if (slideDestinations(currentGame.cells, first, second, target)) {
            boardTable.rows[target.y].cells[target.x].classList.add("moveable");
        }
    }
}
