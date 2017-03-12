const fs = require("fs");
const path = require("path");

let projectFilePath;
let nodeOrder = [];
let project = null;

//Array prototype function for codeWindows array to find which CodeWindow has (file)
Array.prototype.objectWithFile = function(file){
    for(let i = 0; i < this.length; i++){
        if(this[i].file === file){
            return this[i];
        }
    }    
    return null;
}

//Function creates a new CodeWindow object with text from file 
function loadFile(file){
    let codeWindow = new CodeWindow(file);
    
    let data = fs.readFileSync(file, "utf-8");
    
    codeWindow.addText(data);
    codeWindows.push(codeWindow);
    
    return codeWindow;
}

//Function loads all fixations and patterns
function loadProject(){
    let lastColor = null;
    
    for(const json of project.getFixations()){
        playIndex++;
    
        let codeWindow = codeWindows.objectWithFile(json.file); //find if CodeWindow with file already exists

        if(codeWindow === null){
            codeWindow = loadFile(json.file);
        }

        //if next fixation is in another file then generate a color for current fixations
        if(playIndex < project.getFixations().length - 1 && json.file !== project.getFixations()[playIndex + 1].file){
            lastColor = '#'+Math.random().toString(16).substr(-6);
            
            let node = codeWindow.addNode(json, lastColor);
            
            fileLines.push({
                "color": lastColor,
                "codeWindow1": codeWindow,
                "node1": node
            });
        }
        else if(lastColor !== null){ //if current fixation is first in this file set its color
            let node = codeWindow.addNode(json, lastColor);
            lastColor = null;
            
            fileLines[fileIndex].node2 = node;
            fileLines[fileIndex].codeWindow2 = codeWindow;
            fileIndex++;
        }
        else{
            codeWindow.addNode(json);
        }
    }
    
    playIndex = -1; //reinitialize playIndex
    fileIndex = 0; //reinitialize fileIndex
    
    //load all patterns saved in project
    for(const pattern of project.getPatterns()){
        new Pattern(pattern);
    }
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
        projectFilePath = file.path;
        let extension = path.extname(projectFilePath);

        if(extension === ".json"){
            let data = fs.readFileSync(projectFilePath, 'utf-8');    
            
            project = new Project(JSON.parse(data));
            loadProject();
            document.getElementById("seekbar").max = project.getFixations().length; //set the number of steps on seekbar to the amount of fixations
        }
        
        return false;
    };
})();