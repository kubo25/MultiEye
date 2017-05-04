const cytoscape = require("cytoscape");

let first = true;
let scale = 1;
let tempScale = 0.9;
let originalScale = 1;

let basicSize = 20;
let basicFontSize = 18;

let editorWidth = 1712;
let editorHeight = 917;

class CodeWindow{  
    constructor(file){        
        //Initializing class attributes
        this.selected = false;
        
        if(file !== undefined){
            this.file = file.path;
            this.editor = file.editor;
        }
        
        this.id = codeWindows.length;
        this.lastNode = -1;
        this.centerX = 0;
        this.centerY = 0;
        
        this.scrollHistory = [];
        this.cursorHistory = [];
        this.selectionHistory = [];
        
        let tempEditor;
        
        let codeWrapper = document.getElementById("codeWrapper");
        
        //Create main wrapper div
        this.cyWrapper = document.createElement("div");
        this.cyWrapper.className = "cyWrapper";
        this.cyWrapper.id = "cyWrapper" + codeWindows.length;
        
        codeWrapper.appendChild(this.cyWrapper);
        
        //When creating instances start them hidden
        this.setHidden();
        
        //Create scaling wrapper for the editor
        let scaleWrapper = document.createElement("div");
        scaleWrapper.className = "scaleWrapper";
        
        this.cyWrapper.appendChild(scaleWrapper);
        
        //Initialize editor and cytoscape ids
        this.editor = null;
        this.editorId = "editor" + codeWindows.length;
        
        this.cy = null;
        this.cyId = "cy" + codeWindows.length;
        
        //Create wrapper for the editor
        let editorDiv = document.createElement("div");
        
        editorDiv.id = this.editorId;
        editorDiv.className = "editor";
        
        scaleWrapper.appendChild(editorDiv);
        
        //Create monaco instance
        amdRequire.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' }});

        self.module = undefined;
        self.process.browser = true;
                
        amdRequire(['vs/editor/editor.main'], function() {
            tempEditor = monaco.editor.create(document.getElementById(editorDiv.id), {
                scrollBeyondLastLine: false,
                lineHeight: 21,
            });
            
            //First loading takes some time, so create first instance on application init
            //and delete it right after that
            if(first){               
                codeWrapper.removeChild(document.getElementById("cyWrapper0"));
                
                codeWindows = [];
                first = false;
            }
        });
        
        //Add monaco instance to the object
        if(tempEditor != null){
            this.editor = tempEditor;
        }

        let cyDiv = document.createElement("div");
        
        cyDiv.id = this.cyId;
        cyDiv.className = "cytoscape";

        this.cyWrapper.appendChild(cyDiv);
        
        //Create cytoscape instance and add it to this CodeWindow
        this.cy = cytoscape({
			container: document.getElementById(cyDiv.id),
            userPanningEnabled: false,
            style: [{
                    selector: 'node',
                    style: {
                        shape: 'circle',
                        'background-color': 'black',
                        'background-opacity': 0.7,
                        'content': 'data(id)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': 'white',
                        'font-size': basicFontSize,
                        width: basicSize,
                        height: basicSize
                    }
                }, 
                {
                    selector: 'edge',
                    style: {
                        'line-color': 'grey',
                        width: 3
                    }
                }, 
                {
                    selector: '.selected',
                    style: {
                        'border-width': '4px',
                        'border-color': '#c70219',
                        'border-style': 'solid'
                    }
                }]
		});
        
        let codeWindow = this;
        
        this.cy.on("click", function(e){
            if(e.target === e.cy && selectedWindows.length === 1 || e.target.group() === "edges"){
                windowsOpen = false;
                selectedWindows = [];
                codeWindow.unselect();
                document.getElementById("selectionButtons").style.opacity = 0;
                
                for(const blur of codeWindows){
                    blur.cyWrapper.classList.remove("blurred");
                }
            }
            else if(e.target.group() === "nodes"){
                if(e.target.hasClass("selected")){
                    e.target.removeClass("selected");
                }
                else{
                    e.target.addClass("selected");
                }
            }
        });
        
        this.cy.on("box", "node", function(e){
            if(parseInt(e.target.id()) <= nodeIndex){
                if(e.target.hasClass("selected")){
                e.target.removeClass("selected");
                }
                else{
                    e.target.addClass("selected");
                }   
            }
        });
        
        let scrollVert = 300;
        let scrollHor = 400;
        let wheel = false;
        let transformed = false;
        
        this.cyWrapper.onwheel = function(e){  
            wheel = true;
            scrollVert += e.deltaY / 10;
            
            if(scrollVert < 0){
                return false;
            }
            
            let scroll = (Math.ceil(10 * (scrollVert - 300) / 100)) * 100;
            let scrollTop = codeWindow.editor.getScrollTop();
            if(scrollTop + editorHeight === codeWindow.editor.getScrollHeight()){
                let transform = scroll - scrollTop;
                
                if(transform < 0){
                    transform = 0;
                }
                
                codeWindow.cyWrapper.getElementsByClassName("editor")[0].style.transform = "translateY(" + -transform + "px)";
            }
            
            codeWindow.editor.setScrollTop(scroll);
            codeWindow.cy.pan({x: 0, y: -scroll});
            
            if(codeWindow.editor.getScrollTop() === 0 && scroll <= -100){
                transformed = true;
                codeWindow.cyWrapper.getElementsByClassName("editor")[0].style.transform = "translateY(" + -scroll + "px)";
            }
            else if(transformed && scroll >= 0){
                transformed = false;
                codeWindow.cyWrapper.getElementsByClassName("editor")[0].style.transform = "";
            }
            
            wheel = false;
        };
        
        if(this.editor !== null){
            this.editor.onDidScrollChange(function(e){
                codeWindow.cy.pan({x: - e.scrollLeft, y: -e.scrollTop});
                if(!wheel){
                    scrollVert = e.scrollTop / 10 + 300;
                }
            });
        }

        let origPosition;
        
        this.cy.on("grabon", "node", function(e){
            origPosition = JSON.parse(JSON.stringify(e.target.position()));
        });
        
        this.cy.on("free", "node", function(e){
            project.changesPending = true;
            let newPosition = e.target.position();
            let dPosition = {};
            
            dPosition.x = newPosition.x - origPosition.x;
            dPosition.y = newPosition.y - origPosition.y;

            if(Math.abs(dPosition.x) <= 1 && Math.abs(dPosition.y) <= 1){
                return;
            }
            
            let nodes = e.cy.nodes();
            
            let id = parseInt(e.target.id());
            
            dPosition.id = id;
            
            new Action("move", dPosition);
            redoArray = [];
            
            project.saveFixationEdit(e.target);
            
            for(let i = id + 1; i < nodeOrder.length; i++){
                let node = nodeOrder[i].codeWindow.cy.$("#" + i);
                let nodePosition = node.position();
                nodePosition.x += dPosition.x;
                nodePosition.y += dPosition.y;
                node.position(nodePosition);
                
                project.saveFixationEdit(node);
            }
        });
    }
    
    addText(data, extension){
        let oldModel = this.editor.getModel();
        
        let language = fileExtensions.getLanguage(extension);
        
        language = (language !== -1)? language : "plaintext";
        
        let newModel = monaco.editor.createModel(data, language);
        
        this.editor.setModel(newModel);
        if(oldModel){
            oldModel.dispose();
        }
    }
    
    select(first){
        this.selected = true;
        
        this.cyWrapper.classList.remove("pendingSelection");
        
        if(!document.getElementById("patternGraph").classList.contains("hidden")){
            tempScale = 0.7;
        }
        else{
            tempScale = 0.9;
        }

        this.cyWrapper.firstChild.style.transform = "scale(" + tempScale + ")";  

        this.cyWrapper.lastChild.style.width = ((editorWidth - 14) * tempScale) + "px";
        this.cyWrapper.lastChild.style.height = ((editorHeight - 10) * tempScale) + "px";
        
        this.cy.zoom(tempScale);

        let data = this.scrollHistory[this.scrollHistory.length - 1];
        
        this.cy.pan({x: -data.scrollLeft * tempScale, y: -data.scrollTop * tempScale});
        
        let cy = this.cy;

        this.cyWrapper.addEventListener("webkitTransitionEnd", function(){
            cy.resize();
        });

        this.cyWrapper.style.zIndex = 13;

        let boundingBox = this.getBoundingClientRect();
        
        let codeWrapper = document.getElementById("codeWrapper");
        
        let centerX = codeWrapper.offsetWidth / 2;
        let centerY = codeWrapper.offsetHeight / 2;

        let positionX = centerX - (boundingBox.left + editorWidth * tempScale / 2);
        let positionY = centerY - (boundingBox.top + editorHeight * tempScale / 2);
        
        this.centerX = positionX;
        this.centerY = positionY;
        
        if(!first){
            positionX = 10000;
        }

        this.cyWrapper.style.transform = "translate(" + positionX + "px, " + positionY + "px)";
    }
    
    unselect(){
        tempScale = scale;
        this.selected = false;
        
        this.cyWrapper.firstChild.style.transform = "scale(" + scale + ")";
        
        this.cyWrapper.lastChild.style.width = (editorWidth * scale) + "px";
        this.cyWrapper.lastChild.style.height = (editorHeight * scale) + "px";
        
        this.cy.zoom(scale);
        
        let data = this.scrollHistory[this.scrollHistory.length - 1];
        this.cy.pan({x: -data.scrollLeft * scale, y: -data.scrollTop * scale});

        this.cyWrapper.style.zIndex = "";

        this.cyWrapper.style.transform = "";
    }
    
    addNode(json, color = null){ 
        //Create new node
        let node = {
            data: {
                id: nodeIndex,
                "duration": json.data.duration,
                "fixationIndex": nodeIndex,
                "originalX": json.data.x,
                "originalY": json.data.y
            },
            position: {x: json.data.x * scale, y: json.data.y * scale},
        };
                
        if(this.hidden){
            node.style = {
                "opacity": 0
            };
        }
        
        node = this.cy.add(node);
        
        //Change color and shape of last nodes in the same file
        if(color !== null){
            this.cy.style().selector("#" + nodeIndex).style({
                "background-color" : color,
                "shape": "rectangle",
            }).update();
        }
        
        //Add node information to nodeOrder array
        nodeOrder.push({
            "codeWindow": this,
            "duration": json.duration,
        });
        
        //Create edge between nodes
        if(this.cy.nodes().length > 1 && nodeOrder[nodeIndex - 1].codeWindow === this){
            let edge = {
               data: {
                   id: "edge" + (nodeIndex - 1),
                   source: (nodeIndex - 1),
                   target: nodeIndex
               } 
            };
            
            if(this.hidden){
                edge.style = {
                    "opacity": 0
                };
            }
            
            this.cy.add(edge);
        }
        
        return node;
    }
    
    showNextNode(){
        this.lastNode++;
        
        let node = this.cy.nodes()[this.lastNode]; //find next node
        let size = basicSize * (1 + node.data("duration") / 500); //calculate it's size according to duration
        
        node.style({ //show the node and set it's new size
            "opacity": 1,
            "width": size,
            "height": size
        });
        
        if(nodeIndex < nodeOrder.length){
            nodeOrder[nodeIndex].playIndex = playIndex;

        }
        
        if(this.lastNode > 0){ //if there should be an edge show it too
            this.cy.$("#edge" + (node.id() - 1)).style({"opacity": 1});
        }
        
        if(nodeIndex >= config.fixationsDisplayed){
            let index = nodeIndex - config.fixationsDisplayed;
            let node = nodeOrder[index].codeWindow.cy.$("#" + index);
            
            if(node.hasClass("selected")){
                return;
            }
            
            let edge = nodeOrder[index].codeWindow.cy.$("#edge" + index);
            node.style({"opacity": 0});
            edge.style({"opacity": 0});
        }
    }
    
    hideLastNode(){ 
        if(this.lastNode === this.cy.nodes().length){
            this.lastNode--;
        }
        
        let node = this.cy.nodes()[this.lastNode]; //find last node
        node.style({"opacity": 0}); //make it invisible
        
        this.lastNode--;
        
        if(this.lastNode >= 0){ //hide its edge
            this.cy.$("#edge" + (node.id() - 1)).style({"opacity": 0});
        }
        
        if(nodeIndex >= config.fixationsDisplayed){
            let index = nodeIndex - config.fixationsDisplayed;
            let node = nodeOrder[index].codeWindow.cy.$("#" + index);
            let edge = nodeOrder[index].codeWindow.cy.$("#edge" + index);
            node.style({"opacity": 1});
            
            if(config.fixationsDisplayed > 1){
                edge.style({"opacity": 1});
            }     
        }
    }
    
    scroll(data){
        this.scrollHistory.push(data);
        
        this.editor.setScrollTop(data.scrollTop);
        this.editor.setScrollLeft(data.scrollLeft);
        this.cy.pan({x: -data.scrollLeft * tempScale, y: -data.scrollTop * tempScale});
    }
    
    unscroll(){
        let data = {};
        
        if(this.scrollHistory.length - 2 < 0){
            data.scrollTop = 0;
            data.scrollLeft = 0;
        }
        else{
            data = this.scrollHistory[this.scrollHistory.length - 2];
        }
        
        this.scroll(data);
        
        this.scrollHistory.pop();
        this.scrollHistory.pop();
    }
    
    moveCursor(data){
        this.cursorHistory.push(data);
        
        this.editor.setPosition({column: data.position.column, lineNumber: data.position.row});
    }
    
    unmoveCursor(){
        let data = {position: {}};
        
        if(this.scrollHistory.length - 2 < 0){
            data.position.column = 1;
            data.position.row = 1;
        }
        else{
            data = this.cursorHistory[this.cursorHistory.length - 2];
        }
        
        this.moveCursor(data);
        
        this.cursorHistory.pop();
        this.cursorHistory.pop();
    }
    
    selectText(data){
        this.selectionHistory.push(data);
        
        this.editor.setSelection({
            startColumn: data.selectionStart.column,
            startLineNumber: data.selectionStart.row,
            endColumn: data.selectionEnd.column,
            endLineNumber: data.selectionEnd.row
        });
    }
    
    unselectText(){
        let data = {selectionStart: {}, selectionEnd: {}};
        
        if(this.selectionHistory.length - 2 < 0){
            data.selectionStart.column = 1;
            data.selectionStart.row = 1;
            data.selectionEnd.column = 1;
            data.selectionEnd.row = 1;
        }
        else{
            data = this.selectionHistory[this.selectionHistory.length - 2];
        }
        
        this.selectText(data);
        
        this.selectionHistory.pop();
        this.selectionHistory.pop();
    }
    
    editText(data){
        this.editor.executeEdits("", [
            {
                range: new monaco.Range(
                    data.change.editStart.row,
                    data.change.editStart.column,
                    data.change.editEnd.row,
                    data.change.editEnd.column),
                text: data.change.text
            }
        ]);
            
        this.editor.pushUndoStop();
    }
    
    uneditText(){
        this.editor.getModel().undo();
    }
    
    setActive(activate){
        //Set monaco editor div as active to change it's shadow color
        if(activate){
            this.cyWrapper.classList.add("active");
        }
        else{
            this.cyWrapper.classList.remove("active");
        }
    }
    
    setHidden(){
        this.hidden = true;
        this.cyWrapper.style.visibility = "hidden";
    }
    
    setVisible(){
        this.hidden = false;
        this.cyWrapper.style.visibility = "visible";
    }
    
    getBoundingClientRect(){
        return this.cyWrapper.getBoundingClientRect();
    }
    
    getNodeWithId(id){
        return this.cy.$("#" + id);
    }
}

function changeScale(down, maxHeight, original = false){
    if(nodeOrder.length <= 0){
        return;
    }
    
    let codeWrapper = document.getElementById("codeWrapper");
    if(down){
        while(codeWrapper.offsetHeight > maxHeight){
            scale /= 1.2;

            transform = "scale(" + scale + ")";

            for(const codeWindow of codeWindows){
                codeWindow.cyWrapper.firstChild.style.transform = transform;

                let tempHeight = editorHeight * scale;
                let tempWidth = editorWidth * scale;

                codeWindow.cyWrapper.style.height = tempHeight + "px";
                codeWindow.cyWrapper.style.width = tempWidth + "px";

                codeWindow.cyWrapper.lastChild.style.height = tempHeight + "px";
                codeWindow.cyWrapper.lastChild.style.width = tempWidth + "px";  
                codeWindow.cy.resize();

                //Zoom according to the scaling
                codeWindow.cy.zoom(scale);
            }
        }
        
        if(original){
            originalScale = scale;
        }
    }
    else{
        while(codeWrapper.offsetHeight < maxHeight){
            scale *= 1.2;

            transform = "scale(" + scale + ")";

            for(const codeWindow of codeWindows){
                codeWindow.cyWrapper.firstChild.style.transform = transform;

                let tempHeight = editorHeight * scale;
                let tempWidth = editorWidth * scale;

                codeWindow.cyWrapper.style.height = tempHeight + "px";
                codeWindow.cyWrapper.style.width = tempWidth + "px";

                codeWindow.cyWrapper.lastChild.style.height = tempHeight + "px";
                codeWindow.cyWrapper.lastChild.style.width = tempWidth + "px";  
                codeWindow.cy.resize();

                //Zoom according to the scaling
                codeWindow.cy.zoom(scale);
            }
        }
        
        changeScale(true, maxHeight);
    }
}