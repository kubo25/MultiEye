/*
move nodes,
create pattern,
delete pattern,
edit pattern
*/

class Action{
    constructor(type, edits){
        this.type = type;
        
        switch(type){
            case "move":
                this.movedX = edits.x;
                this.movedY = edits.y;
                this.nodeId = edits.id;
                break;
            
            default:
                this.pattern = edits;
                break;
        }
        
        undoArray.push(this);
    }
    
    undo(){
        switch(this.type){
            case "move":
                for(let i = this.nodeId; i < nodeOrder.length; i++){
                    let node = nodeOrder[i].codeWindow.cy.$("#" + i);
                    let nodePosition = node.position();
                    nodePosition.x -= this.movedX;
                    nodePosition.y -= this.movedY;
                    node.position(nodePosition);

                    project.saveFixationEdit(node);
                }
                break;
            
            case "create":
                this.pattern.delete(true);
                break;
                
            case "delete":
                this.pattern.restore();
                break;
                
            case "edit":
                this.pattern.restoreChanges();
                break;
        }
        
        undoArray.pop();
        redoArray.push(this);
    }
    
    redo(){
        switch(this.type){
            case "move":
                for(let i = this.nodeId; i < nodeOrder.length; i++){
                    let node = nodeOrder[i].codeWindow.cy.$("#" + i);
                    let nodePosition = node.position();
                    nodePosition.x += this.movedX;
                    nodePosition.y += this.movedY;
                    node.position(nodePosition);

                    project.saveFixationEdit(node);
                }
                break;
                
            case "create":
                this.pattern.restore();
                break;
            
            case "delete":
                this.pattern.delete(true);
                break;
                
            case "edit":
                this.pattern.restoreChanges();
                break;
        }
        
        redoArray.pop();
        undoArray.push(this);
    }
}