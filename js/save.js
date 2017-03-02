const {ipcRenderer} = require("electron");

ipcRenderer.on("save", function(event, message){
    ipcRenderer.send("save", [jsonFilePath, jsonArray]);
});

ipcRenderer.on("saveAs", function(event, message){
   ipcRenderer.send("saveAs", [jsonFilePath, jsonArray]) ;
});