let paused = true; //bool to represent state of player

//Function to recursively replay the eye movement
// i -> how many loops are to be played
// next -> if the position is set manually don't wait for the duration of the fixation
// seekbarSet -> if the position is set on the seekbar don't move the thumb
function loop(i, next = false, seekbarSet = false){ 
    playIndex++;
    
    let node = nodeOrder[playIndex];
    
    node.codeWindow.setVisible(); 
    node.codeWindow.setActive(true);
    
    //if next fixation is in a different file unselect the current one
    if(playIndex > 0 && node.codeWindow.id !== nodeOrder[playIndex - 1].codeWindow.id){
        nodeOrder[playIndex - 1].codeWindow.setActive(false);
        
        //addNextFileLine();
    }
    
    //set duration of the transition to the next step
    //if next is set the duration is 1 to prevent async problems from popping up
    let duration = (next) ? 1 : node.duration; 
    
    let seekbar = document.getElementById("seekbar");
    let seekbarWrapper = document.getElementById("seekbarWrapper");
    let step = seekbar.clientWidth / nodeOrder.length;

    if(!seekbarSet){ //move the seekbar thumb
        let graphScrollWrapper = document.getElementById("graphScrollWrapper");
        
        if((playIndex + 2) * step > seekbarWrapper.clientWidth + seekbarWrapper.scrollLeft){
            seekbarWrapper.scrollLeft += step;
            graphScrollWrapper.scrollLeft = seekbarWrapper.scrollLeft;
        }
        
        seekbar.value = playIndex + 1;
    }
            
    node.codeWindow.showNextNode();
    
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
        let seekbar = document.getElementById("seekbar");
        let seekbarWrapper = document.getElementById("seekbarWrapper");
        let step = seekbar.clientWidth / nodeOrder.length;
        
        if(!scrollbarSet){
            let graphScrollWrapper = document.getElementById("graphScrollWrapper");
            
            
            if((playIndex - 1) * step < seekbarWrapper.scrollLeft){
                seekbarWrapper.scrollLeft -= step;
                graphScrollWrapper.scrollLeft = seekbarWrapper.scrollLeft;
            }

            seekbar.value = playIndex;
        }

        nodeOrder[playIndex].codeWindow.hideLastNode();
        
        let slidingWindow = document.getElementById("slidingWindow");
        slidingWindow.style.left = (step * playIndex + 30 - parseInt(slidingWindow.style.width) + 174) + "px";
        
        //change the active codeWindow
        if(playIndex > 1 && nodeOrder[playIndex].codeWindow.file !== nodeOrder[playIndex - 1].codeWindow.file){
            nodeOrder[playIndex].codeWindow.setActive(false);
            nodeOrder[playIndex - 1].codeWindow.setActive(true);
            
            //removeLastLine();
        }
        playIndex--;
    }
}

(function(){
    let playButton = document.getElementById("playButton");
    
    playButton.onclick = function(){
        //check if there is anything to be played
        if(project !== null && project.getFixations().length > 0){ 
            if(playButton.classList.contains("paused")){ //if the playback is paused then start it
                paused = false;
                playButton.classList.remove("paused");
                //start playback from the last known position
                loop(project.getFixations().length - (playIndex + 1)); 
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
        if(playIndex < project.getFixations().length - 1){
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