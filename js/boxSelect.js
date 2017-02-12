let isDrawing = false;
let isDragging = false;

let canvas = document.getElementById("boxSelectCanvas");
let context = canvas.getContext("2d");

let startX;
let startY;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

context.strokeStyle = "rgba(126, 126, 126, 1)";
context.fillStyle = "rgba(126, 126, 126, 0.2)";

canvas.onmousedown = function(e){
    isDrawing = true;
    isDragging = false;
    startX = parseInt(e.clientX);
    startY = parseInt(e.clientY);
}

canvas.onmouseup = function(){
    isDrawing = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.onmousemove = function(e){
    if(isDrawing){
        isDragging = true;
        let mouseX = parseInt(e.clientX);
        let mouseY = parseInt(e.clientY);
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        context.beginPath();
        context.fillRect(startX, startY, mouseX - startX, mouseY - startY);
        context.strokeRect(startX, startY, mouseX - startX, mouseY - startY);
        context.stroke();
    }
}

window.onresize = function(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    context.strokeStyle = "rgba(126, 126, 126, 1)";
    context.fillStyle = "rgba(126, 126, 126, 0.2)";
}