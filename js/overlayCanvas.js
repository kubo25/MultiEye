function findSelectedCodeWindows(click, startX, startY, endX, endY){
    let selectedWindows = [];
    for(const codeWindow of codeWindows){
        if(!codeWindow.hidden){
            let dx, dy;
        
            let boundingRect = codeWindow.getBoundingClientRect();

            if(click){
                dx = startX >= boundingRect.left && startX <= (boundingRect.width + boundingRect.left);
                dy = startY >= boundingRect.top && startY <= (boundingRect.height + boundingRect.top);
            }
            else{
                let codeWindowRx = (boundingRect.right - boundingRect.left) / 2;
                let codeWindowRy = (boundingRect.bottom - boundingRect.top) / 2;
                let codeWindowMidX = codeWindowRx + boundingRect.left;
                let codeWindowMidY = codeWindowRy + boundingRect.top;

                let selectionBoxRx = Math.abs(endX - startX) / 2;
                let selectionBoxRy = Math.abs(endY - startY) / 2;

                let selectionBoxMidX = selectionBoxRx + ((startX < endX) ? startX : endX);
                let selectionBoxMidY = selectionBoxRy + ((startY < endY) ? startY : endY);

                dx = Math.abs(codeWindowMidX - selectionBoxMidX) <= Math.abs(codeWindowRx + selectionBoxRx);
                dy = Math.abs(codeWindowMidY - selectionBoxMidY) <= Math.abs(codeWindowRy + selectionBoxRy);
            }

            if(dx && dy){
                if(click){
                    return codeWindow;
                }

                selectedWindows.push(codeWindow);
            }
        }
    }
    return selectedWindows;
}

(function(){
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

    canvas.onmouseup = function(e){
        isDrawing = false;
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if(startX !== e.clientX && startY !== e.clientY){
            let selectedWindows = findSelectedCodeWindows(false, startX, startY, e.clientX, e.clientY);
            
            for(const codeWindow of selectedWindows){
                let nodes = codeWindow.cy.nodes();
                let boundingRect = codeWindow.getBoundingClientRect();
                
                for(let i = 0; i < nodes.length; i++){
                    if(nodes[i].id() <= playIndex){
                        let position = nodes[i].position();
                    
                        let topX, topY, bottomX, bottomY;

                        if(startX > e.clientX){
                            topX = e.clientX;
                            bottomX = startX;
                        }
                        else{
                            topX = startX;
                            bottomX = e.clientX;
                        }

                        if(startY > e.clientY){
                            topY = e.clientY;
                            bottomY = startY;
                        }
                        else{
                            topY = startY;
                            bottomY = e.clientY;
                        }

                        topX -= boundingRect.left;
                        bottomX -= boundingRect.left;

                        topY -= boundingRect.top;
                        bottomY -= boundingRect.top;

                        let dx = position.x >= topX && position.x <= bottomX;
                        let dy = position.y >= topY && position.y <= bottomY;

                        if(dx && dy){
                            nodes[i].addClass("selected");
                        }   
                    }
                }
            }
        }
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

    canvas.onclick = function(e){
        if(!isDragging){
            let codeWindow = findSelectedCodeWindows(true, startX, startY, e.clientX, e.clientY);

            if(codeWindow.length === 0){
                for(const codeWindow of codeWindows){
                    let selected = codeWindow.cy.$(".selected");
                    for(let i = 0; i < selected.length; i++){
                        selected[i].removeClass("selected");
                    }
                }
                return;
            }
            
            codeWindow.select();

            for(const blur of codeWindows){
                if(blur !== codeWindow){
                    if(blur.cyWrapper.classList.contains("blurred")){
                        blur.cyWrapper.classList.remove("blurred");
                    }
                    else{
                        blur.cyWrapper.classList.add("blurred");
                    }
                }
            }
        }
    }
    
    window.onresize = function(){
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        context.strokeStyle = "rgba(126, 126, 126, 1)";
        context.fillStyle = "rgba(126, 126, 126, 0.2)";
    }
})();