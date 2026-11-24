const onlineProtocol = "paradux-v1";
const connectionWaitMs = 25000;
const onlineButton = document.getElementById("multSettBtn");
const onlineAction = document.getElementById("eMultiBtn");
const onlineStatus = document.getElementById("onlineStatus");
const onlineInvite = document.getElementById("onlineInvite");
const inviteURL = document.getElementById("inviteURL");
const leaveInviteButton = document.getElementById("leaveInviteBtn");
const copyStatus = document.getElementById("copyStatus");
const onlineMarble = document.getElementById("teamEmoji");

let peer = null;
let connection = null;
let onlineTeam = null;
let roundNumber = 0;
let moveNumber = 0;
let waitingForRestart = false;
let connectionTimeout;

const onlineActions = {
    idle: "Start online game",
    opening: "Cancel",
    ready: "Close online game",
    connecting: "Cancel",
    connected: "Disconnect",
    expired: "Start online game",
    error: "Try again"
};

function showOnlineState(state, message) {
    onlineStatus.textContent = message;
    onlineStatus.dataset.state = state === "expired" ? "error" : state;
    onlineButton.dataset.onlineState = state;
    onlineAction.textContent = onlineActions[state];
    onlineAction.classList.toggle("panel-primary", state === "idle" || state === "error" || state === "expired");
    leaveInviteButton.hidden = state !== "error" || !window.location.hash;
}

function updateOnlineTurn() {
    const ownsTurn = onlineTeam === turnTeam && !disableBoard;
    onlineMarble.textContent = onlineTeam === 2 ? "⚫" : onlineTeam === 1 ? "⚪" : "";
    onlineMarble.classList.toggle("myTurn", ownsTurn);
    if (onlineTeam !== null) {
        const color = onlineTeam === 2 ? "Black" : "White";
        onlineMarble.setAttribute("aria-label", ownsTurn ? color + " · Your turn" : color);
        onlineMarble.title = ownsTurn ? "Your turn" : "You play " + color.toLowerCase();
    }
}

function toggleOnline() {
    if (peer) {
        leaveOnline();
    } else {
        startOnline();
    }
}

function waitForConnection(message) {
    clearTimeout(connectionTimeout);
    connectionTimeout = setTimeout(() => endOnline("error", message), connectionWaitMs);
}

function startOnline() {
    const joinID = window.location.hash.slice(1);
    if (joinID && !/^[a-z0-9_-]{1,128}$/i.test(joinID)) {
        endOnline("expired", "This invite is invalid. Ask your friend for a new link.");
        return;
    }
    if (joinID) {
        onlineTeam = 1;
        clearSelection();
        updateBoardControls();
    }
    showOnlineState("opening", joinID ? "Connecting to your friend…" : "Creating your invite…");
    waitForConnection("The signaling service took too long to respond. Try again.");
    let activePeer;
    try {
        // Supplying an ID makes opening the signaling socket cancellable immediately.
        const id = Array.from(crypto.getRandomValues(new Uint8Array(16)),
            byte => byte.toString(16).padStart(2, "0")).join("");
        activePeer = new peerjs.Peer(id, {
            config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
        });
    } catch {
        endOnline("error", "This browser couldn’t start multiplayer. Try again.");
        return;
    }
    peer = activePeer;

    activePeer.on("open", id => {
        if (peer !== activePeer) {
            return;
        }
        clearTimeout(connectionTimeout);
        if (joinID) {
            const joining = activePeer.connect(joinID, {
                label: onlineProtocol,
                serialization: "json",
                reliable: true
            });
            if (joining) {
                attachConnection(joining);
            } else {
                endOnline("error", "Couldn’t connect to your friend. Try again.");
            }
            return;
        }
        const url = new URL(window.location.href);
        url.hash = id;
        inviteURL.value = url.href;
        onlineInvite.hidden = false;
        showOnlineState("ready", "Invite ready. Waiting for your friend to join.");
    });

    activePeer.on("connection", incoming => {
        if (peer !== activePeer || incoming.label !== onlineProtocol) {
            incoming.close();
            return;
        }
        if (connection || joinID) {
            incoming.on("open", () => {
                incoming.send({ type: "full" });
                incoming.close({ flush: true });
            });
            return;
        }
        onlineTeam = 2;
        attachConnection(incoming);
    });

    activePeer.on("error", error => {
        if (peer !== activePeer) {
            return;
        }
        if (connection?.open) {
            return;
        }
        if (error.type === "peer-unavailable" && joinID) {
            endOnline("expired", "This invite has expired or the host is offline. Ask for a new link.");
        } else {
            endOnline("error", "Couldn’t connect to the multiplayer service. Try again.");
        }
    });

    activePeer.on("disconnected", () => {
        if (peer !== activePeer) {
            return;
        }
        if (connection?.open) {
            showOnlineState("connected", "Signaling went offline. You can keep playing this match.");
        } else {
            endOnline("error", "Lost contact with the multiplayer service. Try again.");
        }
    });
}

function leaveOnline() {
    endOnline("idle", "Start a game and send the invite link to a friend.");
}

function endOnline(state, message) {
    clearTimeout(connectionTimeout);
    const previousConnection = connection;
    const previousPeer = peer;
    connection = null;
    peer = null;
    onlineTeam = null;
    roundNumber = 0;
    moveNumber = 0;
    waitingForRestart = false;
    previousConnection?.close();
    previousPeer?.destroy();

    if (state !== "error" && window.location.hash) {
        const localURL = new URL(window.location.href);
        localURL.hash = "";
        history.replaceState(history.state, "", localURL);
    }

    onlineInvite.hidden = true;
    inviteURL.value = "";
    copyStatus.textContent = "";
    clearSelection();
    showOnlineState(state, message);
    updateBoardControls();
}

function attachConnection(conn) {
    connection = conn;
    clearSelection();
    updateBoardControls();
    showOnlineState("connecting", "Connecting to your friend…");
    waitForConnection("Couldn’t establish a direct connection. Try again or switch networks.");

    conn.on("data", message => {
        if (connection === conn) {
            receiveOnlineMessage(message);
        }
    });
    conn.on("open", () => {
        if (connection !== conn) {
            return;
        }
        onlineInvite.hidden = true;
        if (onlineTeam === 2) {
            startOnlineRound();
        } else if (roundNumber === 0) {
            showOnlineState("connecting", "Connected. Waiting for the board…");
        }
        updateBoardControls();
    });
    conn.on("close", () => {
        if (connection === conn) {
            endOnline("expired", roundNumber ? "Your friend disconnected." : "The connection closed before the game started.");
        }
    });
    conn.on("error", () => {
        if (connection === conn) {
            endOnline("error", "The connection to your friend was interrupted.");
        }
    });
}

function requestNewGame() {
    if (onlineTeam === null) {
        drawBoard();
    } else if (connection?.open && roundNumber && !waitingForRestart) {
        if (onlineTeam === 2) {
            startOnlineRound();
        } else {
            waitingForRestart = true;
            clearSelection();
            updateBoardControls();
            connection.send({ type: "restart", round: roundNumber });
        }
    }
}

function startOnlineRound() {
    resetOnlineBoard(roundNumber + 1);
    connection.send({ type: "round", round: roundNumber });
}

function resetOnlineBoard(round) {
    clearTimeout(connectionTimeout);
    roundNumber = round;
    moveNumber = 0;
    waitingForRestart = false;
    drawBoard();
    showOnlineState("connected", peer?.disconnected
        ? "Signaling went offline. You can keep playing this match."
        : "Your friend is connected.");
}

function sendOnlineMove(move) {
    if (connection?.open && roundNumber) {
        connection.send({ type: "move", round: roundNumber, number: ++moveNumber, move });
    }
}

function receiveOnlineMessage(message) {
    if (!message || typeof message !== "object") {
        return;
    }
    if (message.type === "full" && onlineTeam === 1 && !roundNumber) {
        endOnline("expired", "That game already has two players.");
    } else if (message.type === "round" && onlineTeam === 1 && message.round === roundNumber + 1) {
        resetOnlineBoard(message.round);
    } else if (roundNumber && message.round === roundNumber) {
        if (message.type === "restart" && onlineTeam === 2) {
            startOnlineRound();
        } else if (message.type === "move" && turnTeam !== onlineTeam && !winningTeam && message.number === moveNumber + 1) {
            if (applyPairMove(message.move)) {
                moveNumber++;
            }
        }
    }
}

drawBoard();
if (window.location.hash) {
    toggleDropdown(onlineButton);
    startOnline();
}
