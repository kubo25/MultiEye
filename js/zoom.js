canvas.onclick = function(event){
    if(!isDragging){
        let x = event.clientX;
        let y = event.clientY;
        
        for(const codeWindow of codeWindows){
            let boundingRect = codeWindow.cyWrapper.getBoundingClientRect();

            let dx = x >= boundingRect.left && x <= (boundingRect.width + boundingRect.left);
            let dy = y >= boundingRect.top && y <= (boundingRect.height + boundingRect.top);

            if(dx && dy){
                console.log(codeWindow);
                break;
            }
        }
    }
}