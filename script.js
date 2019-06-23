let dragState = 0; // 1 if two-slits is being dragged; 2 if top-slit; 3 if bottom-slit; 0 if none
const LScale = 100; // px/m when measuring L. Divide by scale to get L in meters.
const DScale = 10 ** 5 / 2; // px/m when measuring d.
const ResScale = 10 ** 5 / 2; // px/m when displaying interference result.

window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("light-source"));
    makeDraggableHorizontally(document.getElementById("two-slits"));
    makeDraggableHorizontally(document.getElementById("screen"));
    makeDraggableHorizontally(document.getElementById("interference-pattern"));
    makeDraggableHorizontally(document.getElementById("interference-graph"));
    redraw();
    makeSlitDraggable(document.getElementById("top-slit_dragger"));
    makeSlitDraggable(document.getElementById("bottom-slit_dragger"));
    document.getElementById('lambda-slider').addEventListener('input', () => {
        redraw();
    });
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
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        if (e.target.id !== "top-slit_dragger" && e.target.id !== "bottom-slit_dragger") {
            dragState = 1;

            const shiftL = e.clientX - element.getBoundingClientRect().left;
            document.onmousemove = function (e) {
                let newPositionL = e.clientX - shiftL - document.getElementById('schemaBox').getBoundingClientRect().left;
                let newPositionR = document.getElementById('schemaBox').getBoundingClientRect().right - (e.clientX - shiftL + element.getBoundingClientRect().width);
                if (newPositionL < 25) {
                    newPositionL = 25;
                }
                const rightEdge = document.getElementById("schemaBox").getBoundingClientRect().width - element.getBoundingClientRect().width;
                if (rightEdge - newPositionL < 25) {
                    newPositionL = rightEdge - 25;
                }
                if (element.id === "light-source" && (newPositionR - parseFloat(getComputedStyle(document.getElementById("two-slits")).right)) > 75 ||
                    element.id === "two-slits" && (newPositionR - parseFloat(getComputedStyle(document.getElementById("screen")).right)) > 100 && (newPositionL - parseFloat(getComputedStyle(document.getElementById("light-source")).left)) > 75 ||
                    element.id === "screen" && (newPositionL - parseFloat(getComputedStyle(document.getElementById("two-slits")).left)) > 100) {
                    element.style.left = newPositionL + 'px';
                    redraw();
                }
            }
        }
    }
}

function drawInterferencePlot() {
    let svg = document.getElementById('interference-graph');
    removeAllChildren(svg);
    let amplitude = 100;
    let rarity = 1;
    let step = 0.5;
    let center = getSlitsCenterRelativeToGraph();
    let T = calculatePeriod(getL(), getD(), getLambda());
    for (let i = -center; i <= (100 - center); i += step) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('y1', i + center * rarity);
        line.setAttribute('x1', Math.cos(Math.PI * i / T / ResScale) ** 2 * amplitude);
        line.setAttribute('y2', (i + center + step) * rarity);
        line.setAttribute('x2', Math.cos(Math.PI * (i + step) / T / ResScale) ** 2 * amplitude);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '0.7');
        svg.appendChild(line);
    }
}

function drawInterferencePattern() {
    let svg = document.getElementById('interference-pattern');
    removeAllChildren(svg);
    let step = 0.5;
    let center = getSlitsCenterRelativeToGraph();
    let T = calculatePeriod(getL(), getD(), getLambda());
    for (let i = -center; i <= 100 - center; i += step) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.setAttribute('d', `M 0 ${i + center} h 100`);
        line.setAttribute('opacity', Math.cos(Math.PI * i / T / ResScale) ** 2);
        line.setAttribute('stroke', getColorByWavelength(getLambdaNM()));
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
}

function changeInfo() {
    document.getElementById("L").innerText = getL().toFixed(2) + " m";
    document.getElementById("d").innerText = (getD() * 10 ** 3).toFixed(2) + " mm";
    document.getElementById("lambda").innerText = getLambdaNM() + " nm";
}

function makeSlitDraggable(element) {
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        dragState = element.id === "top-slit_dragger" ? 2 : 3;
        const shiftT = Number(element.getAttribute('cy')) - e.clientY;
        document.onmousemove = function (e) {
            let NewPosition = e.clientY + shiftT;
            if (NewPosition < 40) {
                NewPosition = 40;
            }
            const bottomEdge = document.getElementById("schemaBox").getBoundingClientRect().height - element.getBoundingClientRect().height;
            if (bottomEdge - NewPosition < 25) {
                NewPosition = bottomEdge - 25;
            }
            if (element.id === 'top-slit_dragger' && document.getElementById('bottom-slit_dragger').getAttribute('cy') - NewPosition > 30 ||
                element.id === "bottom-slit_dragger" && NewPosition - document.getElementById('top-slit_dragger').getAttribute('cy') > 30) {
                element.setAttribute('cy', NewPosition);
                if (element.id === "top-slit_dragger") {
                    document.getElementById("top-slit").setAttribute('y', NewPosition - 4);
                } else if (element.id === "bottom-slit_dragger") {
                    document.getElementById("bottom-slit").setAttribute('y', NewPosition - 4);
                }
                redraw();
            }
        }
    }
}

function drawCentralLine() {
    let svg = document.getElementById('central-line');
    svg.style.left = `${document.getElementById('two-slits').getBoundingClientRect().right - document.getElementById('two-slits').getBoundingClientRect().width * 0.4 - document.getElementById('schemaBox').getBoundingClientRect().left - 2}`;
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
    return document.getElementById('lambda-slider').value * 10 ** -9;
}

function getLambdaNM() {
    return document.getElementById('lambda-slider').value;
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
    document.getElementById('lambda-slider').style.setProperty('--customBG', getColorByWavelength(getLambdaNM()));
}

function getSlitsCenter() {
    return Math.floor((document.getElementById('top-slit_dragger').getBoundingClientRect().bottom - document.getElementById('schemaBox').getBoundingClientRect().top +
        document.getElementById('bottom-slit_dragger').getBoundingClientRect().top - document.getElementById('schemaBox').getBoundingClientRect().top) / 2 - 1 - 2);
}

function getSlitsCenterRelativeToGraph() {
    return getSlitsCenter() / document.getElementById('interference-graph').getBoundingClientRect().height * 100;
}

function removeAllChildren(parent) {
    while (parent.hasChildNodes()) {
        parent.removeChild(parent.firstChild);
    }
}

// got it from johndcook.com/wavelength_to_RGB.html and tweaked a little
function getColorByWavelength(wavelength) {
    let r, g, b, alpha;
    if (wavelength >= 380 && wavelength < 440) {
        r = -(wavelength - 440) / (440 - 380);
        g = 0.0;
        b = 1.0;
    }
    else if (wavelength >= 440 && wavelength < 490) {
        r = 0.0;
        g = (wavelength - 440) / (490 - 440);
        b = 1.0;
    }
    else if (wavelength >= 490 && wavelength < 510) {
        r = 0.0;
        g = 1.0;
        b = -(wavelength - 510) / (510 - 490);
    }
    else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510);
        g = 1.0;
        b = 0.0;
    }
    else if (wavelength >= 580 && wavelength < 645) {
        r = 1.0;
        g = -(wavelength - 645) / (645 - 580);
        b = 0.0;
    }
    else if (wavelength >= 645 && wavelength < 781) {
        r = 1.0;
        g = 0.0;
        b = 0.0;
    }
    else {
        r = 0.0;
        g = 0.0;
        b = 0.0;
    }

    if (wavelength >= 380 && wavelength < 420)
        alpha = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    else if (wavelength >= 420 && wavelength < 701)
        alpha = 1.0;
    else if (wavelength >= 701 && wavelength < 781)
        alpha = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    else
        alpha = 0.0;

    const gamma = 0.80;
    r = r > 0 ? 255 * Math.pow(r * alpha, gamma) : 0;
    g = g > 0 ? 255 * Math.pow(g * alpha, gamma) : 0;
    b = b > 0 ? 255 * Math.pow(b * alpha, gamma) : 0;
    return `rgb(${r}, ${g}, ${b})`;
}