(function() {
    const fs = require("fs");
    var body = document.getElementsByTagName("body")[0];
    
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
            
            codeWindows.push(new CodeWindow());
            addText(codeWindowsCount, data);
            
            codeWindowsCount++;
            
        }

        return false;
    };
})();

function addText(id, data){
    setTimeout(function(){
        codeWindows[id].editor.setValue(data);
        document.getElementById(codeWindows[id].editorId).style.height = 
            (document.getElementById(codeWindows[id].editorId).scrollHeight + 10) + "px";
        codeWindows[id].editor.layout();

    }, 1);
}