const fs = require("fs");
const path = require("path");

//Configuration object
let config = null;

//Array of codeWindows
let codeWindows = [];

//Project file information
let projectFilePath;
let project = null;

//Order of fixations
let nodeOrder = [];

//Array of patterns
let savedPatterns = [];

//Array of fileLines
let fileLines = [];

//Playback indexes
let playIndex = -1; //integer that says on what index of nodeOrder is the playback currently
let fileIndex = 0;

//Array prototype function for codeWindows array to find which CodeWindow has (file)
Array.prototype.objectWithFile = function(file){
    for(let i = 0; i < this.length; i++){
        if(this[i].file === file){
            return this[i];
        }
    }    
    return null;
}


function applyPreferences(oldConfig, newConfig){
    let index = playIndex - oldConfig.fixationsDisplayed;
    index = (index > 0) ? index : 0;
    let slidingWindow = document.getElementById("slidingWindow");
    
    if(oldConfig.fixationsDisplayed !== newConfig.fixationsDisplayed){
        let seekbar = document.getElementById("seekbar");
        let step = 1700 / nodeOrder.length;


        slidingWindow.style.width = (newConfig.fixationsDisplayed * step) + "px";
        slidingWindow.style.left = (step * (playIndex + 1) + 30 - newConfig.fixationsDisplayed * step + 174) + "px";

        loop(1, true, true);
        previousStep(true);

        if(oldConfig.fixationsDisplayed < newConfig.fixationsDisplayed){
            let diff = newConfig.fixationsDisplayed - oldConfig.fixationsDisplayed;


            for(let i = index; i > index - diff && i >= 0; i--){
                let node = nodeOrder[i].codeWindow.cy.$("#" + i);
                let edge = nodeOrder[i].codeWindow.cy.$("#edge" + i);
                node.style({"opacity": 1});
                edge.style({"opacity": 1});
            }
        }
        else{
            let diff = playIndex - newConfig.fixationsDisplayed + 1;

            for(let i = 0; i < index + diff && i < nodeOrder.length; i++){
                let node = nodeOrder[i].codeWindow.cy.$("#" + i);
                let edge = nodeOrder[i].codeWindow.cy.$("#edge" + i);
                node.style({"opacity": 0});
                edge.style({"opacity": 0});
            }
        }   
    }
    
    if(newConfig.showSlidingWindow){
        slidingWindow.style.display = "block";
    }
    else{
        slidingWindow.style.display = "none";
    }
}