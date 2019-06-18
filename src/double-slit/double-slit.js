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
        element.style.left = element.getBoundingClientRect().left + posDiff + "px";
    }

    function mouseUp() {
        document.onmousemove = null;
    }
}