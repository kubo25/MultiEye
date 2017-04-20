let contextPattern = null;

class Pattern{
    constructor(arg){
        this.id = savedPatterns.length;
        this.fixations = [];
        this.line = null;
        
        if(typeof arg === "string"){
            this.type = arg;
            this.typeToRestore = this.type;
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
            
            this.fixations.sort(function(a, b){
                let aID = parseInt(a.node.id());
                let bID = parseInt(b.node.id());

                return (aID === bID) ? 0 :
                       ((aID > bID) ? 1 : -1);
            });
            
            project.changesPending = true;
            project.savePattern(this);
            new Action("create", this);
            redoArray = [];
        }
        else{
            this.type = arg.type;
            this.typeToRestore = this.type;
            
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
        
        sortPatternLines();
    }
    
    _createPatternLine(){
        let patternWrapper = document.getElementById("patternWrapper"); 
        this.line  = document.createElement("div");
             
        let firstFixationId = this.fixations[0].node.id();
        let lastFixationId = this.fixations[this.fixations.length - 1].node.id();
        
        if(firstFixationId == undefined || lastFixationId == undefined){
            console.log(this);
        }
        
        let start = parseFloat(document.getElementById("fix" + firstFixationId).style.left);
        let end = parseFloat(document.getElementById("fix" + lastFixationId).style.left);
        
        let width = end - start + 1;
        
        this.line.style.left = start + "px";
        this.line.style.width = width + "px";
        this.line.dataset.pattern = this.type + ": " + firstFixationId + " - " + lastFixationId;
        this.line.dataset.patternid = this.id;
        this.line.dataset.firstFixationid = firstFixationId;
        this.line.dataset.lastFixationid = lastFixationId;
        this.line.classList.add("patternLine");        
        this.line.onclick = function(){
            savedPatterns[this.dataset.patternid].displayPattern();  
        }
        
        let pattern = this;
    
        this.line.oncontextmenu = function(e){
            contextPattern = pattern;
            let contextMenu = document.getElementById("patternMenu");
            let patternGraph = document.getElementById("patternGraph");
            let boundinggClient = patternGraph.getBoundingClientRect();
            contextMenu.style.top = (e.clientY - boundinggClient.top + patternGraph.scrollTop) + "px";
            contextMenu.style.left = e.clientX + "px";
            contextMenu.classList.add("contextMenuOpen");
        }
        
        for(const fixation of this.fixations){
            let div = document.createElement("div");
            let id = parseInt(fixation.node.id());
            
            let fixationLineLeft = parseFloat(document.getElementById("fix" + id).style.left);
            
            div.style.left = (fixationLineLeft - start) + "px";
            this.line.appendChild(div);
        }
                
        patternWrapper.appendChild(this.line);
    }
    
    displayPattern(){
        for(const codeWindow of codeWindows){
            codeWindow.cy.$(".selected").removeClass("selected");
        }
        
        for(const fixation of this.fixations){
            fixation.node.addClass("selected");
        }
        
        let lastFixationid = parseInt(this.fixations[this.fixations.length - 1].node.id());
        
        if(lastFixationid > playIndex){
            loop(lastFixationid - playIndex, true, false);
        }
        else{
            for(let i = playIndex; i > lastFixationid; i--){
                previousStep();
            }
        } 
    }
    
    changeType(type){
        this.typeToRestore = "";
        this.typeToRestore += this.type;
        this.type = type;
        this.line.dataset.pattern = this.type + ": " + this.line.dataset.firstFixationid + " - " + this.line.dataset.lastFixationid;
    }
    
    changeFixations(){
        this.restoreFixations = [];
        
        for(const fixation of this.fixations){
            this.restoreFixations.push(fixation);
        }
        
        this.fixations = [];
        
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
            return false;
        }
        
        this.fixations.sort(function(a, b){
            let aID = parseInt(a.node.id());
            let bID = parseInt(b.node.id());

            return (aID === bID) ? 0 :
                   ((aID > bID) ? 1 : -1);
        });
        
        this._changePatternLine();
        return true;
    }
    
    _changePatternLine(){
        this.line.parentElement.removeChild(this.line);
        this._createPatternLine();
        sortPatternLines();
    }
    
    delete(undo = false){
        this.line.parentElement.removeChild(this.line);
        savedPatterns.splice(savedPatterns.indexOf(this), 1);
        project.getPatterns().splice(this.id, 1);
        project.changesPending = true;
        
        if(!undo){
            new Action("delete", this);
            redoArray = [];
        }
    }
    
    restore(){
        this._createPatternLine();
        sortPatternLines();
        savedPatterns.push(this);
        project.savePattern(this);
    }
            
    restoreType(){
        let temp = this.type;
        this.type = this.typeToRestore;
        this.typeToRestore = temp;
        this.line.dataset.pattern = this.type + ": " + this.line.dataset.firstFixationid + " - " + this.line.dataset.lastFixationid;
    }
    
    restoreChanges(){
        this.restoreType();
        let temp = this.fixations;
        this.fixations = this.restoreFixations;
        this.restoreFixations = temp;
        
        this._changePatternLine();
        
        project.changePattern(this);
    }
    
    edit(){
        editingPattern = this;
        project.changesPending = true;
        document.getElementById("editButtons").classList.add("editButtonsVisible");
        this.displayPattern();
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
    let hideGraph = document.getElementById("hideGraph");
    hideGraph.onclick = function(){
        let graphSection = document.getElementById("patternGraph");
        let scaleUp = graphSection.classList.toggle("hidden");
        
        setTimeout(function(){
            if(scaleUp){
                 changeScale(false, window.innerHeight - 110);
            }
            else{
                changeScale(true, window.innerHeight - 250);    
            }
        }, 250);
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
            
            let slidingWindow = document.getElementById("slidingWindow");
            
            slidingWindow.style.transform = scaleX;
            slidingWindow.style.left = (parseInt(slidingWindow.style.left) + 30 * lastScale) + "px";
            
            loop(1, true, true);
            previousStep(true);
            
            let newHeight = patternWrapper.getBoundingClientRect().height;

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
        
        let slidingWindow = document.getElementById("slidingWindow");
        
        let transform = "scaleX(" + lastScale + ") translateX(" + (-seekbarWrapper.scrollLeft / lastScale) + "px)";
        
        slidingWindow.style.transform = transform;
    }
    
    document.getElementById("delete").onclick = function(e){
        contextPattern.delete();
        contextPattern = null;
    }
    
    document.getElementById("edit").onclick = function(e){
        contextPattern.edit();
    }
    
    document.getElementById("cancelEdit").onclick = function(){
        editingPattern.restoreType();
        editingPattern.typeToRestore = editingPattern.type;
        editingPattern = null;
        document.getElementById("editButtons").classList.remove("editButtonsVisible");
        for(const codeWindow of codeWindows){
            codeWindow.cy.$(".selected").removeClass("selected");
        }
    }
    
    document.getElementById("saveEdit").onclick = function(){        
        let commitChanges = editingPattern.changeFixations();
        
        if(commitChanges){
            new Action("edit", editingPattern);
            redoArray = [];
            project.changePattern(editingPattern);
        }
                
        editingPattern = null;
        document.getElementById("editButtons").classList.remove("editButtonsVisible");
        for(const codeWindow of codeWindows){
            codeWindow.cy.$(".selected").removeClass("selected");
        }
    }
})();