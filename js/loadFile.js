const fs = require("fs");
const path = require("path");

let nodeOrder = [];

function loadFile(hidden, file){
    let codeWindow = new CodeWindow(hidden, file);
    
    let data = fs.readFileSync(file, "utf-8");
    
    codeWindow.addText(data);
    codeWindows.push(codeWindow);
    
    return codeWindow;
}

function loadAllNodes(jsonArray){
    let lastColor = null;
    
    for(const json of jsonArray){
        playIndex++;
    
        let codeWindow = codeWindows.objectWithFile(json.file);

        if(codeWindow === null){
            codeWindow = loadFile(true, json.file);
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
    }
    
    playIndex = -1;
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
            let data = fs.readFileSync(file.path, 'utf-8');     
            let extension = path.extname(file.path);
                        
            if(extension === ".json"){
                jsonArray = JSON.parse(data);
                loadAllNodes(jsonArray);
                document.getElementById("seekbar").max = jsonArray.length;
            }
            else{               
                loadFile(file.path);
            }
        }

        return false;
    };
})();