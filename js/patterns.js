let savedPatterns = [];

class Pattern{
    constructor(arg){
        this.id = savedPatterns.length;
        this.fixations = [];
        
        if(typeof arg === "string"){
            this.type = arg;
            for(const codeWindow of codeWindows){
                let selected = codeWindow.cy.$(".selected");

                for(let i = 0; i < selected.length; i++){
                    this.fixations.push({
                        "node": selected[i], 
                        "codeWindow": codeWindow
                    });

                    selected[i].removeClass("selected");
                }
            }

            if(this.fixations.length == 0){
                return;
            }
            
            project.savePattern(this);
        }
        else{
            this.type = arg.type;
                    
            for(const fixation of arg.fixations){
                let codeWindow = codeWindows.objectWithFile(fixation.file);
                
                this.fixations.push({
                    "node": codeWindow.getNodeWithId(fixation.id),
                    "codeWindow": codeWindow
                });
            }
        }
        
        savedPatterns.push(this);
        
        this._updateList();
        this._showOnSeekbar();
    }
    
    _updateList(){
        let ul = document.getElementById("savedPatterns");
        let li = document.createElement("li");
        this.patternString = this.type + ": ";
        
        for(const fixation of this.fixations){
            this.patternString += fixation.node.id();
            
            if(fixation !== this.fixations[this.fixations.length - 1]){
                this.patternString += ", ";
            }
        }

        li.innerHTML = this.patternString;
        li.dataset.patternID = this.id;
        li.onclick = function(){
            savedPatterns[this.dataset.patternID].displayPattern();
        };

        ul.appendChild(li);
    }
    
    _showOnSeekbar(){
        let seekbarWrapper = document.getElementById("seekbarWrapper");
        let stepWidth = seekbarWrapper.firstElementChild.clientWidth / nodeOrder.length;
        
        let lastFixationId = parseInt(this.fixations[this.fixations.length - 1].node.id());
        
        let seekbarDiv = document.getElementById(lastFixationId);
        let seekbarUl = null;
        
        if(seekbarDiv === null){
            let seekbarDivWrapper = document.createElement("div");
            seekbarDivWrapper.classList.add("seekbarPattern");
            
            let position = ((lastFixationId + 1) * stepWidth) + (11 - 2 * 11 * (lastFixationId / nodeOrder.length));
            
            seekbarDivWrapper.style.left = position + "px";
            seekbarDiv = document.createElement("div");
            seekbarDiv.id = lastFixationId;
            
             seekbarUl = document.createElement("ul");
            
            if(position + 2 * 240 >= window.innerWidth){
                seekbarUl.style.left = "-240px";
            }
            
            seekbarWrapper.appendChild(seekbarDivWrapper);
            seekbarDivWrapper.appendChild(seekbarDiv);
            seekbarDiv.appendChild(seekbarUl);
        }
        else{
            seekbarUl = seekbarDiv.firstChild;  
        }
        
        let seekbarLi = document.createElement("li");
        seekbarLi.innerHTML = this.patternString;
        seekbarLi.dataset.patternID = this.id;
        seekbarLi.dataset.lastFixationID = lastFixationId;
        seekbarLi.onclick = function(){
            savedPatterns[this.dataset.patternID].displayPattern();

            if(this.dataset.lastFixationID > playIndex){
                loop(this.dataset.lastFixationID - playIndex, true, false);
            }
            else{
                for(let i = playIndex; i > this.dataset.lastFixationID; i--){
                    previousStep();
                }
            }
        }
        seekbarUl.appendChild(seekbarLi);
    }
    
    displayPattern(){
        for(const fixation of this.fixations){
            fixation.node.addClass("selected");
        }
    }
}

(function(){
    let buttons = document.querySelectorAll(".patternButton");
    
    for(const button of buttons){
        button.onclick = function(){
            new Pattern(this.innerHTML);
        }
    }
})();