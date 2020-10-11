if(devicePixelRatio > 1.05){
    document.body.parentElement.style.fontSize = "115%";
}

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
    //console.log(event.target);
    if (event.target.matches('#boardDiv') || event.target.matches('.dropdown')) {
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
    let tColor;
    switch (name) {
        case "def":
            tColor = "";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = "";
            document.body.style.backgroundImage = "url(images/DefaultBG.jpg)";
            document.getElementById("all").style = "";
            document.getElementById("switchBtn").style = "";
            break;
        case "sand":
            tColor = "rgba(92, 152, 56, 0.6)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/sand.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "black":
            tColor = "#5d6a78b3";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/black.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "blue":
            tColor = "#bf607e99";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/blue1.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "cinder":
            tColor = "rgb(180, 50, 50)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/black.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "bluewood":
            tColor = "rgb(224, 210, 82)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/bluewood.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "grill":
            tColor = "rgb(151, 82, 115)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/Coal.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "sea":
            tColor = "rgb(62, 164, 211)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/sand2.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "sofa":
            tColor = "rgb(221, 191, 147)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/sofa.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "egypt":
            tColor = "rgb(209, 196, 121)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/marble.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "street":
            tColor = "rgb(211, 140, 33)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/darkMarble.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
            break;
        case "deck":
            tColor = "rgb(200, 224, 114)";
            if (document.getElementById("boardDiv").childNodes.length != 0)
                document.getElementById("boardDiv").childNodes[0].style = generateStyle(tColor);
            document.body.style.backgroundImage = "url(images/wood.jpg)";
            document.getElementById("all").style = "--color: " + tColor;
            document.getElementById("switchBtn").style = generateStyle(tColor);
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