let dragState = 0; // 1 if two-slits is being dragged; 2 if top-slit; 3 if bottom-slit; 0 if none
const LScale = 100; // px/m when measuring L. Divide by scale to get L in meters.
const DScale = 10 ** 5 / 2; // px/m when measuring d.
const ResScale = 10 ** 4 / 2; // px/m when displaying interference result.

window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("light-source"));
    makeDraggableHorizontally(document.getElementById("two-slits"));
    makeDraggableHorizontally(document.getElementById("screen"));
    makeDraggableHorizontally(document.getElementById("interference-pattern"));
    makeDraggableHorizontally(document.getElementById("interference-graph"));
    redraw();
    makeSlitDraggable(document.getElementById("top-slit_dragger"));
    makeSlitDraggable(document.getElementById("bottom-slit_dragger"));
    document.getElementById("two-slits").addEventListener("mouseover", e => {
        if ((e.target.id === "two-slits_obstacle" || e.target.id === "two-slits") && dragState === 0 || dragState === 1) {
            document.getElementById("two-slits_obstacle").style.fill = "#828282";
        } else {
            document.getElementById("two-slits_obstacle").style.fill = "black";
        }
    });
    document.getElementById("two-slits").addEventListener("mouseout", () => {
        if (dragState !== 1) {
            document.getElementById("two-slits_obstacle").style.fill = "black";
        }
    });
    document.getElementById("top-slit_dragger").addEventListener("mouseover", () => {
        if (dragState === 0 || dragState === 2) {
            document.getElementById("top-slit_dragger").style.fill = "rgba(94, 182, 255, 0.66)";
        }
    });
    document.getElementById("top-slit_dragger").addEventListener("mouseout", () => {
        if (dragState === 0 || dragState === 2) {
            document.getElementById("top-slit_dragger").style.fill = "rgba(0, 0, 0, 0)";
        }
    });
    document.getElementById("bottom-slit_dragger").addEventListener("mouseover", () => {
        if (dragState === 0 || dragState === 3) {
            document.getElementById("bottom-slit_dragger").style.fill = "rgba(94, 182, 255, 0.66)";
        }
    });
    document.getElementById("bottom-slit_dragger").addEventListener("mouseout", () => {
        if (dragState === 0 || dragState === 3) {
            document.getElementById("bottom-slit_dragger").style.fill = "rgba(0, 0, 0, 0)";
        }
    });
});

function makeDraggableHorizontally(element) {
    let posDiff = 0, pos = 0;
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        if (e.target.id !== "top-slit_dragger" && e.target.id !== "bottom-slit_dragger") {
            dragState = 1;
            document.onmousemove = dragElement;
            pos = e.clientX;
        }
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
            redraw();
        }
    }
}

function drawInterferencePlot() {
    let svg = document.getElementById('interference-graph');
    removeAllChildren(svg);
    let amplitude = 100;
    let rarity = 1;
    let freq = 0.1;
    let step = 0.5;
    let center = getSlitsCenterRelativeToGraph();
    let T = calculatePeriod(getL(), getD(), getLambda());
    for (let i = -center; i <= (100 - center); i += step) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('y1', i + center * rarity);
        line.setAttribute('x1', Math.cos(freq * Math.PI * i / T / ResScale) ** 2 * amplitude);
        line.setAttribute('y2', (i + center + step) * rarity);
        line.setAttribute('x2', Math.cos(freq * Math.PI * (i + step) / T / ResScale) ** 2 * amplitude);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '0.7');
        svg.appendChild(line);
    }
}

function drawInterferencePattern() {
    let svg = document.getElementById('interference-pattern');
    removeAllChildren(svg);
    let freq = 0.1;
    let center = getSlitsCenterRelativeToGraph();
    let T = calculatePeriod(getL(), getD(), getLambda());
    for (let i = -center; i <= 100 - center; i += 0.5) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.setAttribute('d', `M 0 ${i + center} h 100`);
        const intensity = Math.cos(freq * Math.PI * i / T / ResScale) ** 2;
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

function makeSlitDraggable(element) {
    let posDiff = 0, pos = 0;
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        dragState = element.id === "top-slit_dragger" ? 2 : 3;
        document.onmousemove = dragElement;
        pos = e.clientY;
    }

    function dragElement(e) {
        posDiff = e.clientY - pos;
        pos = e.clientY;
        const newPosition = Number(element.getAttribute('cy')) + posDiff;
        if (newPosition > 50 && newPosition < 350 &&
            (element.id === 'top-slit_dragger' && document.getElementById('bottom-slit_dragger').getAttribute('cy') - newPosition > 30 ||
                element.id === "bottom-slit_dragger" && newPosition - document.getElementById('top-slit_dragger').getAttribute('cy') > 30)) {
            element.setAttribute('cy', newPosition);
            if (element.id === "top-slit_dragger") {
                document.getElementById("top-slit").setAttribute('y', newPosition - 4);
            } else if (element.id === "bottom-slit_dragger") {
                document.getElementById("bottom-slit").setAttribute('y', newPosition - 4);
            }
            redraw();
        }
    }
}

function drawCentralLine() {
    const svg = document.getElementById('central-line');
    svg.style.left = `${document.getElementById('two-slits').getBoundingClientRect().right - document.getElementById('two-slits').getBoundingClientRect().width * 0.4}`;
    svg.style.top = `${getSlitsCenter()}`;
    const width = document.getElementById('screen').getBoundingClientRect().left - document.getElementById('two-slits').getBoundingClientRect().right + document.getElementById('two-slits').getBoundingClientRect().width * 0.4 + document.getElementById('screen').getBoundingClientRect().width * 0.4;
    svg.setAttribute('width', width);
    document.getElementById('central-line__line').setAttribute('x2', width);
}

function calculatePeriod(L, d, lambda) {
    return L / d * lambda;
}

function getL() {
    return (document.getElementById("screen").getBoundingClientRect().left -
        document.getElementById("two-slits").getBoundingClientRect().right +
        document.getElementById("two-slits").getBoundingClientRect().width * 0.4 +
        document.getElementById("screen").getBoundingClientRect().width * 0.4) / LScale;
}

function getD() {
    return (document.getElementById('bottom-slit_dragger').getAttribute('cy') -
        document.getElementById('top-slit_dragger').getAttribute('cy')) / DScale;
}

function getLambda() {
    return 400 * 10 ** -9;
}

function mouseUp() {
    document.onmousemove = null;
    dragState = 0;
    document.getElementById("two-slits_obstacle").style.fill = "black";
}

function redraw() {
    changeInfo();
    drawCentralLine();
    drawInterferencePlot();
    drawInterferencePattern();
}

function getSlitsCenter() {
    return Math.floor((document.getElementById('top-slit_dragger').getBoundingClientRect().bottom +
        document.getElementById('bottom-slit_dragger').getBoundingClientRect().top) / 2);
}

function getSlitsCenterRelativeToGraph() {
    console.log(getSlitsCenter());
    console.log(document.getElementById('interference-graph').getBoundingClientRect().top);
    console.log(document.getElementById('interference-graph').getBoundingClientRect().height);
    return (getSlitsCenter() - document.getElementById('interference-graph').getBoundingClientRect().top) / document.getElementById('interference-graph').getBoundingClientRect().height * 100;
}

function removeAllChildren(parent) {
    while (parent.hasChildNodes()) {
        parent.removeChild(parent.firstChild);
    }
}
