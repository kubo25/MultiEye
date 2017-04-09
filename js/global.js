const fs = require("fs");
const path = require("path");

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