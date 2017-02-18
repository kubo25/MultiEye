(function(){
    let playButton = document.getElementById("playButton");
    
    playButton.onclick = function(){
        console.log("click");
        if(playButton.classList.contains("paused")){
            playButton.classList.remove("paused");
        }
        else{
            playButton.classList.add("paused");
        }
    };
})();