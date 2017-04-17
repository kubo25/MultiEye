const {ipcRenderer} = require("electron");
const {remote} = require("electron");

let config;

ipcRenderer.on("config", function(event, configObj){
    config = configObj;
    
    document.getElementById("fixationCount").value = config.fixationsDisplayed;
    document.getElementById("showSlidingWindow").checked = config.showSlidingWindow;
    
    let selectedLanguage = document.getElementById("selectedLanguage");
    selectedLanguage.dataset.selectedLanguage = configObj.language;
    selectedLanguage.innerHTML = configObj.languageVisibleText;
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

(function(){
    document.getElementById("selectedLanguage").onclick =  function(){
        this.classList.toggle("selectingLanguage");
        document.getElementById("languageSelectSlide").classList.toggle("open");
    }
    
    let languageButtons = document.querySelectorAll("#languageSelectSlide li");
    
    for(const button of languageButtons){
        button.onclick = function(){            
            config.language = this.dataset.language;
            config.languageVisibleText = this.innerHTML;
            
            let span = document.getElementById("selectedLanguage");
            span.innerHTML = this.innerHTML;
            span.classList.toggle("selectingLanguage");
            document.getElementById("languageSelectSlide").classList.toggle("open");
        }
    }
})();