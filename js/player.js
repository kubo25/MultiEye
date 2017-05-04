let paused = true; //bool to represent state of player
let activeCodeWindow = null;

//Function to recursively replay the eye movement
// i -> how many loops are to be played
// next -> if the position is set manually don't wait for the duration of the fixation
// seekbarSet -> if the position is set on the seekbar don't move the thumb
function loop(i, next = false, seekbarSet = false){ 
    playIndex++;
    
    let event = project.getWhole()[playIndex];
    switch(event.name){
        case "EditorSwitchTo":            
        case "EditorOpen":
            if(activeCodeWindow !== null){
                activeCodeWindow.setActive(false);
            }
            activeCodeWindow = codeWindows.objectWithFile(event.data.path);
            activeCodeWindow.setVisible();
            activeCodeWindow.setActive(true);
            break;
            
        case "Fixation":
            nodeIndex++;
            activeCodeWindow.showNextNode();
            break;
          
        case "EditorScrollChanged":
            activeCodeWindow.scroll(event.data);
            break;
        
        case "CursorPositionChanged":
            activeCodeWindow.moveCursor(event.data);
            break;
            
        case "EditorClosed":
            activeCodeWindow.setHidden();
            break;
            
        case "SelectionChanged":
            activeCodeWindow.selectText(event.data);
            break;
            
        case "EditorContentChanged":
            activeCodeWindow.editText(event.data);
            break;
            
    }
    
    //set duration of the transition to the next step
    //if next is set the duration is 1 to prevent async problems from popping up
    let duration;
    if(next || playIndex + 1 === project.getWhole().length){
        duration = 0;
    }
    else{
        duration = new Date(project.getWhole()[playIndex + 1].timeStamp) - new Date(event.timeStamp);
    }
    
    let seekbar = document.getElementById("seekbar");
    let seekbarWrapper = document.getElementById("seekbarWrapper");
    let step = seekbar.clientWidth / project.getWhole().length;

    if(!seekbarSet){ //move the seekbar thumb
        let graphScrollWrapper = document.getElementById("graphScrollWrapper");
        
        if((playIndex + 8) * step > seekbarWrapper.clientWidth + seekbarWrapper.scrollLeft){
            seekbarWrapper.scrollLeft += step;
            graphScrollWrapper.scrollLeft = seekbarWrapper.scrollLeft;
        }
        
        seekbar.value = playIndex + 1;
    }
                
    let slidingWindow = document.getElementById("slidingWindow");
    slidingWindow.style.left = (step * (playIndex + 1) + 30 - parseInt(slidingWindow.style.width) + 174) + "px";
        
    if(next || !paused){
        setTimeout(function(){
            if(--i > 0){ //go to next iteration
                loop(i, next, seekbarSet);
            }
            else{ //stop if at the end              
                paused = true;
                document.getElementById("playButton").classList.add("paused");
            }
        }, duration);
    }
    else if(paused){
        playIndex--; //if paused remove the 1 added at the start of the function
    }
}

function previousStep(scrollbarSet){
    if(playIndex >= 0){
        if(playIndex >= project.getWhole().length){
            playIndex = project.getWhole().length - 1;
        }
        let event = project.getWhole()[playIndex];
        switch(event.name){
            case "EditorOpen":
                activeCodeWindow.setHidden(false);

            case "EditorSwitchTo":
                activeCodeWindow.setActive(false);
                if(playIndex === 0){
                    activeCodeWindow = null;
                }
                else{
                    activeCodeWindow = codeWindows.objectWithFile(project.getWhole()[playIndex - 1].data.path);
                    activeCodeWindow.setActive(true); 
                }
                break;

            case "Fixation":
                activeCodeWindow.hideLastNode();
                nodeIndex--;
                break;

            case "EditorScrollChanged":
                activeCodeWindow.unscroll();
                break;

            case "CursorPositionChanged":
                activeCodeWindow.unmoveCursor();
                break;

            case "EditorClosed":
                activeCodeWindow.setVisible();
                break;

            case "SelectionChanged":
                activeCodeWindow.unselectText();
                break;

            case "EditorContentChanged":
                activeCodeWindow.uneditText();
                break;

        }
        
        let seekbar = document.getElementById("seekbar");
        let seekbarWrapper = document.getElementById("seekbarWrapper");
        let step = seekbar.clientWidth / project.getWhole().length;
        
        if(!scrollbarSet){
            let graphScrollWrapper = document.getElementById("graphScrollWrapper");
            
            
            if((playIndex - 1) * step < seekbarWrapper.scrollLeft){
                seekbarWrapper.scrollLeft -= step;
                graphScrollWrapper.scrollLeft = seekbarWrapper.scrollLeft;
            }

            seekbar.value = playIndex;
        }
        
        let slidingWindow = document.getElementById("slidingWindow");
        slidingWindow.style.left = (step * playIndex + 30 - parseInt(slidingWindow.style.width) + 174) + "px";
        
        playIndex--;
    }
}

(function(){
    let playButton = document.getElementById("playButton");
    
    playButton.onclick = function(){
        //check if there is anything to be played
        if(project !== null && project.getWhole().length > 0){ 
            if(playButton.classList.contains("paused")){ //if the playback is paused then start it
                paused = false;
                playButton.classList.remove("paused");
                //start playback from the last known position
                loop(project.getWhole().length - (playIndex + 1)); 
            }
            else{ //if the playback is running than pause it
                paused = true;
                playButton.classList.add("paused");
            }
        }
    };
    
    let nextButton = document.getElementById("nextButton");
    
    nextButton.onclick = function(){
        //if there is any playback left move by 1
        if(playIndex < project.getWhole().length - 1){
            loop(1, true);
        }
    };
    
    let previousButton = document.getElementById("previousButton");
    
    previousButton.onclick = function(){
        previousStep(false);
    }
    
    let seekbar = document.getElementById("seekbar");
    
    seekbar.oninput = function(){
        if(nodeOrder.length > 0){
            if(this.value > playIndex){
                loop(this.value - playIndex - 1, true, true);
            }
            else{
                for(let i = playIndex + 1; i > this.value; i--){
                    previousStep(true);
                }
            }
        }
    }
})();