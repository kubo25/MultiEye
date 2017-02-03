const cytoscape = require("cytoscape");

class CodeWindow{  
    constructor(){
        var tempEditor;
        
        this.editor = null;
        this.editorId = "editor" + codeWindows.length;
        this.cy = null;
        this.cyId = "cy" + codeWindows.length;
        
        let bottom = document.getElementById("bottom");
        let editorDiv = document.createElement("div");
        
        editorDiv.id = this.editorId;
        editorDiv.className = "editor";
        
        bottom.appendChild(editorDiv);
        
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
                let editor = document.getElementById("editor0");
                let cy = document.getElementById("cy0");
                
                editor.parentNode.removeChild(editor);
                cy.parentNode.removeChild(cy);
                
                codeWindows = [];
                first = false;
            }
        });
        
        if(tempEditor != null){
            this.editor = tempEditor;
        }
                
        let height = document.getElementById(editorDiv.id).clientHeight;
        let width = document.getElementById(editorDiv.id).clientWidth;
        
        let cyWrapper = document.getElementById("cyWrapper");
        let cyDiv = document.createElement("div");
        
        cyDiv.id = this.cyId;
        cyDiv.className = "cytoscape";
        cyDiv.style.height = height + "px";
        cyDiv.style.width = width + "px";
        
        cyWrapper.appendChild(cyDiv);
        
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
    
    setSize(newHeight, newWidth){
        let editorWindow = document.getElementById(this.editorId);
        let cy = document.getElementById(this.cyId);

        editorWindow.style.height = newHeight;
        editorWindow.style.width = newWidth;

        this.editor.layout();

        cy.style.height = newHeight;
        cy.style.width = newWidth;
    }
}