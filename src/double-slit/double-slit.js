window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("light-source"));
    makeDraggableHorizontally(document.getElementById("two-slits"));
    makeDraggableHorizontally(document.getElementById("screen"));
    makeDraggableHorizontally(document.getElementById("interference-pattern"));
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