class Pattern{
    constructor(arg, sort){
        this.id = savedPatterns.length;
        this.fixations = [];
        
        if(typeof arg === "string"){
            this.type = arg;
            for(const codeWindow of codeWindows){
                let selected = codeWindow.cy.$(".selected"); //get every selected node

                for(let i = 0; i < selected.length; i++){ //Create fixation object for every selected node
                    this.fixations.push({                 //in format: {
                        "node": selected[i],              //                "node": (nodeObject),
                        "codeWindow": codeWindow          //                "codeWindow: (codeWindow)
                    });                                   //            }

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
        this._createPatternLine();
        
        if(sort === true){
            sortPatternLines();
        }
    }
    
    //Method adds newly created patterns into the Saved patterns area on the right
    _updateList(){
        let ul = document.getElementById("savedPatterns");
        let li = document.createElement("li");
        this.patternString = this.type + ": " + this.fixations[0].node.id() + " - " + this.fixations[this.fixations.length - 1].node.id();

        li.innerHTML = this.patternString;
        li.dataset.patternID = this.id;
        li.onclick = function(){
            savedPatterns[this.dataset.patternID].displayPattern();
        };

        ul.appendChild(li);
    }
    
    //Method show newly created pattern on the seekbar
    _showOnSeekbar(){
        let seekbarWrapper = document.getElementById("seekbarWrapper");
        let stepWidth = seekbarWrapper.firstElementChild.clientWidth / nodeOrder.length;
        
        let lastFixationId = parseInt(this.fixations[this.fixations.length - 1].node.id());
        
        let seekbarDiv = document.getElementById(lastFixationId);
        let seekbarUl = null;
        
        if(seekbarDiv === null){ //If no other pattern ends in lastFixationId create new line
            let seekbarDivWrapper = document.createElement("div");
            seekbarDivWrapper.classList.add("seekbarPattern");
            
            let position = ((lastFixationId + 1) * stepWidth) + (11 - 22 * (lastFixationId / nodeOrder.length)); //position of line on seekbar -> position of xth step + compensation of seekbar thumb size(11: thumb radius, 22: thumb diamter)
            
            seekbarDivWrapper.style.left = position + "px";
            seekbarDiv = document.createElement("div");
            seekbarDiv.id = lastFixationId;
            
             seekbarUl = document.createElement("ul");
            
            if(position + 2 * 240 >= window.innerWidth){ //change direction of the tooltip to prevent clipping
                seekbarUl.style.left = "-240px";
            }
            
            seekbarWrapper.appendChild(seekbarDivWrapper);
            seekbarDivWrapper.appendChild(seekbarDiv);
            seekbarDiv.appendChild(seekbarUl);
        }
        else{
            seekbarUl = seekbarDiv.firstChild;  
        }
        
        let seekbarLi = document.createElement("li"); //create an element with this pattern's description
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
    
    _createPatternLine(){
        let patternWrapper = document.getElementById("patternWrapper"); 
        let line  = document.createElement("div");

        let start = parseInt(document.getElementById("fix" + this.fixations[0].node.id()).style.left);
        let end = parseInt(document.getElementById("fix" + this.fixations[this.fixations.length - 1].node.id()).style.left);
        
        let width = end - start + 1;
        
        line.style.left = start + "px";
        line.style.width = width + "px";
        line.dataset.pattern = this.patternString;
        line.dataset.patternID = this.id;
        line.dataset.firstFixationID = this.fixations[0].node.id();
        line.dataset.lastFixationID = this.fixations[this.fixations.length - 1].node.id();
        line.classList.add("patternLine");
        line.onclick = function(){
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
                
        patternWrapper.appendChild(line);
    }
    
    displayPattern(){
        for(const codeWindow of codeWindows){
            codeWindow.cy.$(".selected").removeClass("selected");
        }
        
        for(const fixation of this.fixations){
            fixation.node.addClass("selected");
        }
    }
}

function sortPatternLines(){
    let patternLines  = document.querySelectorAll(".patternLine");
    patternLines = Array.prototype.slice.call(patternLines, 1);
    
    patternLines.sort(function(a, b){
        let aID = parseInt(a.dataset.firstFixationID);
        let bID = parseInt(b.dataset.firstFixationID);
        
        return (aID === bID) ? 0 :
               ((aID > bID) ? 1 : -1);
    });
    
    let patternWrapper = document.getElementById("patternWrapper");
    let patternWrapperChildren = patternWrapper.children;
    
    for(let i = 1; i < patternWrapperChildren.length - 1; i++){    
        if(patternWrapperChildren[i].classList.contains("fixation")){
            continue;
        }
        
        patternWrapper.removeChild(patternWrapperChildren[i]);
    }
    
    for(const patternLine of patternLines){
        patternWrapper.appendChild(patternLine);
    }
}

(function(){
    let buttons = document.querySelectorAll(".patternButton");
    
    for(const button of buttons){
        button.onclick = function(){
            new Pattern(this.innerHTML, true);
        }
    }
    
    let hideGraph = document.getElementById("hideGraph");
    hideGraph.onclick = function(){
        let graphSection = document.getElementById("patternGraph");
        graphSection.classList.toggle("hidden");
    }
})();