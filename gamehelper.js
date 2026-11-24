function getTdPos(element) {
    return {
        x: element.cellIndex,
        y: element.parentElement.rowIndex
    }
}

function getUnit(x, y) {
    return board.field[x][y].cont;
}

function getUnitE(e) {
    return getUnit(getTdPos(e.target).x, getTdPos(e.target).y);
}

function getUnitT(t) {
    return getUnit(getTdPos(t).x, getTdPos(t).y);
}

function setUnit(x, y, unit) {
    board.field[x][y].cont = unit;
}

function setUnitE(e, unit) {
    setUnit(getTdPos(e.target).x, getTdPos(e.target).y, unit);
}

function drawBoard() {
    clearSelection();
    turnTeam = 2;
    winningTeam = null;
    board = new Board(7);
    boardDiv.innerHTML = "";
    boardTable = document.createElement("table");

    for (var i = 0; i < board.size; ++i) {
        var row = document.createElement("tr");
        boardTable.appendChild(row);

        for (var j = 0; j < board.size; ++j) {
            var cell = document.createElement("td");
            row.appendChild(cell);
            //cell.appendChild(document.createTextNode(""));
            if (board.field[i][j].terrain == tType.Blocked) {
                boardTable.rows[i].cells[j].classList.add("blocked");
            }
            if (board.field[i][j].terrain == tType.Hidden && i + j < 7) {
                boardTable.rows[i].cells[j].classList.add("hiddenFriendly");
            }
            if (board.field[i][j].terrain == tType.Hidden && i + j >= 7) {
                boardTable.rows[i].cells[j].classList.add("hidden");
            }
        };
    };

    boardDiv.appendChild(boardTable);
    changeStyle(localStorage.getItem("style") || "def");
    boardTable.addEventListener("click", tableClicked);

    updateAllLand();
    updateBoardControls();
}

function updateLand(x, y) {
    switch (board.field[x][y].terrain) {
        case tType.Normal:
            boardTable.rows[y].cells[x].classList.remove("blocked", "hiddenFriendly", "hidden");
            break;
        case tType.Blocked:
            boardTable.rows[y].cells[x].classList.remove("hiddenFriendly", "hidden");
            boardTable.rows[y].cells[x].classList.add("blocked");
            break;
        case tType.Hidden:
            boardTable.rows[y].cells[x].classList.remove("blocked");
            if (tType.Hidden && x + y < 7) {
                boardTable.rows[y].cells[x].classList.add("hiddenFriendly");
            }
            if (tType.Hidden && x + y >= 7) {
                boardTable.rows[y].cells[x].classList.add("hidden");
            }
            break;
    }
    if (board.field[x][y].cont.team == 1) {
        boardTable.rows[y].cells[x].classList.remove("enemy", "natural");
        boardTable.rows[y].cells[x].classList.add("friendly");
    } else if (board.field[x][y].cont.team == 2) {
        boardTable.rows[y].cells[x].classList.remove("friendly", "natural");
        boardTable.rows[y].cells[x].classList.add("enemy");
    } else {
        boardTable.rows[y].cells[x].classList.remove("friendly", "enemy");
        boardTable.rows[y].cells[x].classList.add("natural");
    }
}

function updateAllLand() {
    for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
            updateLand(i, j);
        }
    }
}

const pairDirections = [[1, 0], [0, 1], [-1, 1], [0, -1], [-1, 0], [1, -1]];

function playableLand(position) {
    if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y)) {
        return null;
    }
    const land = board.field[position.x]?.[position.y];
    return land && land.terrain !== tType.Blocked ? land : null;
}

function isPairDirection(dx, dy) {
    return pairDirections.some(([x, y]) => x === dx && y === dy);
}

function isPlayablePair(first, second) {
    const firstTeam = playableLand(first)?.cont.team;
    const secondTeam = playableLand(second)?.cont.team;
    return firstTeam && secondTeam && firstTeam !== secondTeam &&
        isPairDirection(second.x - first.x, second.y - first.y);
}

function isOpenForPair(position, occupiedByPair) {
    const land = playableLand(position);
    return land && (!land.cont.team || (position.x === occupiedByPair.x && position.y === occupiedByPair.y));
}

function slideDestinations(first, second, target) {
    if (!target || !Number.isInteger(target.x) || !Number.isInteger(target.y)) {
        return null;
    }
    const dx = target.x - first.x;
    const dy = target.y - first.y;
    if (!isPairDirection(dx, dy)) {
        return null;
    }
    const secondEnd = { x: second.x + dx, y: second.y + dy };
    return isOpenForPair(target, second) && isOpenForPair(secondEnd, first)
        ? [target, secondEnd]
        : null;
}

function showPairs(cell) {
    const first = getTdPos(cell);
    for (const [dx, dy] of pairDirections) {
        const second = { x: first.x + dx, y: first.y + dy };
        if (isPlayablePair(first, second)) {
            boardTable.rows[second.y].cells[second.x].classList.add("pairable");
        }
    }
}

function showMoveable(firstCell, secondCell) {
    const first = getTdPos(firstCell);
    const second = getTdPos(secondCell);
    for (const [dx, dy] of pairDirections) {
        const target = { x: first.x + dx, y: first.y + dy };
        if (slideDestinations(first, second, target)) {
            boardTable.rows[target.y].cells[target.x].classList.add("moveable");
        }
    }
}

function checkVictory(s1, s2) {
    let arr = [
        [1, 0],
        [0, 1],
        [1, -1]
    ];

    let b1, b2 = false;
    let s10, s11, s12, s20, s21, s22;

    s10 = check4(s1, arr[0]);
    s11 = check4(s1, arr[1]);
    s12 = check4(s1, arr[2]);

    s20 = check4(s2, arr[0]);
    s21 = check4(s2, arr[1]);
    s22 = check4(s2, arr[2]);


    b1 = s10 || s11 || s12;
    b2 = s20 || s21 || s22;

    if (b1 && b2) { // Both colors lined up at once, so play continues.
        return;
    }
    if (b1) {
        winningTeam = getUnitT(s1).team;
        if (s10)
            markWinner(s1, arr[0]);
        if (s11)
            markWinner(s1, arr[1]);
        if (s12)
            markWinner(s1, arr[2]);
    }
    if (b2) {
        winningTeam = getUnitT(s2).team;
        if (s20)
            markWinner(s2, arr[0]);
        if (s21)
            markWinner(s2, arr[1]);
        if (s22)
            markWinner(s2, arr[2]);
    }
}

function check4(target, dir) {
    let x = getTdPos(target).x;
    let y = getTdPos(target).y;
    let color = board.field[x][y].cont.team;

    let count = 0;
    while (JSON.stringify(board.field[x][y].cont) !== JSON.stringify(Object.create(null)) && board.field[x][y].cont.team == color) {
        x += dir[0];
        y += dir[1];
        count++;
        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            break;
        }

    }

    x = getTdPos(target).x;
    y = getTdPos(target).y;
    let revDir = dir.map(obj => {
        return obj * -1
    })
    count--;
    while (JSON.stringify(board.field[x][y].cont) !== JSON.stringify(Object.create(null)) && board.field[x][y].cont.team == color) {
        x += revDir[0];
        y += revDir[1];
        count++;
        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            break;
        }

    }
    //console.log("team: " + color + "; in a row: " + count);
    return (count >= 4) ? true : false;
}

function markWinner(target, dir) {
    let x = getTdPos(target).x;
    let y = getTdPos(target).y;
    let color = board.field[x][y].cont.team;

    while (JSON.stringify(board.field[x][y].cont) !== JSON.stringify(Object.create(null)) && board.field[x][y].cont.team == color) {
        boardTable.rows[y].cells[x].classList.add("winningBall");
        x += dir[0];
        y += dir[1];
        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            break;
        }

    }

    x = getTdPos(target).x;
    y = getTdPos(target).y;
    let revDir = dir.map(obj => {
        return obj * -1
    })

    while (JSON.stringify(board.field[x][y].cont) !== JSON.stringify(Object.create(null)) && board.field[x][y].cont.team == color) {
        boardTable.rows[y].cells[x].classList.add("winningBall");
        x += revDir[0];
        y += revDir[1];
        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            break;
        }

    }

}