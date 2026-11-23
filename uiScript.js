const localTurnLabels = document.getElementById("localTurnLabels");
localTurnLabels.checked = localStorage.getItem("localTurnLabels") === "true";
const hoverToggle = document.getElementById("hoverBtn");
hoverToggle.checked = localStorage.getItem("hover") !== "false";
const themeChoices = document.getElementById("themeChoices");
const themeCards = Array.from(themeChoices.querySelectorAll("[data-theme]"));

let uiSize = Number(localStorage.getItem("uiSize")) || 100;
changeSize(0);
changeStyle(localStorage.getItem("style") || "def");
tempHover(true);

themeChoices.addEventListener("click", function (event) {
    const card = event.target.closest("[data-theme]");
    if (card) {
        changeStyle(card.dataset.theme);
    }
});

const toolbarMenus = document.querySelectorAll(".toolbar-button[aria-controls]");

function closeDropdowns() {
    for (const button of toolbarMenus) {
        button.setAttribute("aria-expanded", "false");
        document.getElementById(button.getAttribute("aria-controls")).classList.remove("show");
    }
}

function toggleDropdown(button) {
    const shouldOpen = button.getAttribute("aria-expanded") === "false";
    closeDropdowns();
    if (shouldOpen) {
        button.setAttribute("aria-expanded", "true");
        document.getElementById(button.getAttribute("aria-controls")).classList.add("show");
    }
}

function dismissDropdown() {
    const expandedButton = document.querySelector('.toolbar-button[aria-expanded="true"]');
    closeDropdowns();
    expandedButton?.focus();
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        dismissDropdown();
    }
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        closeDropdowns();
    }
});

function changeSize(by) {
    uiSize = Math.min(200, Math.max(80, uiSize + by));
    document.body.style.setProperty("--ui-scale", uiSize / 100);
    document.getElementById("fontText").textContent = uiSize + "%";
    document.getElementById("downSize").disabled = uiSize === 80;
    document.getElementById("upSize").disabled = uiSize === 200;
    if (by !== 0) {
        localStorage.setItem("uiSize", uiSize);
    }
}

function changeLocalTurnLabels() {
    localStorage.setItem("localTurnLabels", localTurnLabels.checked);
    updateBoardControls();
}

function changeStyle(name) {
    if (!themeCards.some(card => card.dataset.theme === name)) {
        name = "def";
    }
    document.getElementById("all").dataset.uiTheme = name;
    for (const card of themeCards) {
        card.setAttribute("aria-pressed", String(card.dataset.theme === name));
    }
    localStorage.setItem("style", name);
    let tColor;
    switch (name) {
        case "def":
            tColor = "";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = "";
            document.body.style.backgroundImage = "url(images/DefaultBG.jpg)";
            document.getElementById("all").style = "";
            break;
        case "sand":
            tColor = "rgba(92, 152, 56, 0.6)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/sand.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "black":
            tColor = "#5d6a78b3";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/black.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "blue":
            tColor = "#bf607e99";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/blue1.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "cinder":
            tColor = "rgb(180, 50, 50)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/black.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "bluewood":
            tColor = "rgb(224, 210, 82)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/blueWood.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "grill":
            tColor = "rgb(151, 82, 115)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/Coal.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "sea":
            tColor = "rgb(62, 164, 211)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/Sand2.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "sofa":
            tColor = "rgb(221, 191, 147)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/sofa.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "egypt":
            tColor = "rgb(209, 196, 121)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/marble.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "street":
            tColor = "rgb(211, 140, 33)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/darkMarble.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "deck":
            tColor = "rgb(200, 224, 114)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/wood.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
        case "carpet":
            tColor = "rgb(169, 121, 209)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/carpetBlack.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            break;
    }
}

function generateStyle(color) {
    return "--color: " + color + ";background: -webkit-linear-gradient(left, rgba(233, 223, 196, 1) 0%, rgba(233, 223, 196, 1) 1%, rgba(237, 227, 200, 1) 2%, rgba(237, 227, 200, 1) 24%, rgba(235, 221, 195, 1) 25%, rgba(233, 223, 196, 1) 48%, rgba(235, 221, 195, 1) 49%, rgba(230, 216, 189, 1) 52%, rgba(230, 216, 189, 1) 53%, rgba(233, 219, 192, 1) 54%, rgba(230, 216, 189, 1) 55%, rgba(230, 216, 189, 1) 56%, rgba(233, 219, 192, 1) 57%, rgba(230, 216, 189, 1) 58%, rgba(230, 216, 189, 1) 73%, rgba(233, 219, 192, 1) 74%, rgba(233, 219, 192, 1) 98%, rgba(235, 221, 195, 1) 100%), var(--color);background-repeat: repeat, repeat;background-size: auto auto, auto auto;background-repeat: repeat;background-size: auto auto;background-size: 63px;background-blend-mode: multiply;border: 1em ridge var(--color);"
}

function changeHover() {
    localStorage.setItem("hover", hoverToggle.checked);
    tempHover(!disableBoard);
}

function tempHover(enabled) {
    document.getElementById("boardDiv").classList.toggle("canHover", enabled && hoverToggle.checked);
}

async function copyLink() {
    const field = document.getElementById("inviteURL");
    const status = document.getElementById("copyStatus");
    if (!field.value) {
        return;
    }
    try {
        await navigator.clipboard.writeText(field.value);
        status.textContent = "Invite link copied.";
    } catch {
        field.focus();
        field.select();
        status.textContent = "Copy the selected link to share it.";
    }
}
