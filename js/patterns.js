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
        
        this._createPatternLine();
        
        if(sort === true){
            sortPatternLines();
        }
    }
    
    _createPatternLine(){
        let patternWrapper = document.getElementById("patternWrapper"); 
        let line  = document.createElement("div");
             
        let firstFixationId = this.fixations[0].node.id();
        let lastFixationId = this.fixations[this.fixations.length - 1].node.id();
        
        let start = parseFloat(document.getElementById("fix" + firstFixationId).style.left);
        let end = parseFloat(document.getElementById("fix" + lastFixationId).style.left);
        
        let width = end - start + 1;
        
        line.style.left = start + "px";
        line.style.width = width + "px";
        line.dataset.pattern = this.type + ": " + firstFixationId + " - " + lastFixationId;
        line.dataset.patternid = this.id;
        line.dataset.firstFixationid = firstFixationId;
        line.dataset.lastFixationid = lastFixationId;
        line.classList.add("patternLine");
        line.onclick = function(){
            savedPatterns[this.dataset.patternid].displayPattern();

            if(this.dataset.lastFixationid > playIndex){
                loop(this.dataset.lastFixationid - playIndex, true, false);
            }
            else{
                for(let i = playIndex; i > this.dataset.lastFixationid; i--){
                    previousStep();
                }
            }
        }
        
        for(const fixation of this.fixations){
            let div = document.createElement("div");
            let id = parseInt(fixation.node.id());
            
            let fixationLineLeft = parseFloat(document.getElementById("fix" + id).style.left);
            
            div.style.left = (fixationLineLeft - start) + "px";
            line.appendChild(div);
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
        let aID = parseInt(a.dataset.firstFixationid);
        let bID = parseInt(b.dataset.firstFixationid);
        
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
        let scaleDown = graphSection.classList.toggle("hidden");
    }
    
    let patternWrapper = document.getElementById("patternWrapper");
    let patternGraph = document.getElementById("patternGraph");
    let tickWrapper = document.getElementById("tickWrapper");
    let seekbar = document.getElementById("seekbar");
    let push = document.getElementById("push");
    let pushBottom = document.getElementById("pushBottom");
        
    let lastScale = 1;
    let originalWidth = seekbar.clientWidth;
    let originalHeight;
    
    patternGraph.onwheel = function(e){
        if(e.ctrlKey){
            if(lastScale === 1){
                originalHeight = patternWrapper.clientHeight;
            }    
            
            lastScale -= e.deltaY / 1000;
            
            if(lastScale < 1){
                lastScale = 1;
            }
            
            let scale = "scale(" + lastScale + ")";
            let scaleX = "scaleX(" + lastScale + ")";

            patternWrapper.style.transform = scale;
            tickWrapper.style.transform = scaleX;
            seekbar.style.width = (originalWidth * lastScale) + "px";
            push.style.width = (lastScale * 100) + "%";
            
            let newHeight = patternWrapper.getBoundingClientRect().height;
            
            console.log(originalHeight);
            console.log(newHeight);
            
            pushBottom.style.height = (1.1 * (newHeight - originalHeight) + 10) + "px";
        }
        else{
            return true;
        }
    }
    
    let seekbarWrapper = document.getElementById("seekbarWrapper");
    let graphScrollWrapper = document.getElementById("graphScrollWrapper");
    
    seekbarWrapper.onscroll = function(e){
        graphScrollWrapper.scrollLeft = seekbarWrapper.scrollLeft;
    }
})();