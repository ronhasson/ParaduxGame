var peer = null;
var connection = null;

const multSettBtn = document.getElementById("multSettBtn");
const onlineAction = document.getElementById("eMultiBtn");
const onlineStatus = document.getElementById("onlineStatus");
const onlineInvite = document.getElementById("onlineInvite");
const inviteURL = document.getElementById("inviteURL");
const copyStatus = document.getElementById("copyStatus");
let emojiText = document.getElementById("teamEmoji");

const onlineActions = {
    idle: "Start online game",
    opening: "Cancel",
    ready: "Close online game",
    connecting: "Cancel",
    connected: "Disconnect",
    error: "Try again"
};

function showOnlineState(state, message) {
    onlineStatus.textContent = message;
    onlineStatus.dataset.state = state;
    multSettBtn.dataset.onlineState = state;
    onlineAction.textContent = onlineActions[state];
    onlineAction.classList.toggle("panel-primary", state === "idle" || state === "error");
}

function toggleOnline() {
    if (peer) {
        disableMulti();
    } else {
        enableMulti();
    }
}

let t1 = "⚪";
let t2 = "⚫";
var imTeam;

if (window.location.hash) {
    toggleDropdown(multSettBtn);
    enableMulti();
} else {
    drawBoard();
}

function enableMulti() {
    const joinID = window.location.hash.slice(1);
    showOnlineState("opening", joinID ? "Connecting to your friend…" : "Creating your invite…");

    const activePeer = new Peer(null, {
        host: 'peer.ronhasson.cyou',
        key: "ron",
        secure: true
    });
    peer = activePeer;

    activePeer.on('open', function (id) {
        if (peer !== activePeer) {
            return;
        }
        if (joinID) {
            connectTo(joinID);
            return;
        }
        const url = new URL(window.location.href);
        url.hash = id;
        inviteURL.value = url.href;
        onlineInvite.hidden = false;
        showOnlineState("ready", "Invite ready. Waiting for your friend to join.");
    });

    activePeer.on('connection', function (conn) {
        if (peer !== activePeer) {
            return;
        }
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

    activePeer.on('error', function (err) {
        if (peer === activePeer) {
            console.error(err);
            disableMulti("Couldn’t connect to the multiplayer service.");
        }
    });
}

function connectTo(hisID) {
    emojiText.innerText = t1;
    emojiText.classList.remove("myTurn");
    tempHover(false);
    disableBoard = true;
    updateBoardControls();
    imTeam = 1;
    connection = peer.connect(hisID);
    console.log("Connecting to: " + hisID);
    connectionLogic(connection);
}

function disableMulti(error = "") {
    const previousConnection = connection;
    const previousPeer = peer;
    connection = null;
    peer = null;
    previousConnection?.close();
    previousPeer?.destroy();

    onlineInvite.hidden = true;
    inviteURL.value = "";
    copyStatus.textContent = "";
    emojiText.innerText = "";
    emojiText.classList.remove("myTurn");
    if (!error) {
        window.location.hash = "";
    }
    showOnlineState(error ? "error" : "idle", error || "Start a game and send the invite link to a friend.");
    disableBoard = Boolean(winningTeam);
    if (!board) {
        drawBoard();
    }
    updateBoardControls();
}

function connectionLogic(conn) {
    connection = conn;
    showOnlineState("connecting", "Connecting to your friend…");
    conn.on('open', function () {
        if (connection !== conn) {
            return;
        }
        showOnlineState("connected", "Your friend is connected.");
        drawBoard();
        // Receive messages
        conn.on('data', function (data) {
            if (connection !== conn) {
                return;
            }
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
            updateBoardControls();
        });

        // Send messages
        conn.send('Hello!');
    });
    conn.on('close', function () {
        if (connection === conn) {
            disableMulti("Your friend disconnected.");
        }
    });
    conn.on('error', function (err) {
        if (connection === conn) {
            console.error(err);
            disableMulti("Couldn’t connect to your friend.");
        }
    });
}
