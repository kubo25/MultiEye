let paused = true;
let playIndex = -1;

function loop(i, next = false, seekbarSet = false){
    playIndex++;
    
    let node = nodeOrder[playIndex];
    
    node.codeWindow.setVisible();
    node.codeWindow.setActive(true);
    
    if(playIndex > 0 && node.codeWindow.id !== nodeOrder[playIndex - 1].codeWindow.id){
        nodeOrder[playIndex - 1].codeWindow.setActive(false);
    }
    
    let duration = (next) ? 1 : node.duration;
    
    if(!seekbarSet){
        document.getElementById("seekbar").value = playIndex + 1;
    }
            
    node.codeWindow.showNextNode();
    
    if(next || !paused){
        setTimeout(function(){
            if(--i > 0){
                loop(i, next, seekbarSet);
            }
            else{              
                paused = true;
                document.getElementById("playButton").classList.add("paused");
            }
        }, duration);
    }
    else if(paused){
        playIndex--;
    }
}

function previousStep(){
    if(playIndex >= 0){
        document.getElementById("seekbar").value = playIndex;
        nodeOrder[playIndex].codeWindow.hideLastNode();
        
        if(playIndex > 1 && nodeOrder[playIndex].codeWindow.file !== nodeOrder[playIndex - 1].codeWindow.file){
            nodeOrder[playIndex].codeWindow.setActive(false);
            nodeOrder[playIndex - 1].codeWindow.setActive(true);
        }
        playIndex--;
    }
}

(function(){
    let playButton = document.getElementById("playButton");
    
    playButton.onclick = function(){
        if(project !== null && project.getFixations().length > 0){
            if(playButton.classList.contains("paused")){
                paused = false;
                playButton.classList.remove("paused");

                loop(project.getFixations().length - (playIndex + 1));
            }
            else{
                paused = true;
                playButton.classList.add("paused");
            }
        }
    };
    
    let nextButton = document.getElementById("nextButton");
    
    nextButton.onclick = function(){
        if(playIndex < project.getFixations().length - 1){
            loop(1, true);
        }
    };
    
    let previousButton = document.getElementById("previousButton");
    
    previousButton.onclick = previousStep;
    
    let seekbar = document.getElementById("seekbar");
    
    seekbar.oninput = function(){
        if(nodeOrder.length > 0){
            if(this.value > playIndex){
                loop(this.value - playIndex - 2, true, true);
            }
            else{
                for(let i = playIndex + 1; i > this.value; i--){
                    previousStep();
                }
            }
        }
    }
})();