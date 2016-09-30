canvas.onmousedown = handleMousedown;
canvas.onmousemove = handleMousemove;
document.onkeydown = handleKeydown;
document.onkeyup = handleKeyup;
canvas.onmouseup = handleMouseup;

function handleMousedown(e) {
    ax = e.pageX;// + 16;//14;
    ay = e.pageY;// + 16;//31;
    isMouseDown = true;
}

function handleMouseup(e) {
    isMouseDown = false;
}

function handleMousemove(e) {
    ax = e.pageX + 16;//14;
    ay = e.pageY + 16;//31;
}

function handleKeydown(e) {
    var kCode = ((e.which) || (e.keyCode));
    switch (kCode) {
        case 38:
        case 87: //W
            controlCode = controlCode | 8;
            isPressW = true;
            break;
        case 39:
        case 68: //D
            controlCode = controlCode | 4;
            isPressD = true;
            break;
        case 40:
        case 83: //S
            controlCode = controlCode | 2;
            isPressS = true;
            break;
        case 37:
        case 65: //A
            controlCode = controlCode | 1;
            isPressA = true;
            break;
    }
}

function handleKeyup(e) {
    var kCode = ((e.which) || (e.keyCode));
    switch (kCode) {
        case 38:
        case 87: //W
            controlCode = controlCode & 7;
            break;
        case 39:
        case 68: //D
            controlCode = controlCode & 11;
            break;
        case 40:
        case 83: //S
            controlCode = controlCode & 13;
            break;
        case 37:
        case 65: //A
            controlCode = controlCode & 14;
            break;
    }
}