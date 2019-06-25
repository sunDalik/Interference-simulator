let dragState = 0; // 2 if top-slit is being dragged; 3 if bottom-slit; 0 if none
const LScale = 100; // px/m when measuring L. Divide by scale to get L in meters.
const DScale = 10 ** 5 / 2; // px/m when measuring d.
const ResScale = 10 ** 5 / 2; // px/m when displaying interference result. * 4 to get actual scale ._.

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


function makeDraggableHorizontally(element) {
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        if (e.target.id !== "top-slit_dragger" && e.target.id !== "bottom-slit_dragger") {
            const elementBCR = element.getBoundingClientRect();
            const schemaBox = document.getElementById("schemaBox").getBoundingClientRect();
            const shiftL = e.clientX - elementBCR.left;
            const rightEdge = schemaBox.width - elementBCR.width;
            document.onmousemove = function (e) {
                let newPositionL = e.clientX - shiftL - schemaBox.left;
                let newPositionR = schemaBox.right - (e.clientX - shiftL + elementBCR.width);
                if (newPositionL < 40) {
                    newPositionL = 40;
                }
                if (rightEdge - newPositionL < 40) {
                    newPositionL = rightEdge - 40;
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
    const svg = document.getElementById('interference-graph');
    removeAllChildren(svg);
    const amplitude = 100;
    const step = 0.5;
    const center = getSlitsCenterRelativeToGraph();
    const T = calculatePeriod(getL(), getD(), getLambda());
    for (let i = -center; i <= (100 - center); i += step) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('y1', i + center);
        line.setAttribute('x1', Math.cos(Math.PI * i / T / ResScale) ** 2 * amplitude);
        line.setAttribute('y2', i + center + step);
        line.setAttribute('x2', Math.cos(Math.PI * (i + step) / T / ResScale) ** 2 * amplitude);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '0.7');
        svg.appendChild(line);
    }
}

function drawInterferencePattern() {
    const svg = document.getElementById('interference-pattern');
    removeAllChildren(svg);
    const step = 0.5;
    const center = getSlitsCenterRelativeToGraph();
    const T = calculatePeriod(getL(), getD(), getLambda());
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
    document.getElementById("T").innerText = (calculatePeriod(getL(), getD(), getLambda()) * 10 ** 3).toFixed(3) + " mm";
}

function makeSlitDraggable(element) {
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown(e) {
        dragState = element.id === "top-slit_dragger" ? 2 : 3;
        const shiftT = Number(element.getAttribute('cy')) - e.clientY;
        const bottomEdge = 400;
        document.onmousemove = function (e) {
            let NewPosition = e.clientY + shiftT;
            if (NewPosition < 40) {
                NewPosition = 40;
            }
            if (bottomEdge - NewPosition < 40) {
                NewPosition = bottomEdge - 40;
            }
            if (element.id === 'top-slit_dragger' && document.getElementById('bottom-slit_dragger').getAttribute('cy') - NewPosition > 40 ||
                element.id === "bottom-slit_dragger" && NewPosition - document.getElementById('top-slit_dragger').getAttribute('cy') > 40) {
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
    const svg = document.getElementById('central-line');
    const twoSlits = document.getElementById('two-slits').getBoundingClientRect();
    svg.style.left = twoSlits.right - 20 - document.getElementById('schemaBox').getBoundingClientRect().left - 2 + 'px';
    svg.style.top = getSlitsCenter() + 'px';
    const width = document.getElementById('screen').getBoundingClientRect().left - twoSlits.left;
    svg.setAttribute('width', width);
    document.getElementById('central-line__line').setAttribute('x2', width);
}

function calculatePeriod(L, d, lambda) {
    return L / d * lambda;
}

function getL() {
    return (document.getElementById("screen").getBoundingClientRect().left -
        document.getElementById("two-slits").getBoundingClientRect().right + 40) / LScale;
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
    drawWaves();
    drawNaturalLight();
    drawLLine();
    drawDLine();
    document.getElementById('lambda-slider').style.setProperty('--customBG', getColorByWavelength(getLambdaNM()));
}

function drawWaves() {
    const wavesSvg = document.getElementById('waves');
    const lsWavesSvg = document.getElementById('ls-waves');
    const slitTop = document.getElementById('top-slit');
    const slitBottom = document.getElementById('bottom-slit');
    const twoSlits = document.getElementById('two-slits');
    const ls = document.getElementById('light-source');
    const screen = document.getElementById('screen');
    removeAllChildren(wavesSvg);
    removeAllChildren(lsWavesSvg);
    wavesSvg.style.left = parseFloat(getComputedStyle(twoSlits).left) + 25 + 'px';
    lsWavesSvg.style.left = parseFloat(getComputedStyle(ls).left) + 25 + 'px';
    wavesSvg.setAttribute('width', screen.getBoundingClientRect().left - twoSlits.getBoundingClientRect().left - 5 + 'px');
    lsWavesSvg.setAttribute('width', twoSlits.getBoundingClientRect().left - ls.getBoundingClientRect().left - 5 + 'px');
    const wavelength = document.getElementById('lambda-slider').value;
    for (let i = 0; ; i++) {
        const wave = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const waveSize = wavelength / 10 * (i + 1);
        if ((waveSize - 10) > parseFloat(wavesSvg.getAttribute('width'))) break;
        wave.setAttribute('d', `M ${waveSize - 10} ${parseFloat(slitTop.getAttribute("y")) + 4 - waveSize} q ${waveSize / 2} ${waveSize} 0 ${waveSize * 2}`);
        wave.setAttribute('fill', 'none');
        wave.setAttribute('opacity', '0.5');
        wave.setAttribute('stroke', getColorByWavelength(wavelength));
        wavesSvg.appendChild(wave);
        const waveB = wave.cloneNode(true);
        waveB.setAttribute('d', `M ${waveSize - 10} ${parseFloat(slitBottom.getAttribute("y")) + 4 - waveSize} q ${waveSize / 2} ${waveSize} 0 ${waveSize * 2}`);
        wavesSvg.appendChild(waveB);
    }
    for (let i = 0; ; i++) {
        const waveLs = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const waveSize = wavelength / 10 * (i + 1);
        if ((waveSize - 10) > parseFloat(lsWavesSvg.getAttribute('width'))) break;
        waveLs.setAttribute('fill', 'none');
        waveLs.setAttribute('opacity', '0.5');
        waveLs.setAttribute('stroke', getColorByWavelength(wavelength));
        waveLs.setAttribute('d', `M ${waveSize - 10} ${ls.getBoundingClientRect().height / 2 - waveSize} q ${waveSize / 2} ${waveSize} 0 ${waveSize * 2}`);
        lsWavesSvg.appendChild(waveLs);
    }
}

function drawNaturalLight() {
    const lightSvg = document.getElementById('natural-light');
    removeAllChildren(lightSvg);
    const width = parseFloat(getComputedStyle(document.getElementById('light-source')).left) + 10;
    lightSvg.setAttribute('width', width + 'px');
    const wavelength = document.getElementById('lambda-slider').value;
    for (let i = 50; i <= 350; i += 50) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        line.setAttribute('d', `M 0 ${i} h ${width} l -5 -5 m 5 5 l -5 5`);
        line.setAttribute('fill', 'none');
        line.setAttribute('opacity', '0.5');
        line.setAttribute("stroke", getColorByWavelength(wavelength));
        lightSvg.appendChild(line);
    }
}

function drawLLine() {
    const svg = document.getElementById('L-line');
    const path = document.getElementById('L-line__line');
    const twoSlits = document.getElementById('two-slits').getBoundingClientRect();
    const width = document.getElementById('screen').getBoundingClientRect().left - twoSlits.left - 10;
    svg.setAttribute('width', width);
    svg.style.left = twoSlits.left + 30 - document.getElementById('schemaBox').getBoundingClientRect().left - 2 + 'px';
    path.setAttribute('d', `M 0 17 l 5 -5 m -5 5 l 5 5 m -5 -5 h ${width} l -5 -5 m 5 5 l -5 5`);
    document.getElementById('L-line__text').setAttribute('x', width / 2 - 5);
}

function drawDLine() {
    const svg = document.getElementById('D-line');
    const path = document.getElementById('D-line__line');
    const topSlit = document.getElementById('top-slit_dragger').getBoundingClientRect();
    const height = document.getElementById('bottom-slit_dragger').getBoundingClientRect().top - topSlit.top;
    svg.setAttribute('height', height);
    svg.style.left = parseFloat(getComputedStyle(document.getElementById('two-slits')).left) - 10 + 'px';
    svg.style.top = topSlit.top + topSlit.height / 2 - document.getElementById('schemaBox').getBoundingClientRect().top - 2 + 'px';
    path.setAttribute('d', `M 17 2 l -5 5 m 5 -5 l 5 5 m -5 -5 v ${height - 4} l -5 -5 m 5 5 l 5 -5`);
    document.getElementById('D-line__text').setAttribute('y', height / 2 + 5);
    const bottomStand = document.getElementById('D-line__bottom-stand');
    bottomStand.setAttribute('y1', height - 1);
    bottomStand.setAttribute('y2', height - 1);
}

function getSlitsCenter() {
    const topMargin = document.getElementById('schemaBox').getBoundingClientRect().top;
    return Math.floor((document.getElementById('top-slit_dragger').getBoundingClientRect().bottom - topMargin +
        document.getElementById('bottom-slit_dragger').getBoundingClientRect().top - topMargin) / 2 - 1 - 2);
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