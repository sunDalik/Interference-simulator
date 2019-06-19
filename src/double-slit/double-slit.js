var lambda;
var L;
var d;

window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("light-source"));
    makeDraggableHorizontally(document.getElementById("two-slits"));
    makeDraggableHorizontally(document.getElementById("screen"));
    makeDraggableHorizontally(document.getElementById("interference-pattern"));
    makeDraggableHorizontally(document.getElementById("interference-plot"));
    calculateInterferencePlot();
    changeInfo();
});

function makeDraggableHorizontally(element) {
    let posDiff = 0, pos = 0;
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        document.onmousemove = dragElement;
        pos = e.clientX;
    }

    function dragElement(e) {
        posDiff = e.clientX - pos;
        pos = e.clientX;
        const newPositionL = element.getBoundingClientRect().left + posDiff;
        const newPositionR = element.getBoundingClientRect().right + posDiff;
        if (newPositionL > 25 && newPositionR < window.innerWidth - 25 &&
            (element.id === "light-source" && newPositionR < document.getElementById("two-slits").getBoundingClientRect().left ||
                element.id === "two-slits" && newPositionR < document.getElementById("screen").getBoundingClientRect().left && newPositionL > document.getElementById("light-source").getBoundingClientRect().right ||
                element.id === "screen" && newPositionL > document.getElementById("two-slits").getBoundingClientRect().right ||
                element.id === "interference-pattern" || element.id === "interference-plot")) {
            element.style.left = newPositionL + "px";
            changeInfo();
            calculateInterferencePlot();
        }
    }

    function mouseUp() {
        document.onmousemove = null;
    }
}

function calculateInterferencePlot() {
    let svg = document.getElementById('interference-plot');
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    let amplitude = 100;
    let rarity = 1; // point spacing
    let freq = 0.1; // angular frequency
    let T = calculatePeriod(getL(), getD(), getLambda()); // interference period
    for (let i = 0; i < 100; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('y1', i * rarity);
        line.setAttribute('x1', Math.cos(freq * Math.PI * i / T) ** 2 * amplitude);
        line.setAttribute('y2', (i + 1) * rarity);
        line.setAttribute('x2', Math.cos(freq * Math.PI * (i + 1) / T) ** 2 * amplitude);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1'); //might change later

        svg.appendChild(line);
    }
}

function changeInfo() {
    document.getElementById("L").innerText = getL() + " m";
    document.getElementById("d").innerText = getD();
    document.getElementById("lambda").innerText = getLambda();
}

function calculatePeriod(L, d, lambda) {
    return L / d * lambda;
}

function getL() {
    return (document.getElementById("screen").getBoundingClientRect().left -
        document.getElementById("two-slits").getBoundingClientRect().right +
        document.getElementById("two-slits").getBoundingClientRect().width * 0.4) / 100;
}

function getD() {
    return 400 * 10 ** -9;
}

function getLambda() {
    return 400 * 10 ** -9;
}