const cytoscape = require("cytoscape");

let codeWindows = [];

let first = true;
let scale = 1;
let overflowDetection = true;

class CodeWindow{  
    constructor(hidden, file){
        overflowDetection = true;
        
        this.originalHeight = 0;
        this.originalWidth = 0;
        this.selected = false;
        this.file = file;
        this.id = codeWindows.length;
        this.lastNode = -1;
        
        let tempEditor;
        
        let codeWrapper = document.getElementById("codeWrapper");
        
        this.cyWrapper = document.createElement("div");
        this.cyWrapper.className = "cyWrapper";
        this.cyWrapper.id = "cyWrapper" + codeWindows.length;
        
        codeWrapper.appendChild(this.cyWrapper);
        
        if(hidden){
            this.setHidden();
        }
        
        let scaleWrapper = document.createElement("div");
        scaleWrapper.className = "scaleWrapper";
        
        this.cyWrapper.appendChild(scaleWrapper);
        
        this.editor = null;
        this.editorId = "editor" + codeWindows.length;
        
        this.cy = null;
        this.cyId = "cy" + codeWindows.length;
        
        let editorDiv = document.createElement("div");
        
        editorDiv.id = this.editorId;
        editorDiv.className = "editor";
        
        scaleWrapper.appendChild(editorDiv);
        
        amdRequire.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' }});

        self.module = undefined;
        self.process.browser = true;
                
        amdRequire(['vs/editor/editor.main'], function() {
            tempEditor = monaco.editor.create(document.getElementById(editorDiv.id), {
                readOnly: true,
                scrollBeyondLastLine: false,
                language: 'csharp'
            });
            
            if(first){               
                codeWrapper.removeChild(document.getElementById("cyWrapper0"));
                
                codeWindows = [];
                first = false;
            }
        });
        
        if(tempEditor != null){
            this.editor = tempEditor;
        }

        let cyDiv = document.createElement("div");
        
        cyDiv.id = this.cyId;
        cyDiv.className = "cytoscape";

        this.cyWrapper.appendChild(cyDiv);
        
        this.cy = cytoscape({
			container: document.getElementById(cyDiv.id),
            autoungrabify: true,
            userPanningEnabled: false,
            boxSelectionEnabled: false,
            style: [{
                    selector: 'node',
                    style: {
                        shape: 'circle',
                        'background-color': 'black',
                        'background-opacity': '0.7',
                        'content': 'data(id)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': 'white',
                        'font-size': '15',
                        width: 20,
                        height: 20
                    }
                }, {
                    selector: 'edge',
                    style: {
                        'line-color': 'grey',
                        width: 3
                    }
                }, {
                    selector: '.selected',
                    style: {
                        'border-width': '4px',
                        'border-color': '#c70219',
                        'border-style': 'solid'
                    }
                }],
		});
    }
    
    addText(data){
        let lines = this.cyWrapper.querySelector(".view-lines");
        
        let obj = this;
    
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                let newHeight = mutation.target.scrollHeight;
                let newWidth = mutation.target.scrollWidth + 20;
                                
                obj.setSize(newHeight, newWidth);
            });    
        });

        let config = { attributes: true, childList: false, characterData: false };
        observer.observe(lines, config);

        this.editor.setValue(data);

        setTimeout(function(){
            observer.disconnect();
        }, 1000);
    }
    
    setSize(newHeight, newWidth){
        this.originalHeight = newHeight;
        this.originalWidth = newWidth;
        
        let transform = "scale(" + scale + ")";
        
        this.cyWrapper.firstChild.style.transform = transform;
        
        let editorWindow = this.cyWrapper.firstChild.firstChild
        let cy = this.cyWrapper.lastChild

        editorWindow.style.height = newHeight + "px";
        editorWindow.style.width = newWidth + "px";

        this.editor.layout();

        cy.style.height = (newHeight * scale) + "px";
        cy.style.width = (newWidth * scale) + "px";
        
        this.cyWrapper.style.height = (newHeight * scale) + "px";
        this.cyWrapper.style.width = (newWidth * scale) + "px";
                
        if(overflowDetection && document.body.clientHeight > window.innerHeight){
            overflowDetection = false;
                        
            while(document.body.clientHeight > window.innerHeight){
                scale /= 2;
                
                transform = "scale(" + scale + ")";
                        
                for(const code of codeWindows){
                    code.cyWrapper.firstChild.style.transform = transform;

                    let tempHeight = code.originalHeight * scale;
                    let tempWidth = code.originalWidth * scale;

                    code.cyWrapper.style.height = tempHeight + "px";
                    code.cyWrapper.style.width = tempWidth + "px";
                    
                    code.cyWrapper.lastChild.style.height = tempHeight + "px";
                    code.cyWrapper.lastChild.style.width = tempWidth + "px";  
                    code.cy.resize();
                    
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
    
    select(){
        this.selected = !this.selected;
        
        if(this.selected){
            this.cyWrapper.firstChild.style.transform = "scale(1)";
        
            this.cyWrapper.lastChild.style.height = this.originalHeight + "px";
            this.cyWrapper.lastChild.style.width = this.originalWidth + "px";  
            this.cy.resize();
            
            this.cy.zoom(1 / scale);
            this.cy.style().selector("node").style({"font-size": 15 * scale, "height" : 20 * scale, "width" : 20 * scale}).update();
            this.cy.style().selector("edge").style({"width" : 3 * scale}).update();
            
            this.cyWrapper.style.zIndex = 5;
            
            let boundingBox = this.getBoundingClientRect();

            let centerX = window.innerWidth / 2;
            let centerY = window.innerHeight / 2;

            let positionX = centerX - (boundingBox.left + this.originalWidth / 2);
            let positionY = centerY - (boundingBox.top + this.originalHeight / 2);
        
            this.cyWrapper.style.transform = "translate(" + positionX + "px, " + positionY + "px)";
        }
        else{
            this.cyWrapper.firstChild.style.transform = "scale(" + scale + ")";
            
            this.cyWrapper.lastChild.style.height = this.cyWrapper.style.height;
            this.cyWrapper.lastChild.style.width = this.cyWrapper.style.width;  
            this.cy.resize();
            
            this.cy.zoom(1);
            this.cy.style().selector("node").style({"font-size": 15, "height" : 20, "width" : 20}).update();
            this.cy.style().selector("edge").style({"width" : 3}).update();
            
            this.cyWrapper.style.zIndex = "";
            
            this.cyWrapper.style.transform = "";
        }           
    }
    
    addNode(json, color = null){      
        let node = {
            data: {id: playIndex},
            position: {x: json.x * scale, y: json.y * scale}
        };
        
        if(this.hidden){
            node.style = {
                "opacity": 0
            };
        }
        
        node = this.cy.add(node);
        
        if(color !== null){
            this.cy.style().selector("#" + playIndex).style({
                "background-color" : color,
                "shape": "rectangle",
                "width": 25 * scale,
                "height": 25 * scale
            }).update();
        }
        
        nodeOrder.push({
            "codeWindow": this,
            "duration": json.duration
        });
        
        if(this.cy.nodes().length > 1){
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
    }
    
    showNextNode(){
        this.lastNode++;
        
        let node = this.cy.nodes()[this.lastNode];
        node.style({"opacity": 1});
        
        if(this.lastNode > 0){
            this.cy.$("#edge" + (node.id() - 1)).style({"opacity": 1});
        }
    }
    
    hideLastNode(){
        this.lastNode--;
        
        let node = this.cy.nodes()[this.lastNode + 1];
        node.style({"opacity": 0});
        
        if(this.lastNode >= 0){
            this.cy.$("#edge" + (node.id() - 1)).style({"opacity": 0});
        }
    }
    
    setActive(activate){
        if(activate){
            this.cyWrapper.firstChild.firstChild.classList.add("active");
        }
        else{
            this.cyWrapper.firstChild.firstChild.classList.remove("active");
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
        return this.cyWrapper.lastChild.getBoundingClientRect();
    }
}