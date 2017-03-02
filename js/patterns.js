let savedPatterns = [];

class Pattern{
    constructor(arg){
        this.id = savedPatterns.length;
        this.nodes = [];
        
        if(typeof arg === "string"){
            this.type = arg;
            for(const codeWindow of codeWindows){
                let selected = codeWindow.cy.$(".selected");

                for(let i = 0; i < selected.length; i++){
                    this.nodes.push({
                        "node": selected[i], 
                        "codeWindow": codeWindow
                    });

                    selected[i].removeClass("selected");
                }
            }

            if(this.nodes.length == 0){
                return;
            }
            
            this._addToJsonArray();
        }
        else{
            this.type = arg.type;
                    
            for(const node of arg.nodes){
                let codeWindow = codeWindows.objectWithFile(node.file);
                
                this.nodes.push({
                    "node": codeWindow.getNodeWithId(node.id),
                    "codeWindow": codeWindow
                });
            }
        }
        
        savedPatterns.push(this);
        
        this._updateList();
    }
    
    _updateList(){
        let ul = document.getElementById("savedPatterns");
        let li = document.createElement("li");
        let button = this.type + ": ";
        
        for(const node of this.nodes){
            button += node.node.id();
            
            if(node !== this.nodes[this.nodes.length - 1]){
                button += ", ";
            }
        }

        li.innerHTML = button;
        li.dataset.patternID = this.id;
        li.onclick = function(){
            savedPatterns[this.dataset.patternID].displayPattern();
        };

        ul.appendChild(li);
    }
    
    _addToJsonArray(){
        let pattern = {
            "type": this.type,
            "nodes": []
        };
        
        for(const node of this.nodes){
            let obj = {
                "id": node.node.id(),
                "file": node.codeWindow.file
            };
            
            pattern.nodes.push(obj);
        }
        
        jsonArray.patterns.push(pattern);
    }
    
    displayPattern(){
        for(const node of this.nodes){
            node.node.addClass("selected");
        }
    }
}

(function(){
    let buttons = document.querySelectorAll(".patternButton");
    
    for(const button of buttons){
        button.onclick = function(){
            new Pattern(this.innerHTML);
        }
    }
})();