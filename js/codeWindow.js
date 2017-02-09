const cytoscape = require("cytoscape");

class CodeWindow{  
    constructor(){
        overflowDetection = true;
        
        let tempEditor;
        
        let codeWrapper = document.getElementById("codeWrapper");
        
        this.cyWrapper = document.createElement("div");
        this.cyWrapper.className = "cyWrapper";
        this.cyWrapper.id = "cyWrapper" + codeWindows.length;
        
        codeWrapper.appendChild(this.cyWrapper);
        
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

        scaleWrapper.appendChild(cyDiv);
        
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
                }}, {
                    selector: 'edge',
                    style: {
                        'line-color': 'grey'
                }},{
                    selector: '.red',
                    style:{
                        'background-color': 'red' 
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
        let transform = "scale(" + scale + ")";
        
        this.cyWrapper.firstChild.style.transform = transform;
        
        let editorWindow = this.cyWrapper.firstChild.firstChild
        let cy = this.cyWrapper.firstChild.lastChild;

        editorWindow.style.height = newHeight + "px";
        editorWindow.style.width = newWidth + "px";

        this.editor.layout();

        cy.style.height = newHeight + "px";
        cy.style.width = newWidth + "px";
        
        this.cyWrapper.style.height = (newHeight * scale) + "px";
        this.cyWrapper.style.width = (newWidth * scale) + "px";
                        
        if(overflowDetection && document.body.clientHeight > window.innerHeight){
            overflowDetection = false;
            
            let codeWrapper = document.getElementById("codeWrapper");
            
            while(document.body.clientHeight > window.innerHeight){
                scale /= 2;
                
                transform = "scale(" + scale + ")";
                        
                for(const cy of codeWrapper.childNodes){
                    cy.firstChild.style.transform = transform;

                    console.log(cy.clientHeight + " " + cy.clientWidth);

                    let tempHeight = (cy.clientHeight / 2);
                    let tempWidth = (cy.clientWidth / 2);

                    cy.style.height = tempHeight + "px";
                    cy.style.width = tempWidth + "px";
                }
            }
            
        }
    }
}