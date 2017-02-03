let isDrawing = false;

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
    startX = parseInt(e.clientX - canvas.offsetLeft);
    startY = parseInt(e.clientY - canvas.offsetTop);
}

canvas.onmouseup = function(){
    isDrawing = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.onmousemove = function(e){
    if(isDrawing){
        let mouseX = parseInt(e.clientX - canvas.offsetLeft);
        let mouseY = parseInt(e.clientY - canvas.offsetTop);
        
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