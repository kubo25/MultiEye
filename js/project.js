class Project{
    constructor(json, filePath){
        this.project = json;
        this.filePath = filePath;
        this.changesPending = false;
        
        if(this.project.patterns === undefined){
            this.project.patterns = [];
        }
    }
    
    //Method to return an array of all fixations
    //Format of return array:
    //[{
    //  "duration": (int),
    //  "file": (filePath),
    //  "x": (int),
    //  "y": (int),
    //  "text": (string),
    //  "range":{
    //    "startLine": (int),
    //    "startCol": (int),
    //    "endLine": (int),
    //    "endCol": (int)
    //  }
    //},...]
    getFixations(){
        return this.project.fixations;
    }
    
    //Method to return an array of all patterns
    //Format of return array:
    //[{
    //  "type": (string),
    //  "fixations":[
    //      {
    //          "file": (filePath),
    //          "id": (int)
    //      },...
    //  ]
    //},...]
    
    getPatterns(){
        return this.project.patterns;
    }
    
    setPatterns(patterns){
        this.project.patterns = patterns;
    }
    
    //Method to add a pattern object to the project
    savePattern(pattern){
        let savedPattern = {
            "type": pattern.type,
            "fixations": []
        };
        
        for(const fixation of pattern.fixations){
            let obj = {
                "id": fixation.node.id(),
                "file": fixation.codeWindow.file
            };
            
            savedPattern.fixations.push(obj);
        }
        
        this.project.patterns.push(savedPattern);
    }
    
    changePattern(pattern){
        this.project.patterns[pattern.id].type = pattern.type;
        let fixations = [];
        
        for(const fixation of pattern.fixations){
            let obj = {
                "id": fixation.node.id(),
                "file": fixation.codeWindow.file
            };
            
            fixations.push(obj);
        }
        
        this.project.patterns[pattern.id].fixations = fixations;
    }
    
    saveFixationEdit(fixation){
        let saved = this.getFixations()[parseInt(fixation.data("fixationIndex"))];
        let pos = fixation.position();
        saved.x = pos.x;
        saved.y = pos.y;
    }
    
    //Method to return the object in format to be saved
    getFile(){
        return this.project;
    }
}