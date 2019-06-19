window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("light-source"));
    makeDraggableHorizontally(document.getElementById("two-slits"));
    makeDraggableHorizontally(document.getElementById("screen"));
    makeDraggableHorizontally(document.getElementById("interference-pattern"));
    makeDraggableHorizontally(document.getElementById("interference-plot"));
    calculateInterferencePlot();
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
                element.id === "interference-pattern")) {
            element.style.left = newPositionL + "px";
        }
    }

    function mouseUp() {
        document.onmousemove = null;
    }
}

function calculateInterferencePlot() {
    let svg = document.getElementById('interference-plot');
    let amplitude = 50;
    let rarity = 1; // point spacing
    let freq = 0.1; // angular frequency
    let T = 1; // interference period

    for (let i = 0; i < 100; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', i * rarity);
        line.setAttribute('y1', Math.cos(freq * Math.PI * i / T) ** 2 * amplitude);
        line.setAttribute('x2', (i + 1) * rarity);
        line.setAttribute('y2', Math.cos(freq * Math.PI * (i + 1) / T) ** 2 * amplitude);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1'); //might change later

        svg.appendChild(line);
    }
}