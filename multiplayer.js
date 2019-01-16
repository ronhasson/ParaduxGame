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
    connectTo(location.hash.substr(1));
}

function enableMulti() {
    //var myWorker = new Worker('multiplayerWorker.js');

    peer = new Peer(null, {
        host: '0.peerjs.com',
        port: "",
        secure: true
    })
    console.log(peer);

    peer.on('open', function (id) {
        console.log('My peer ID is: ' + id);
        multSettBtn.style.color = "purple";
        enbMultiBtn.value = "X";
        enbMultiBtn.onclick = "disableMulti()";
        multiText.innerText = "Disable multiplayer";
        MultiIdText.innerHTML = "ID: " + id;
        linkBtn.disabled = false;
    });

    peer.on('connection', function (conn) {
        if (connection != null) { //redject other ppl
            conn.close()
            return;
        }
        emojiText.innerText = t2;
        emojiText.classList.add("myTurn");
        imTeam = 2;
        connectionLogic(conn);
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
    //close connection
    //close peer
    //style change
    //remove hash
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
            }

            emojiText.classList.add("myTurn");
        });

        // Send messages
        conn.send('Hello!');
    });
    conn.on('close', disableMulti());
}