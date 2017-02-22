let paused = true;
let playIndex = -1;
let lastColor = null;

Array.prototype.objectWithFile = function(file){
    for(let i = 0; i < this.length; i++){
        if(this[i].file === file){
            return this[i];
        }
    }    
    return null;
}

function loop(i, next = false, seekbarSet = false){
    playIndex++;
    
    let json = jsonArray[playIndex];
    let codeWindow = codeWindows.objectWithFile(json.file);
        
    if(codeWindow === null){
        codeWindow = loadFile(json.file);
    }
    
    let duration = (next) ? 0 : json.duration;
    
    if(next || !paused){
        setTimeout(function(){
            if(!seekbarSet){
                document.getElementById("seekbar").value = playIndex + 1;
            }
            
            if(playIndex < jsonArray.length - 1 && json.file !== jsonArray[playIndex + 1].file){
                lastColor = '#'+Math.random().toString(16).substr(-6);
                codeWindow.addNode(json, lastColor);
            }
            else if(lastColor !== null){
                codeWindow.addNode(json, lastColor);
                lastColor = null;
            }
            else{
                codeWindow.addNode(json);
            }
            

            if(--i > 0){
                loop(i, next, seekbarSet, lastColor);
            }
            else{              
                paused = true;
                document.getElementById("playButton").classList.add("paused");
            }
        }, duration);
    }
}

function previousStep(){
    if(playIndex >= 0){
        document.getElementById("seekbar").value = playIndex;
        codeWindows[nodeOrder[nodeOrder.length - 1]].cy.remove("node#" + playIndex);
                    
        nodeOrder.pop();
        playIndex--;
    }
}

(function(){
    let playButton = document.getElementById("playButton");
    
    playButton.onclick = function(){
        if(playButton.classList.contains("paused")){
            paused = false;
            playButton.classList.remove("paused");
            
            loop(jsonArray.length - (playIndex + 1));
        }
        else{
            paused = true;
            playButton.classList.add("paused");
        }
    };
    
    let nextButton = document.getElementById("nextButton");
    
    nextButton.onclick = function(){
        if(playIndex < jsonArray.length - 1){
            loop(1, true);
        }
    };
    
    let previousButton = document.getElementById("previousButton");
    
    previousButton.onclick = previousStep;
    
    let seekbar = document.getElementById("seekbar");
    
    seekbar.oninput = function(){
        if(this.value > nodeOrder.length){
            loop(this.value - nodeOrder.length, true, true);
        }
        else{
            for(let i = nodeOrder.length; i > this.value; i--){
                previousStep();
            }
        }
    }
})();