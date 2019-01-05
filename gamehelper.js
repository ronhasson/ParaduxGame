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

function setUnitT(t, unit) {
    setUnit(getTdPos(t).x, getTdPos(t).y, unit);
}

function drawBoard() {
    console.log("drawing board");
    board = new Board(7);
    boardDiv.innerHTML = "";
    boardTable = document.createElement("table");
    boardTable.border = 1;

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

    boardTable.addEventListener("click", tableClicked);

    updateAllLand();
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
    if (JSON.stringify(board.field[x][y].cont) !== JSON.stringify(Object.create(null))) {
        boardTable.rows[y].cells[x].innerHTML = board.field[x][y].cont.toString();
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

function showPairs(target) {
    let arr = [
        [1, 0],
        [0, 1],
        [-1, 1],
        [0, -1],
        [-1, 0],
        [1, -1]
    ];

    for (let move = 0; move < arr.length; move++) {
        let x = getTdPos(target).x;
        let y = getTdPos(target).y;

        x += arr[move][0];
        y += arr[move][1];

        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            continue;
        }
        if (JSON.stringify(board.field[x][y].cont) === JSON.stringify(Object.create(null)) || boardTable.rows[y].cells[x].classList.contains("blocked")) {
            continue;
        }
        if (board.field[x][y].cont.team == getUnit(getTdPos(target).x, getTdPos(target).y).team) {
            continue;
        }

        boardTable.rows[y].cells[x].classList.add("pairable");
    }

}

function unshowPairs(target) {
    let arr = [
        [1, 0],
        [0, 1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [1, -1]
    ];

    for (let move = 0; move < arr.length; move++) {
        let x = getTdPos(target).x;
        let y = getTdPos(target).y;

        x += arr[move][0];
        y += arr[move][1];

        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            continue;
        }
        if (JSON.stringify(board.field[x][y].cont) === JSON.stringify(Object.create(null)) || boardTable.rows[y].cells[x].classList.contains("blocked")) {
            continue;
        }
        if (board.field[x][y].cont.team == getUnit(getTdPos(target).x, getTdPos(target).y).team) {
            continue;
        }

        boardTable.rows[y].cells[x].classList.remove("pairable");
    }

}

function showMoveable(target, target2) {
    let x = getTdPos(target).x;
    let y = getTdPos(target).y;
    let x2 = getTdPos(target2).x;
    let y2 = getTdPos(target2).y;
    let arr = [
        [1, 0],
        [0, 1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [1, -1]
    ];

    for (let move = 0; move < arr.length; move++) {
        x = getTdPos(target).x;
        y = getTdPos(target).y;
        x2 = getTdPos(target2).x;
        y2 = getTdPos(target2).y;

        x += arr[move][0];
        y += arr[move][1];
        x2 += arr[move][0];
        y2 += arr[move][1];

        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            continue;
        }
        if (y2 < 0 || y2 > board.size - 1 || x2 < 0 || x2 > board.size - 1) {
            continue;
        }
        if ((JSON.stringify(board.field[x][y].cont) !== JSON.stringify(Object.create(null)) && !boardTable.rows[y].cells[x].classList.contains("selected2")) || boardTable.rows[y].cells[x].classList.contains("blocked")) {
            continue;
        }
        if ((JSON.stringify(board.field[x2][y2].cont) !== JSON.stringify(Object.create(null)) && !boardTable.rows[y2].cells[x2].classList.contains("selected")) || boardTable.rows[y2].cells[x2].classList.contains("blocked")) {
            continue;
        }
        boardTable.rows[y].cells[x].classList.add("moveable");

    }
}

function unshowMoveable(target) {
    let x = getTdPos(target).x;
    let y = getTdPos(target).y;
    let arr = [
        [1, 0],
        [0, 1],
        [0, -1],
        [-1, 0],
        [-1, 1],
        [1, -1]
    ];

    for (let move = 0; move < arr.length; move++) {
        x = getTdPos(target).x;
        y = getTdPos(target).y;

        x += arr[move][0];
        y += arr[move][1];

        if (y < 0 || y > board.size - 1 || x < 0 || x > board.size - 1) {
            continue;
        }
        if (boardTable.rows[y].cells[x].classList.contains("blocked")) {
            continue;
        }
        boardTable.rows[y].cells[x].classList.remove("moveable");

    }
}