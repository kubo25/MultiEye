const cytoscape = require("cytoscape");

let first = true;
let scale = 1;
let originalScale = 1;

let basicSize = 20;
let basicHeight = 560;

class CodeWindow{  
    constructor(file){        
        //Initializing class attributes
        this.selected = false;
        this.file = file;
        this.id = codeWindows.length;
        this.lastNode = -1;
        this.nodeId = 0;
        this.edits = [];
        this.centerX = 0;
        this.centerY = 0;
        
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
                language: 'csharp'
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
                        'font-size': 15,
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
            if(e.cyTarget === e.cy && selectedWindows.length === 1){
                selectedWindows = [];
                codeWindow.unselect();
                document.getElementById("selectionButtons").style.opacity = 0;
            }
        });
        
        this.cy.on("click", "edge", function(e){
            if(selectedWindows.length === 1){
                selectedWindows = [];
                codeWindow.unselect(); 
                document.getElementById("selectionButtons").style.opacity = 0;
            }
        });
        
        this.cy.on("click", "node", function(e){
           e.cyTarget.addClass("selected");
        });
        
        this.cy.on("box", "node", function(e){
            e.cyTarget.addClass("selected");
        });
        
        let scrollVert = 300;
        let scrollHor = 400;
        
        this.cyWrapper.onwheel = function(e){
            scrollVert += e.deltaY / 10;
            
            if(scrollVert < 0){
                return false;
            }
            
            let scroll = 10 * (scrollVert - 300);
            let scrollTop = codeWindow.editor.getScrollTop();
            if(scrollTop + 600 === codeWindow.editor.getScrollHeight()){
                let transform = scroll - scrollTop;
                
                if(transform < 0){
                    transform = 0;
                }
                
                codeWindow.cyWrapper.getElementsByClassName("editor")[0].style.transform = "translateY(" + -transform + "px)";
            }
            
            codeWindow.editor.setScrollTop(scroll);
            codeWindow.cy.pan({x: 0, y: -scroll});
            
            if(codeWindow.editor.getScrollTop() === 0 && scroll <= 0){
                codeWindow.cyWrapper.getElementsByClassName("editor")[0].style.transform = "translateY(" + -scroll + "px)";
            }
        };
        
        if(this.editor !== null){
            this.editor.onDidScrollChange(function(e){
                codeWindow.cy.pan({x: - e.scrollLeft, y: -e.scrollTop});
            });
        }

        let origPosition;
        
        this.cy.on("grab", "node", function(e){
            origPosition = JSON.parse(JSON.stringify(e.cyTarget.position()));
        });
        
        this.cy.on("free", "node", function(e){
            let newPosition = e.cyTarget.position();
            let dPosition = {};
                dPosition.x = newPosition.x - origPosition.x;
                dPosition.y = newPosition.y - origPosition.y;
            
            let nodes = e.cy.nodes();
            
            let id = parseInt(e.cyTarget.id());
            
            project.saveFixationEdit(e.cyTarget);
            
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
    
    addText(data){
        let oldModel = this.editor.getModel();
        let newModel = monaco.editor.createModel(data, "csharp");
        
        this.editor.setModel(newModel);
        if(oldModel){
            oldModel.dispose();
        }
    }
    
    setSize(newHeight, newWidth){
        //Any time this method is used the new height and width becom the original
        this.originalHeight = newHeight;
        this.originalWidth = newWidth;
        
        //Apply scaling
        let transform = "scale(" + scale + ")";
        
        this.cyWrapper.firstChild.style.transform = transform;
        
        let editorWindow = this.cyWrapper.firstChild.firstChild
        let cy = this.cyWrapper.lastChild

        //Set new height and width to editor and recreate it's layout
        editorWindow.style.height = newHeight + "px";
        editorWindow.style.width = newWidth + "px";

        this.editor.layout();

        //Set new width and height to cytoscape
        cy.style.height = (newHeight * scale) + "px";
        cy.style.width = (newWidth * scale) + "px";
        
        this.cyWrapper.style.width = (newWidth * scale) + "px";
             
        //Check for overflow
        if(overflowDetection && document.body.clientHeight > window.innerHeight){
            overflowDetection = false;
            
            //Scale down the codeWindows until no more overflow is found
            while(document.body.clientHeight > window.innerHeight){
                scale /= 2;
                
                transform = "scale(" + scale + ")";
                        
                for(const code of codeWindows){
                    code.cyWrapper.firstChild.style.transform = transform;

                    let tempHeight = code.originalHeight * scale;
                    let tempWidth = code.originalWidth * scale;

                    code.cyWrapper.style.height = (basicHeight * scale) + "px";
                    code.cyWrapper.style.width = tempWidth + "px";
                    
                    code.cyWrapper.lastChild.style.height = tempHeight + "px";
                    code.cyWrapper.lastChild.style.width = tempWidth + "px";  
                    code.cy.resize();
                    
                    //Make move fixations according to the scaling
                    code.cy.nodes().positions(function(i, node){
                        let position = node.position();
                        
                        return{
                            x: position.x * scale,
                            y: position.y * scale
                        };
                    });
                }
            } 
        }
    }
    
    select(first){
        this.selected = true;
        
        this.cyWrapper.classList.remove("pendingSelection");
        
        this.cyWrapper.firstChild.style.transform = "scale(1)";  

        this.cy.zoom(1 / scale);
        this.cy.style().selector("node").style({"font-size": 15 * scale, "height" : basicSize * scale, "width" : basicSize * scale}).update();
        this.cy.style().selector("edge").style({"width" : 3 * scale}).update();

        let cy = this.cy;

        this.cyWrapper.addEventListener("webkitTransitionEnd", function(){
            cy.resize();
        })

        this.cyWrapper.style.zIndex = 13;

        let boundingBox = this.getBoundingClientRect();

        
        let centerX = window.innerWidth / 2;
        let centerY = window.innerHeight / 2;

        let positionX = centerX - (boundingBox.left + 800 / 2);
        let positionY = centerY - (boundingBox.top + 600 / 2);
        
        this.centerX = positionX;
        this.centerY = positionY;
        
        if(!first){
            positionX = 10000;
        }

        this.cyWrapper.style.transform = "translate(" + positionX + "px, " + positionY + "px)";
        
        for(const blur of codeWindows){
            if(blur !== this){
                blur.cyWrapper.classList.add("blurred");
            }
        }
    }
    
    unselect(){
        this.selected = false;
        
        this.cyWrapper.firstChild.style.transform = "scale(" + scale + ")";

        this.cy.resize();

        this.cy.zoom(1);
        this.cy.style().selector("node").style({"font-size": 15, "height" : basicSize, "width" : basicSize}).update();
        this.cy.style().selector("edge").style({"width" : 3}).update();

        this.cyWrapper.style.zIndex = "";

        this.cyWrapper.style.transform = "";
        
        for(const blur of codeWindows){
            if(blur !== this){
                blur.cyWrapper.classList.remove("blurred");
            }
        }
    }
    
    addNode(json, color = null, fixationIndex){ 
        //Create new node
        let node = {
            data: {
                id: playIndex,
                "duration": json.duration,
                "fixationIndex": fixationIndex,
                "originalX": json.x,
                "originalY": json.y
            },
            position: {x: json.x * scale, y: json.y * scale},
        };
        
        this.nodeId++;
        
        if(this.hidden){
            node.style = {
                "opacity": 0
            };
        }
        
        node = this.cy.add(node);
        
        //Change color and shape of last nodes in the same file
        if(color !== null){
            this.cy.style().selector("#" + playIndex).style({
                "background-color" : color,
                "shape": "rectangle",
            }).update();
        }
        
        //Add node information to nodeOrder array
        nodeOrder.push({
            "codeWindow": this,
            "duration": json.duration
        });
        
        //Create edge between nodes
        if(this.cy.nodes().length > 1 && nodeOrder[playIndex - 1].codeWindow === this){
            let edge = {
               data: {
                   id: "edge" + (playIndex - 1),
                   source: (playIndex - 1),
                   target: playIndex
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
            "width": size * scale,
            "height": size * scale
        });
        
        let edit = this.edits[this.lastNode];
        
        if(edit.range !== undefined){
            this.editor.executeEdits("", [
                {range: new monaco.Range(
                    edit.range.startLine,
                    edit.range.startCol,
                    edit.range.endLine,
                    edit.range.endCol),
                 text: edit.text,
                 endCursoState: new monaco.Selection(
                    edit.range.endLine, 
                    edit.range.endCol, 
                    edit.range.endLine, 
                    edit.range.endCol
                 )
                }
            ]);
            
            this.editor.pushUndoStop();
            
            this.editor.revealLineInCenter(edit.range.endLine);
                        
            let codeWindow = this;
            
            setTimeout(function(){
                let lineOffset = codeWindow.editor.getScrollTop();
                codeWindow.cy.pan({x: 0, y: -lineOffset});
                let scrollVert = codeWindow.cyWrapper.getElementsByClassName("scrollVertical")[0];
                
                let scroll = lineOffset / 10 + 300;
                scroll -= scroll % 10;
                scrollVert.dataset.scroll = scroll;
                scrollVert.style.transform = "translateY(" + scroll + "px)";
            }, 1);
        }
        
        if(this.lastNode > 0){ //if there should be an edge show it too
            this.cy.$("#edge" + (node.id() - 1)).style({"opacity": 1});
        }
        
        if(playIndex >= config.fixationsDisplayed){
            let index = playIndex - config.fixationsDisplayed;
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
        let node = this.cy.nodes()[this.lastNode]; //find last node
        node.style({"opacity": 0}); //make it invisible
        
        let edit = this.edits[this.lastNode];
        
        if(edit.range !== undefined){ 
            this.editor.getModel().undo();
            
            let previousEdit = this.edits[this.lastNode - 1];
            
            if(previousEdit !== undefined){            
                this.editor.revealLineInCenter(previousEdit.range.endLine);
                
                let codeWindow = this;
                setTimeout(function(){
                    let lineOffset = codeWindow.editor.getScrollTop();
                    codeWindow.cy.pan({x: 0, y: -lineOffset});
                    
                    let scroll = lineOffset / 10 + 300;
                    scroll -= scroll % 10;
                    scrollVert.dataset.scroll = scroll;
                    scrollVert.style.transform = "translateY(" + scroll + "px)";
                }, 1);
            }
        }
        
        this.lastNode--;
        
        if(this.lastNode >= 0){ //hide it's edge
            this.cy.$("#edge" + (node.id() - 1)).style({"opacity": 0});
        }
        
        if(this.lastNode < 0){
            this.setHidden();
        }
        
        if(playIndex >= config.fixationsDisplayed){
            let index = playIndex - config.fixationsDisplayed;
            let node = nodeOrder[index].codeWindow.cy.$("#" + index);
            let edge = nodeOrder[index].codeWindow.cy.$("#edge" + index);
            node.style({"opacity": 1});
            
            if(config.fixationsDisplayed > 1){
                edge.style({"opacity": 1});
            }     
        }
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
    let codeWrapper = document.getElementById("codeWrapper");
    if(down){
        let finalHeight = codeWrapper.offsetHeight - maxHeight;
        while(finalHeight > 0 && codeWrapper.offsetHeight > finalHeight){
            scale /= 2;

            transform = "scale(" + scale + ")";

            for(const code of codeWindows){
                code.cyWrapper.firstChild.style.transform = transform;

                let tempHeight = 600 * scale;
                let tempWidth = 800 * scale;

                code.cyWrapper.style.height = tempHeight + "px";
                code.cyWrapper.style.width = tempWidth + "px";

                code.cyWrapper.lastChild.style.height = tempHeight + "px";
                code.cyWrapper.lastChild.style.width = tempWidth + "px";  
                code.cy.resize();

                //Move fixations according to the scaling
                code.cy.nodes().positions(function(i, node){
                    let position = node.position();
                    
                    let upscale = (originalScale < 1)? 2 : 1;
                    
                    return{
                        x: position.x * scale * upscale,
                        y: position.y * scale * upscale
                    };
                });
            }
        }
        
        if(original){
            originalScale = scale;
        }
    }
    else{
        scale = originalScale;
        transform = "scale(" + scale + ")";

        for(const code of codeWindows){
            code.cyWrapper.firstChild.style.transform = transform;

            let tempHeight = 600 * scale;
            let tempWidth = 800 * scale;

            code.cyWrapper.style.height = tempHeight + "px";
            code.cyWrapper.style.width = tempWidth + "px";

            code.cyWrapper.lastChild.style.height = tempHeight + "px";
            code.cyWrapper.lastChild.style.width = tempWidth + "px";  
            code.cy.resize();

            //Move fixations according to the scaling
            code.cy.nodes().positions(function(i, node){
                let originalX = node.data("originalX");
                let originalY = node.data("originalY");

                return{
                    x: originalX * originalScale,
                    y: originalY * originalScale
                };
            });
        }
    }
}