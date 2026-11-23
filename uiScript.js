const localTurnLabels = document.getElementById("localTurnLabels");
localTurnLabels.checked = localStorage.getItem("localTurnLabels") === "true";
const hoverToggle = document.getElementById("hoverBtn");
hoverToggle.checked = localStorage.getItem("hover") !== "false";
const themeChoices = document.getElementById("themeChoices");
const themeCards = Array.from(themeChoices.querySelectorAll("[data-theme]"));

const boardThemes = {
    def: { image: "DefaultBG.webp" },
    wood2: { image: "wood2.webp", frame: "#b98d59", surface: "#54402f" },
    grass: { image: "grass.webp", frame: "#c4a473", surface: "#526744" },
    sand: { image: "sand.webp", frame: "rgba(92, 152, 56, 0.6)" },
    black: { image: "black.webp", frame: "#5d6a78b3" },
    blue: { image: "blue1.webp", frame: "#bf607e99" },
    cinder: { image: "black.webp", frame: "rgb(180, 50, 50)" },
    bluewood: { image: "blueWood.webp", frame: "rgb(224, 210, 82)" },
    sofa: { image: "sofa.webp", frame: "rgb(221, 191, 147)" },
    street: { image: "darkMarble.webp", frame: "rgb(211, 140, 33)" },
    egypt: { image: "marble.webp", frame: "rgb(209, 196, 121)" },
    carpet: { image: "carpetBlack.webp", frame: "rgb(169, 121, 209)" },
    deck: { image: "wood.webp", frame: "rgb(200, 224, 114)" },
    grill: { image: "Coal.webp", frame: "rgb(151, 82, 115)" },
    sea: { image: "Sand2.webp", frame: "rgb(62, 164, 211)" }
};

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
    if (!Object.hasOwn(boardThemes, name)) {
        name = "def";
    }

    const theme = boardThemes[name];
    const game = document.getElementById("all");
    const board = document.querySelector("#boardDiv > table");
    game.dataset.uiTheme = name;
    document.body.style.setProperty("--surface-image", 'url("images/' + theme.image + '")');
    if (theme.surface) {
        document.body.style.setProperty("--surface-fallback", theme.surface);
    } else {
        document.body.style.removeProperty("--surface-fallback");
    }

    if (theme.frame) {
        game.style.setProperty("--color", theme.frame);
    } else {
        game.style.removeProperty("--color");
    }
    if (board) {
        board.style.cssText = theme.frame ? generateStyle(theme.frame) : "";
    }
    for (const card of themeCards) {
        card.setAttribute("aria-pressed", String(card.dataset.theme === name));
    }
    localStorage.setItem("style", name);
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
