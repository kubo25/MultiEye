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