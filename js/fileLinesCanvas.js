let fileLinesCanvas = document.getElementById("fileLinesCanvas");
let fileLinesContext = fileLinesCanvas.getContext("2d");
let fileLines = [];

fileLinesCanvas.width = fileLinesCanvas.clientWidth;
fileLinesCanvas.height = fileLinesCanvas.clientHeight;

fileLinesContext.globalAlpha = 0.7;

function addFileLine(color, x1, y1, x2, y2){
    fileLinesContext.strokeStyle = color;
    
    fileLinesContext.beginPath();
    fileLinesContext.moveTo(x1, y1);
    fileLinesContext.lineTo(x2, y2);
    fileLinesContext.lineWidth = 5;
    fileLinesContext.stroke();
}

function addNextFileLine(){
    let boundingClientRect1 = fileLines[fileIndex].codeWindow1.getBoundingClientRect();
    let boundingClientRect2 = fileLines[fileIndex].codeWindow2.getBoundingClientRect();
    let position1 = fileLines[fileIndex].node1.position();
    let position2 = fileLines[fileIndex].node2.position();
    
    let x1 = position1.x + boundingClientRect1.left;
    let y1 = position1.y + boundingClientRect1.top;
    
    let x2 = position2.x + boundingClientRect2.left;
    let y2 = position2.y + boundingClientRect2.top;
    
    addFileLine(fileLines[fileIndex].color, x1, y1, x2, y2);
    
    fileIndex++;
}

function removeLastLine(){
    fileLinesContext.clearRect(0, 0, fileLinesCanvas.width, fileLinesCanvas.height);
    
    let lastIndex = fileIndex - 1;
    
    fileIndex = 0;
    
    for(let i = 0; i < lastIndex; i++){
        addNextFileLine();
    }
}