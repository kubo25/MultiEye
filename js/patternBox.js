(function (){
    let patternBoxButtons = document.querySelectorAll(".sliderTitle");
    
    for(let button of patternBoxButtons){
        button.onclick = function(){            
            this.nextElementSibling.classList.toggle("slided");
            this.lastElementChild.classList.toggle("rotated");
        }
    }
    
    let submitButton = document.getElementById("submitButton");
    let customText = document.getElementById("customText");
    
    submitButton.onclick = function(){        
        new Pattern(customText.value, true);
        
        customText.value = "";
        this.blur();
    }
    
    customText.onkeypress = function(e){
        if(e.keyCode === 13){
            new Pattern(this.value, true);
        
            this.value = "";
            
            e.preventDefault();
        }
    }
})()