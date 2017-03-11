class Project{
    constructor(json){
        this.project = json;
    }
    
    //Method to return an array of all fixations
    //Format of return array:
    //[{
    //  "duration": (int),
    //  "file": (filePath),
    //  "x": (int),
    //  "y": (int)
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
    //          "id": int
    //      },...
    //  ]
    //},...]
    
    getPatterns(){
        return this.project.patterns;
    }
    
    //Method to save a pattern object to the file
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
    
    //Method to return the object in format to be saved
    getFile(){
        return this.project;
    }
}