let savedPatterns = [];

class Pattern{
    constructor(type){
        this.id = savedPatterns.length;
        this.type = type;    
        this.nodes = [];
        
        for(const codeWindow of codeWindows){
            let selected = codeWindow.cy.$(".selected");

            for(let i = 0; i < selected.length; i++){
                this.nodes.push(selected[i]);
                
                selected[i].removeClass("selected");
            }
        }
            
        if(this.nodes.length == 0){
            return;
        }
        
        savedPatterns.push(this);
        
        this._updateList();
    }
    
    _updateList(){
        let ul = document.getElementById("savedPatterns");
        let li = document.createElement("li");
        let button = this.type + ": ";
        
        for(const node of this.nodes){
            button += node.id();
            
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
    displayPattern(){
        for(const node of this.nodes){
            node.addClass("selected");
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