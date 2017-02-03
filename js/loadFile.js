(function() {   
    const fs = require("fs");
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
            
            codeWindows.push(new CodeWindow());
            addText(codeWindowsCount, data);
            
            codeWindowsCount++;
            
        }

        return false;
    };
})();

function addText(id, data){  
    let lines = document.querySelector("#" + codeWindows[id].editorId + " .view-lines");
    
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            let newHeight = mutation.target.scrollHeight + "px";
            let newWidth = (mutation.target.scrollWidth + 20) + "px";
            
            codeWindows[id].setSize(newHeight, newWidth);
        });    
    });
    
    var config = { attributes: true, childList: false, characterData: false };
    observer.observe(lines, config);    
    
    codeWindows[id].editor.setValue(data);
       
    setTimeout(function(){
        observer.disconnect();
    }, 1000);
}