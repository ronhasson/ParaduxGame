//const helper = require("./helper");
var boardDiv = document.getElementById("boardDiv");
var boardTable;
var board;
var selected = "";
var selected2 = "";
var lastSelected = "";
var insertQ = "";

var disableBoard = false;

function tableClicked(e) {
    console.log(getTdPos(e.target));
    //console.log(selected);
    //console.log(lastSelected);
    //console.log(selected2);
    console.log(e.target)

    if (e.target.tagName != "TD" || disableBoard) {
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

function switchPlaces(Pselected = "", Pselected2 = "", fromPeer = false) {
    if (Pselected != "") {
        selected = boardTable.rows[Pselected.y].cells[Pselected.x]
        selected2 = boardTable.rows[Pselected2.y].cells[Pselected2.x];
    }
    if (selected != "" && selected2 != "") {
        console.log("switching");
        let temp = getUnitT(selected);
        setUnitT(selected, getUnitT(selected2));
        setUnitT(selected2, temp);
        updateLand(getTdPos(selected).x, getTdPos(selected).y);
        updateLand(getTdPos(selected2).x, getTdPos(selected2).y);

        selected.classList.remove("selected");
        selected2.classList.remove("selected2");
        unshowMoveable(selected);

        if (!fromPeer) {
            endTurn(selected, selected2);
            if (connection != null) {
                connection.send({
                    func: "switchPlaces",
                    p1: getTdPos(selected),
                    p2: getTdPos(selected2),
                    p3: true
                })
            }
        }

        selected = "";
        selected2 = "";
        lastSelected = "";
    }
}

function movePairs(targetS1, targetS2, targetToLocation, fromPeer = false) {
    if (fromPeer) {
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
    }
    checkVictory(selected1, selected2);
}