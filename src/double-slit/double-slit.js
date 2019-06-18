window.addEventListener('DOMContentLoaded', () => {
    makeDraggableHorizontally(document.getElementById("screen"));
});

function makeDraggableHorizontally(element) {
    element.onmousedown = mouseDown;
    document.onmouseup = mouseUp;

    function mouseDown() {
        document.onmousemove = dragElement;
    }

    function dragElement(e) {
        element.style.left = e.clientX + 'px'; //doesn't work yet
        console.log(document.onmousemove)
    }

    function mouseUp() {
        document.onmousemove = null;
    }
}