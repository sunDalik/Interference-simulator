window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("light-source"));
    makeDraggableHorizontally(document.getElementById("two-slits"));
    makeDraggableHorizontally(document.getElementById("screen"));
    makeDraggableHorizontally(document.getElementById("interference-pattern"));
});

function makeDraggableHorizontally(element) {
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown() {
        document.onmousemove = dragElement;
    }

    function dragElement(e) {
        element.style.left = e.clientX + 'px'; //doesn't work yet
    }

    function mouseUp() {
        document.onmousemove = null;
    }
}