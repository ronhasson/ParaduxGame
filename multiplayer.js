var peer = null;
var connection = null;

let multSettBtn = document.getElementById("multSettBtn");
let enbMultiBtn = document.getElementById("eMultiBtn");
let multiText = document.getElementById("fontTextMul");
let MultiIdText = document.getElementById("fontTextID");
let emojiText = document.getElementById("teamEmoji");
let linkBtn = document.getElementById("linkBtn");

let t1 = "⚪";
let t2 = "⚫";
var imTeam;

if (window.location.hash != "") {
    enableMulti();
    //connectTo(location.hash.substr(1));
}

function enableMulti() {
    //var myWorker = new Worker('multiplayerWorker.js');

    peer = new Peer(null, {
        host: 'peer.ronhasson.cyou',
        //path: '/',
        key: "ron",
        secure: false
    })
    console.log(peer);

    peer.on('open', function (id) {
        console.log('My peer ID is: ' + id);
        multSettBtn.style.color = "purple";
        enbMultiBtn.value = "X";
        enbMultiBtn.setAttribute('onclick', 'disableMulti();');
        multiText.innerText = "Disable multiplayer";
        MultiIdText.innerHTML = "ID: " + id;
        linkBtn.disabled = false;
        if (window.location.hash != "") {
            connectTo(location.hash.substr(location.hash.lastIndexOf("#") + 1));
        }
    });

    peer.on('connection', function (conn) {
        if (connection != null) { //redject other ppl
            console.info("game is full - another guy tries to connect");
            peer.disconnect(); //for some reason, the code below doesnt work at all. this is a temp workaround (it thinks its connected all the time and doesnt send anything)
            let connID = conn.peer;
            console.log("another guy tries to connect");
            console.log(conn);
            setTimeout(peer.connections[connID][0].send({
                func: "alert",
                p1: "Game already have 2 players inside"
            }), 500);
            conn.close();
            return;
        }
        emojiText.innerText = t2;
        emojiText.classList.add("myTurn");
        imTeam = 2;
        connectionLogic(conn);
    });

    peer.on('error', function (err) {
        console.error(err);
        alert(err.message);
    });
}

function connectTo(hisID) {
    emojiText.innerText = t1;
    emojiText.classList.remove("myTurn");
    tempHover(false);
    disableBoard = true;
    imTeam = 1;
    connection = peer.connect(hisID);
    console.log("Connecting to: " + hisID);
    connectionLogic(connection);
}

function disableMulti() {
    console.log("disable multi")
    //close connection
    if (connection != null) {
        connection.close();
        connection = null;
    }
    //close peer
    peer.destroy();
    peer = null;
    //style change
    multSettBtn.style.color = "black";
    enbMultiBtn.value = "@";
    enbMultiBtn.setAttribute('onclick', 'enableMulti();');
    multiText.innerText = "Enable multiplayer";
    MultiIdText.innerHTML = "ID: ";
    linkBtn.disabled = true;
    emojiText.innerText = "";
    emojiText.classList.remove("myTurn");
    //remove hash
    window.location.hash = ""
    disableBoard = false;
    //???
}

function connectionLogic(conn) {
    connection = conn;
    conn.on('open', function () {
        multSettBtn.style.color = "green";
        drawBoard();
        // Receive messages
        conn.on('data', function (data) {
            console.log('Received', data);

            tempHover(true);
            disableBoard = false;

            switch (data.func) {
                case "switchPlaces":
                    switchPlaces(data.p1, data.p2, true);
                    checkVictory(boardTable.rows[data.p1.y].cells[data.p1.x], boardTable.rows[data.p2.y].cells[data.p2.x]);
                    break;
                case "movePairs":
                    movePairs(data.p1, data.p2, data.p3, true);
                    checkVictory(boardTable.rows[data.p1.y].cells[data.p1.x], boardTable.rows[data.p2.y].cells[data.p2.x]);
                    break;
                case "new":
                    drawBoard(true);
                    break;
                case "alert":
                    alert(data.p1);
                    break;
            }

            emojiText.classList.add("myTurn");
        });

        // Send messages
        conn.send('Hello!');
    });
    conn.on('close', function () {
        disableMulti()
        console.info("Connection closed!")
    });
    conn.on('error', function (err) {
        console.error(err);
        alert(err.message);
    });
}
