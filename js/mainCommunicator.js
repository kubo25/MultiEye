const {ipcRenderer} = require("electron");

//Communication with the main process to save the project
ipcRenderer.on("save", function(event, message){
    ipcRenderer.send("save", [projectFilePath, project.getFile()]);
});

ipcRenderer.on("saveAs", function(event, message){
   ipcRenderer.send("saveAs", [projectFilePath, project.getFile()]);
});

ipcRenderer.on("open", function(event, filePath){
    loadFile(filePath);
});

ipcRenderer.on("export", function(event, message){
    let patternPath = path.dirname(projectFilePath).replace(/\\/g, "\\\\") + "\\" + path.basename(projectFilePath, ".json") + "Patterns.json";
    ipcRenderer.send("export", [patternPath, project.getPatterns()]); 
});

ipcRenderer.on("import", function(event, filePath){
    importPatterns(filePath)
});

ipcRenderer.on("config", function(event, configObj){
    if(config !== null && playIndex > 0){
        applyPreferences(config, configObj);
    }
    
    config = configObj; 
});