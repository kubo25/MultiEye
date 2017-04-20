(function (){
    let patternBoxButtons = document.querySelectorAll(".sliderTitle");
    
    for(let button of patternBoxButtons){
        button.onclick = function(){            
            this.nextElementSibling.classList.toggle("slided");
            this.lastElementChild.classList.toggle("rotated");
        }
    }
    
    let buttons = document.querySelectorAll(".patternButton");
    
    for(const button of buttons){
        button.onclick = function(){
            if(editingPattern === null){
                new Pattern(this.innerHTML);
            }
            else{
                editingPattern.changeType(this.innerHTML);
            }
        }
    }
        
    let submitButton = document.getElementById("submitButton");
    let customText = document.getElementById("customText");
    
    submitButton.onclick = function(){
        if(editingPattern === null){
            new Pattern(customText.value);
        }
        else{
            editingPattern.changeType(customText.value);
        }
    
        customText.value = "";
        this.blur()
    }
    
    customText.onkeypress = function(e){
        if(e.keyCode === 13){
            if(editingPattern === null){
                new Pattern(this.value);
            }
            else{
                editingPattern.changeType(customText.value);
            }
        
            this.value = "";
            
            e.preventDefault();
        }
    }
})()