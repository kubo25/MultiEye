const {ipcRenderer} = require("electron");

//Communication with the main process to save the project
ipcRenderer.on("save", function(event, message){
    project.changesPending = false;
    ipcRenderer.send("save", [project.filePath, project.getFile()]);
});

ipcRenderer.on("saveAs", function(event, message){
   ipcRenderer.send("saveAs", [project.filePath, project.getFile()]);
});

ipcRenderer.on("open", function(event, filePath){
    loadFile(filePath);
});

ipcRenderer.on("export", function(event, message){
    let patternPath = path.dirname(project.filePath).replace(/\\/g, "\\\\") + "\\" + path.basename(project.filePath, projectExtension) + "Patterns" + projectExtension;
    ipcRenderer.send("export", [patternPath, project.getPatterns()]); 
});

ipcRenderer.on("import", function(event, filePath){
    importPatterns(filePath)
});

ipcRenderer.on("config", function(event, configObj){
    applyPreferences(config, configObj);
        
    config = configObj; 
});

ipcRenderer.on("newPath", function(event, filePath){
    project.filePath =  filePath;
    project.changesPending = false;
    
    document.title = "MultiEye - " + filePath;
});

ipcRenderer.on("undo", function(event, message){
    if(undoArray.length > 0){
        undoArray[undoArray.length - 1].undo();
    }
});

ipcRenderer.on("redo", function(event, message){
    if(redoArray.length > 0){
        redoArray[redoArray.length - 1].redo();
    }
});

window.onbeforeunload = function(e){
    if(project.changesPending){
        const {remote} = require("electron");
        const {dialog} = require("electron").remote;
    
        let d = dialog.showMessageBox(
            remote.getCurrentWindow(),
            {
                type: "warning",
                buttons: ["Yes", "No", "Cancel"],
                title: "MultiEye",
                message: "Do you want to save changes to '" + project.filePath + "' before closing?"
        });
        
         switch(d){
            case 0:
                ipcRenderer.send("closingSave", [project.filePath, project.getFile()]);
            case 1:
                return;
            case 2:
                return "false";
        }
    }
};