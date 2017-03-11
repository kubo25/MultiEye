const {ipcRenderer} = require("electron");

ipcRenderer.on("save", function(event, message){
    ipcRenderer.send("save", [jsonFilePath, project.getFile()]);
});

ipcRenderer.on("saveAs", function(event, message){
   ipcRenderer.send("saveAs", [jsonFilePath, project.getFile()]);
});