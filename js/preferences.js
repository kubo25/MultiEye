const {ipcRenderer} = require("electron");
const {remote} = require("electron");

let config;

ipcRenderer.on("config", function(event, configObj){
    config = configObj;
    
    document.getElementById("fixationCount").value = config.fixationsDisplayed;
});

function apply(){
    config.fixationsDisplayed = parseInt(document.getElementById("fixationCount").value);
    
    ipcRenderer.send("config", config);
}

function ok(){
    apply();
    cancel();
}

function cancel(){
    remote.getCurrentWindow().close();
}