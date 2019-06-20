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
    calculateInterferencePattern();
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
            calculateInterferencePattern();
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
    let rarity = 1;
    let freq = 0.1;
    let step = 0.5;
    let T = calculatePeriod(getL(), getD(), getLambda()); // interference period
    for (let i = -50; i <= 50; i += step) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('y1', i + 50 * rarity);
        line.setAttribute('x1', Math.cos(freq * Math.PI * i / T / 10 ** 2) ** 2 * amplitude);
        line.setAttribute('y2', (i + 50 + step) * rarity);
        line.setAttribute('x2', Math.cos(freq * Math.PI * (i + step) / T / 10 ** 2) ** 2 * amplitude);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '0.7');

        svg.appendChild(line);
    }
}

function calculateInterferencePattern() {
    let svg = document.getElementById('interference-pattern');
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
    let freq = 0.1;
    let T = calculatePeriod(getL(), getD(), getLambda()); // interference period
    for (let i = -50; i <= 50; i += 0.5) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.setAttribute('d', `M 0 ${i + 50} h 100`);
        const intensity = Math.cos(freq * Math.PI * i / T / 10 ** 2) ** 2;
        line.setAttribute('stroke', `rgba(255, 255, 255, ${intensity})`);
        line.setAttribute('stroke-width', '1');

        svg.appendChild(line);
    }
}

function changeInfo() {
    document.getElementById("L").innerText = getL().toFixed(2) + " m";
    document.getElementById("d").innerText = (getD() * 10 ** 3).toFixed(2) + " mm";
    document.getElementById("lambda").innerText = (getLambda() * 10 ** 9).toFixed(0) + " nm";
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
    return 3 * 10 ** -5;
}

function getLambda() {
    return 400 * 10 ** -9;
}