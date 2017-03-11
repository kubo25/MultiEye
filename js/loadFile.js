const fs = require("fs");
const path = require("path");

let jsonFilePath;
let nodeOrder = [];
let project = null;

Array.prototype.objectWithFile = function(file){
    for(let i = 0; i < this.length; i++){
        if(this[i].file === file){
            return this[i];
        }
    }    
    return null;
}

function loadFile(hidden, file){
    let codeWindow = new CodeWindow(hidden, file);
    
    let data = fs.readFileSync(file, "utf-8");
    
    codeWindow.addText(data);
    codeWindows.push(codeWindow);
    
    return codeWindow;
}

function loadAllNodes(){
    let lastColor = null;
    
    for(const json of project.getFixations()){
        playIndex++;
    
        let codeWindow = codeWindows.objectWithFile(json.file);

        if(codeWindow === null){
            codeWindow = loadFile(true, json.file);
        }

        if(playIndex < project.getFixations().length - 1 && json.file !== project.getFixations()[playIndex + 1].file){
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
    }
    
    playIndex = -1;
    
    for(const pattern of project.getPatterns()){
        new Pattern(pattern);
    }
}

(function() {   
    let body = document.getElementsByTagName("body")[0];
    
    body.ondragover = () => {
        body.style.opacity = 0.3;
        
        return false;
    }
    
    body.ondragleave = () => { 
        body.style.opacity = 1;

        return false;
    }
    
    body.ondragend = () => {
        return false;
    }
    
    body.ondrop = (e) => {
        e.preventDefault();
        
        body.style.opacity = 1;

        for (let i = 0; i < e.dataTransfer.files.length; i++) {
            let file = e.dataTransfer.files[i];
            jsonFilePath = file.path;
            let data = fs.readFileSync(jsonFilePath, 'utf-8');     
            let extension = path.extname(jsonFilePath);
                        
            if(extension === ".json"){
                project = new Project(JSON.parse(data));
                loadAllNodes();
                document.getElementById("seekbar").max = project.getFixations().length;
            }
            else{               
                loadFile(false, jsonFilePath);
            }
        }

        return false;
    };
})();