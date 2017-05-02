//Function creates a new CodeWindow object with text from file 
function loadFile(filePath){    
    let extension = path.extname(filePath);

    if(extension === ".json"){
        let data = fs.readFileSync(filePath, 'utf-8');    

        if(project !== null){
            ipcRenderer.send("open", filePath);
            return;
        }

        document.title += " - " + filePath;
        
        project = new Project(JSON.parse(data), filePath);
        loadProject();

        createTicks();
    }
}

//Function loads all fixations and patterns
function loadProject(){
    let lastColor = null;
    let wholeProject = project.getWhole();
    let fixations = project.getFixations();
    
    for(let i = 0; i < wholeProject.length; i++){    
        let codeWindow = codeWindows.objectWithFile(wholeProject[i].Data.path); //find if CodeWindow with file already exists

        if(codeWindow === null){
            codeWindow = new CodeWindow(wholeProject[i].Data.path);
            
            let data = fs.readFileSync(wholeProject[i].Data.path, "utf-8");
            let extension = path.extname(wholeProject[i].Data.path);
            
            codeWindow.addText(data, extension);
            codeWindows.push(codeWindow);
        }
        
        if(wholeProject[i].Name !== "Fixation"){
            continue;
        }

        nodeIndex++;
        
        //if next fixation is in another file then generate a color for current fixations
        if(nodeIndex < fixations.length - 1 && fixations[nodeIndex].Data.path !== fixations[nodeIndex + 1].Data.path){
            lastColor = '#'+Math.random().toString(16).substr(-6);
            
            codeWindow.addNode(fixations[nodeIndex], lastColor);
        }
        else if(lastColor !== null){ //if current fixation is first in this file set its color
            codeWindow.addNode(fixations[nodeIndex], lastColor);
            lastColor = null;
        }
        else{
            codeWindow.addNode(fixations[nodeIndex]);
        }
    }
    
    changeScale(true, window.innerHeight - 110, true);
    
    nodeIndex = -1; //reinitialize nodeIndex
}

function createTicks(){
    let max = project.getWhole().length;
    let patternWrapper = document.getElementById("patternWrapper");
    let tickWrapper = document.getElementById("tickWrapper");
    let seekbar = document.getElementById("seekbar");
    
    let step = seekbar.clientWidth / max;

    seekbar.max = max; //set the number of steps on seekbar to the amount of fixations

    tickWrapper.style.width = seekbar.clientWidth + "px";
    
    let fixationCounter = 0;
    for(let i = 0; i < max; i++){
        if(project.getWhole()[i].Name !== "Fixation"){
            continue;
        }
        
        nodeOrder[fixationCounter].playIndex = i;
        
        let tick = document.createElement("div");
        let div = document.createElement("div");
        tick.classList.add("tick");        
        tick.style.left = ((i + 1) * step) + (11 - 22 * (i / max)) + "px";
        tick.appendChild(div);
        tickWrapper.appendChild(tick);
        
        let line = document.createElement("div");      
        line.style.left = ((i + 1) * step) + (11 - 22 * (i / max)) + "px";
        line.setAttribute("id", "fix" + fixationCounter);
        line.classList.add("fixation");
        line.textContent = fixationCounter;
        
        let fontSize = 80 / (max - 1);
        
        line.style.fontSize = ((fontSize > 1.5) ? 1.5 : fontSize) + "em";
        
        patternWrapper.appendChild(line);
        
        fixationCounter++;
    }
    
    if(project.getPatterns() !== undefined){
         //load all patterns saved in project
        for(const pattern of project.getPatterns()){
            new Pattern(pattern);
        }

        sortPatternLines();   
    }
    
    let slidingWindow = document.getElementById("slidingWindow");
    
    slidingWindow.style.width = (config.fixationsDisplayed * step) + "px";
    slidingWindow.style.left = (174 + 30 - config.fixationsDisplayed * step) + "px";
}

function importPatterns(filePath){
    let patterns = fs.readFileSync(filePath, "utf-8");
    
    project.setPatterns(JSON.parse(patterns));
    
    for(const pattern of project.getPatterns()){
        new Pattern(pattern);
    }
    
    sortPatternLines();
}

(function() {   
    let body = document.getElementsByTagName("body")[0];
    
    body.ondragover = function(){
        body.style.opacity = 0.3;
        
        return false;
    }
    
    body.ondragleave = function(){ 
        body.style.opacity = 1;
        
        return false;
    }
    
    body.ondrop = function(e){
        e.preventDefault();
        
        body.style.opacity = 1;

        let file = e.dataTransfer.files[0];
        
        loadFile(file.path);
        
        return false;
    };
})();