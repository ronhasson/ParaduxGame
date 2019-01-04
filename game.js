//const helper = require("./helper");
var boardDiv = document.getElementById("boardDiv");
var boardTable;
var board;
var selected = "";
var selected2 = "";
var lastSelected = "";
var insertQ = "";

function tableClicked(e) {
    console.log(getTdPos(e.target));
    console.log(selected);
    console.log(lastSelected);
    console.log(selected2);

    if (e.target.tagName != "TD") {
        return;
    }
    if (selected == "insert") {
        setUnitE(e, insertQ);
        updateLand(getTdPos(e.target).x, getTdPos(e.target).y);
        selected = "";
        return;
    }
    if (selected != "" && selected2 != "") { //3rd blick
        if (e.target.classList.contains("moveable")) {
            movePairs(selected, selected2, e.target);
        }
        selected.classList.remove("selected");
        selected2.classList.remove("selected2");
        unshowMoveable(lastSelected);
        selected = "";
        selected2 = "";
        lastSelected = "";

    } else {
        if (selected != "") { // 2nd click
            if (board.field[getTdPos(e.target).x][getTdPos(e.target).y].terrain == tType.Blocked) {
                return;
            }
            lastSelected = selected;
            selected = e.target;
            //game logic
            //unshowMoveable(lastSelected);
            if (e.target.classList.contains("pairable")) {
                selected = lastSelected;
                selected2 = e.target;
                boardTable.rows[getTdPos(selected2).y].cells[getTdPos(selected2).x].classList.add("selected2");
                console.log("paired!")
                unshowPairs(lastSelected);
                showMoveable(selected, selected2);
            } else {
                lastSelected.classList.remove("selected");
                if (selected2 != "") {
                    selected2.classList.remove("selected2");
                }
                unshowPairs(lastSelected);
                selected = "";
                selected2 = "";
                lastSelected = "";
            }

            //--

            //updateLand(getTdPos(lastSelected).x, getTdPos(lastSelected).y);
            //updateLand(getTdPos(selected).x, getTdPos(selected).y);


        } else { //first click
            if (JSON.stringify(board.field[getTdPos(e.target).x][getTdPos(e.target).y].cont) === JSON.stringify(Object.create(null))) {
                return;
            }
            boardTable.rows[getTdPos(e.target).y].cells[getTdPos(e.target).x].classList.add("selected");
            selected = e.target;

            //showMoveable(selected);
            showPairs(selected);
            updateLand(getTdPos(selected).x, getTdPos(selected).y);
        }
    }
}

function switchPlaces() {
    if (selected != "" && selected2 != "") {
        console.log("switching");
        let temp = getUnitT(selected);
        setUnitT(selected, getUnitT(selected2));
        setUnitT(selected2, temp);
        updateLand(getTdPos(selected).x, getTdPos(selected).y);
        updateLand(getTdPos(selected2).x, getTdPos(selected2).y);

        selected.classList.remove("selected");
        selected2.classList.remove("selected2");
        unshowMoveable(lastSelected);
        selected = "";
        selected2 = "";
        lastSelected = "";
    }
}

function movePairs(targetS1, targetS2, targetToLocation) {
    let ox1 = getTdPos(targetS1).x;
    let oy1 = getTdPos(targetS1).y;
    let ox2 = getTdPos(targetS2).x;
    let oy2 = getTdPos(targetS2).y;
    let tlx = getTdPos(targetToLocation).x;
    let tly = getTdPos(targetToLocation).y;
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
}

function insert(c) {
    switch (c) {
        case '~':
            selected = "insert"
            insertQ = new Unit(1);
            break;
        case '^':
            selected = "insert"
            insertQ = new Soldier(1);
            break;
        case '*':
            selected = "insert"
            insertQ = new Ace(1);
            break;
        case 'J':
            selected = "insert"
            insertQ = new Jumper(1);
            break;
        case 'S':
            selected = "insert"
            insertQ = new Spy(1);
            break;
        case 'U':
            selected = "insert"
            insertQ = new Magnet(1);
            break;
    }
}