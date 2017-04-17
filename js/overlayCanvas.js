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

function unselectWindows(){
    for(const codeWindow of selectedWindows){
        codeWindow.unselect();
    }
    
    selectedWindows = [];
    
    document.getElementById("selectionButtons").style.opacity = 0;
    
    for(const blur of codeWindows){
        blur.cyWrapper.classList.remove("blurred");
    }
}

function showNext(){
    if(currentlySelectedIndex === selectedWindows.length - 1){
        return;
    }
        
    selectedWindows[currentlySelectedIndex].cyWrapper.style.transform = "translate(-10000px," + 
        selectedWindows[currentlySelectedIndex].centerY + "px)";
    
    currentlySelectedIndex++;
    
    selectedWindows[currentlySelectedIndex].cyWrapper.style.transform = "translate(" +
        selectedWindows[currentlySelectedIndex].centerX + "px, " +
        selectedWindows[currentlySelectedIndex].centerY + "px)";
}

function showPrevious(){
    if(currentlySelectedIndex === 0){
        return;
    }
        
    selectedWindows[currentlySelectedIndex].cyWrapper.style.transform = "translate(10000px," + 
        selectedWindows[currentlySelectedIndex].centerY + "px)";
    
    currentlySelectedIndex--;

    selectedWindows[currentlySelectedIndex].cyWrapper.style.transform = "translate(" +
        selectedWindows[currentlySelectedIndex].centerX + "px, " +
        selectedWindows[currentlySelectedIndex].centerY + "px)";
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
                let pan = codeWindow.cy.pan().y;
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
                            topY = e.clientY - pan;
                            bottomY = startY - pan;
                        }
                        else{
                            topY = startY - pan;
                            bottomY = e.clientY - pan;
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
            let codeWindow = findSelectedCodeWindows(true, startX, startY);

            //deselect fixations when clicking to empty space
            if(codeWindow.length === 0){
                for(const codeWindow of codeWindows){
                    let selected = codeWindow.cy.$(".selected");
                    for(let i = 0; i < selected.length; i++){
                        selected[i].removeClass("selected");
                    }
                }
                return;
            }
            
            let nodes = codeWindow.cy.nodes();
            let pan = codeWindow.cy.pan().y;
            
            for(let i = 0; i < nodes.length; i++){
                let outerPosition = codeWindow.getBoundingClientRect();
                let position = nodes[i].position();
                let size = nodes[i].outerHeight();
                
                let dx = e.clientX >= (outerPosition.left + position.x - size / 2) && e.clientX <= (outerPosition.left + position.x + size / 2);
                let dy = (e.clientY - pan) >= (outerPosition.top + position.y - size / 2) && (e.clientY - pan) <= (outerPosition.top + position.y + size / 2);
                
                if(dx && dy){
                    nodes[i].addClass("selected");
                    return;
                }
            }
            
            if(!codeWindow.cyWrapper.classList.contains("pendingSelection")){
               selectedWindows.push(codeWindow);
            }
            
            if(ctrlDown){
                codeWindow.cyWrapper.classList.add("pendingSelection");
            }
            else if(!ctrlDown && selectedWindows.length === 1){
                document.getElementById("selectionButtons").style.opacity = 1;
                codeWindow.select(true); 
                      
                for(const blur of codeWindows){
                    if(blur !== codeWindow){
                        blur.cyWrapper.classList.add("blurred");
                    }
                }
            }
        }
    }
    
    let ctrlDown = false;
    
    window.onkeydown = function(event){
        if(!ctrlDown && event.ctrlKey){
            ctrlDown = true;
            return false;
        }
    }
    
    window.onkeyup = function(event){
        if(ctrlDown && !event.ctrlKey){
            ctrlDown = false;
            
            if(selectedWindows.length > 0){
                document.getElementById("selectionButtons").style.opacity = 1;
            }
            
            let first = true;
            
            for(const codeWindow of selectedWindows){
                codeWindow.select(first);
                first = false;
            }
            
            for(const blur of codeWindows){
                if(!blur.selected){
                    blur.cyWrapper.classList.add("blurred");
                }
            }
            
            return false;
        }
    }
    
    let scaling;
    
    window.onresize = function(){
        let down;
        
        if(canvas.width > canvas.clientWidth || canvas.height > canvas.clientHeight){
            down = true;
        }
        else{
            down = false;
        }
        
        clearTimeout(scaling);
        scaling = setTimeout(function(){
            changeScale(down, window.innerHeight - 110);   
        }, 300);
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        context.strokeStyle = "rgba(126, 126, 126, 1)";
        context.fillStyle = "rgba(126, 126, 126, 0.2)";
        
        fileLinesCanvas.width = fileLinesCanvas.clientWidth;
        fileLinesCanvas.height = fileLinesCanvas.clientHeight;
    }
    
    document.getElementById("closeSelection").onclick = unselectWindows;
    document.getElementById("changeLeft").onclick = showPrevious;
    document.getElementById("changeRight").onclick = showNext;
})();