const {ipcRenderer} = require("electron");
const {remote} = require("electron");

let config;

ipcRenderer.on("config", function(event, configObj){
    config = configObj;
    
    document.getElementById("fixationCount").value = config.fixationsDisplayed;
    document.getElementById("showSlidingWindow").checked = config.showSlidingWindow;
});

function apply(){
    config.fixationsDisplayed = parseInt(document.getElementById("fixationCount").value);
    config.showSlidingWindow = document.getElementById("showSlidingWindow").checked;
    
    ipcRenderer.send("config", config);
}

function ok(){
    apply();
    cancel();
}

function cancel(){
    remote.getCurrentWindow().close();
}