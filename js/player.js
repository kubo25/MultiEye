let paused = true;
let playIndex = -1;

function loop(i){
    playIndex++;
    
    let json = jsonArray[playIndex];
    
    if(!paused){
        setTimeout(function(){
            document.getElementById("seekbar").value = playIndex + 1;
            console.log(playIndex);
            i--;
            if(i > 0){
                loop(i);
            }
        }, json.duration);
    }
    else{
        console.log("paused");
    }
}

(function(){
    let playButton = document.getElementById("playButton");
    
    playButton.onclick = function(){
        if(playButton.classList.contains("paused")){
            paused = false;
            playButton.classList.remove("paused");
            
            loop(jsonArray.length);
        }
        else{
            paused = true;
            playButton.classList.add("paused");
        }
    };
}
)();