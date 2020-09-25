changeStyle(localStorage.getItem('style'));
changeHover(localStorage.getItem('hover'));

function settingsDropDown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function multiplayerDropDown() {
    document.getElementById("myDropdown2").classList.toggle("show");
}
// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn') && !event.target.parentNode.matches('.dropdown-content')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function changeSize(by) {
    let s = document.body.style.fontSize;
    s = s.substring(0, s.length - 1);
    s = parseInt(s, 10)
    let db = document.getElementById("downSize");
    let ub = document.getElementById("upSize");
    let ft = document.getElementById("fontText");
    if (s + by <= 80) {
        db.disabled = true;
    } else {
        db.disabled = false;
    }
    if (s + by >= 200) {
        ub.disabled = true;
    } else {
        ub.disabled = false;
    }
    document.body.style.fontSize = (s + by) + "%";
    ft.innerHTML = "Size: " + document.body.style.fontSize;
}

function changeStyle(name) {
    if (name != "") {
        localStorage.setItem('style', name);
    }
    switch (name) {
        case "def":
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = "";
            document.body.style.backgroundImage = "url(images/DefaultBG.jpg)";
            break;
        case "sand":
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle("rgba(92, 152, 56, 0.6)");
            document.body.style.backgroundImage = "url(images/sand.jpg)";
            break;
        case "black":
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle("#5d6a78b3");
            document.body.style.backgroundImage = "url(images/black.jpg)";
            break;
        case "blue":
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle("#bf607e99");
            document.body.style.backgroundImage = "url(images/blue1.jpg)";
            break;
        case "cinder":
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle("rgb(180, 50, 50)");
            document.body.style.backgroundImage = "url(images/black.jpg)";
            break;
        case "egypt":
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle("rgb(180, 50, 50)");
            document.body.style.backgroundImage = "url(images/black.jpg)";
            break;
    }
}

function generateStyle(color) {
    return "--color: " + color + ";background: -webkit-linear-gradient(left, rgba(233, 223, 196, 1) 0%, rgba(233, 223, 196, 1) 1%, rgba(237, 227, 200, 1) 2%, rgba(237, 227, 200, 1) 24%, rgba(235, 221, 195, 1) 25%, rgba(233, 223, 196, 1) 48%, rgba(235, 221, 195, 1) 49%, rgba(230, 216, 189, 1) 52%, rgba(230, 216, 189, 1) 53%, rgba(233, 219, 192, 1) 54%, rgba(230, 216, 189, 1) 55%, rgba(230, 216, 189, 1) 56%, rgba(233, 219, 192, 1) 57%, rgba(230, 216, 189, 1) 58%, rgba(230, 216, 189, 1) 73%, rgba(233, 219, 192, 1) 74%, rgba(233, 219, 192, 1) 98%, rgba(235, 221, 195, 1) 100%), var(--color);background-repeat: repeat, repeat;background-size: auto auto, auto auto;background-repeat: repeat;background-size: auto auto;background-size: 63px;background-blend-mode: multiply;border: 1em ridge var(--color);"
}

function changeHover(startAs = undefined) {
    let btn = document.getElementById("hoverBtn");
    let elem = document.getElementById("boardDiv");
    if (startAs != undefined) { // when u refresh the page
        //console.log("setting hover as " + startAs)
        if (startAs == "true") {
            btn.value = "Disable";
            elem.classList.add("canHover");
        } else if (startAs == "false") {
            btn.value = "Enable";
            elem.classList.remove("canHover");
        }
        return;
    }
    if (btn.value == "Disable") { //normal button press
        btn.value = "Enable";
        elem.classList.remove("canHover"); //disalbe
        localStorage.setItem('hover', false);
    } else if (btn.value == "Enable") {
        btn.value = "Disable";
        elem.classList.add("canHover"); //enable
        localStorage.setItem('hover', true);
    }
}

function tempHover(bool) {
    let btn = document.getElementById("hoverBtn");
    let elem = document.getElementById("boardDiv");

    if (!bool) { //wants to disable hover - not their turn
        elem.classList.remove("canHover");
    } else { //wants to enable hover
        if (btn.value == "Enable") { //user hates hover
            return;
        } else {
            elem.classList.add("canHover");
        }
    }
}

function copyLink() {
    let str = window.location.href + "#" + peer.id;
    navigator.clipboard.writeText(str);
}