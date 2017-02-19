const fs = require("fs");
const path = require("path");

function loadFile(file){
    let codeWindow = new CodeWindow(file);
    
    let data = fs.readFileSync(file, "utf-8");
    
    codeWindow.addText(data);
    codeWindows.push(codeWindow);
    codeWindowsCount++;
    
    return codeWindow;
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
                document.getElementById("seekbar").max = jsonArray.length;
            }
            else{               
                loadFile(file.path);
            }
        }

        return false;
    };
})();