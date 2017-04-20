const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;

const path = require('path')
const url = require('url')
require('electron-reload')(__dirname);

let config;
let configPath;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        'minHeight': 800,
        'minWidth': 1000
    });
    mainWindow.maximize();
    
    let template = [{
            label: "File",
            submenu: [
                {
                  label: "Open",
                    accelerator: "CmdOrCtrl+O",
                    click: function(){
                        const dialog = electron.dialog;

                        let options = {
                            title: "Open File",
                            filters: [
                                {name: "JSON", extensions: ["json"]}
                            ]
                        };

                        dialog.showOpenDialog(mainWindow, options, function(filename){
                            if(filename !== undefined){
                                mainWindow.webContents.send("open", filename[0]);
                            }
                        });
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Save",
                    accelerator: "CmdOrCtrl+S",
                    click: function(){
                        mainWindow.webContents.send("save");
                    }
                },
                {
                    label: "Save As...",
                    accelerator: "Shift+CmdOrCtrl+S",
                    click: function(){
                        mainWindow.webContents.send("saveAs");
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Export Patterns As...",
                    accelerator: "CmdOrCtrl+E",
                    click: function(){
                        mainWindow.webContents.send("export");
                    }
                },
                {
                    label: "Import Patterns",
                    accelerator: "CmdOrCtrl+I",
                    click: function(){
                        const dialog = electron.dialog;

                        let options = {
                            title: "Import Patterns",
                            filters: [
                                {name: "JSON", extensions: ["json"]}
                            ]
                        };

                        dialog.showOpenDialog(mainWindow, options, function(filename){
                            if(filename !== undefined){
                                mainWindow.webContents.send("import", filename[0]);
                            }
                        });
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Preferences",
                    click: function(){
                        const path = require('path');
                        
                        const prefPath = path.join('file://', __dirname, '/preferences.html');
                        
                        let win = new BrowserWindow({ 
                            width: 600, 
                            height: 400,
                            'minWidth': 600,
                            'minHeight': 400,
                        });
                        win.on('close', function () { win = null });
                        win.loadURL(prefPath);
                        win.setMenu(null);
                        
                        win.webContents.once("dom-ready", function(){
                            win.webContents.send("config", config);
                        });
                        
                        win.show();
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Exit",
                    role: "quit"
                }
            ]
        },
        {
            label: "Edit",
            submenu:[
                {
                    label: "Undo",
                    accelerator: "CmdOrCtrl+Z",
                    click: function(){
                        mainWindow.webContents.send("undo");
                    }
                },
                {
                    label: "Redo",
                    accelerator: "CmdOrCtrl+Y",
                    click: function(){
                        mainWindow.webContents.send("redo");
                    }
                }
            ]
        },
        {
            label: "View",
            submenu:[
                {
                    label: "Reload",
                    accelerator: "F5",
                    role: "reload"
                },
                {
                    label: "Toggle Developer Tools",
                    accelerator: (function () {
                        if (process.platform === 'darwin') {
                            return 'Alt+Command+I'
                        } 
                        else {
                            return 'Ctrl+Shift+I'
                        }
                    })(),
                    role: "toggledevtools"
                },
                {
                    type: "separator"
                },
                {
                    label: "Toggle Fullscreen",
                    accelerator: (function () {
                        if (process.platform === 'darwin') {
                            return 'Ctrl+Command+F'
                        } 
                        else {
                            return 'F11'
                        }
                    })(),
                    role: "togglefullscreen"
                }
            ]
        }
    ];
    
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu);

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    let fs = require("fs");
    configPath = app.getPath("userData") + "/config.json";
    
    if(fs.existsSync(configPath)){
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    else{
        config = {
            "fixationsDisplayed": 10,
            "showSlidingWindow": true
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), "utf-8");
    }

    mainWindow.webContents.on("dom-ready", function(){
        mainWindow.webContents.send("config", config);
    });
    
    // Emitted when the window is closed.;
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

//Methods that save the project, need to change to save a format other than JSON
ipcMain.on("save", function(event, args){    
    const fs = require("fs");
    
    fs.writeFileSync("a.json", JSON.stringify(args[1], null, 4), "utf-8");
    fs.unlinkSync(args[0]);
    setTimeout(function(){
       fs.renameSync("a.json", args[0]);
    }, 100);
});

ipcMain.on("closingSave", function(event, args){
    const fs = require("fs");
    fs.writeFileSync(args[0], JSON.stringify(args[1], null, 4), "utf-8");
});

ipcMain.on("saveAs", function(event, args){
    const dialog = electron.dialog;
    
    let options = {
        title: "Save As...",
        defaultPath: args[0],
        filters: [
            {name: "JSON", extensions: ["json"]}
        ]
    };
    
    dialog.showSaveDialog(mainWindow, options, function(filename){
        if(filename !== undefined){
            const fs = require("fs");
            
            mainWindow.webContents.send("newPath", filename);
            
            fs.writeFileSync("a.json", JSON.stringify(args[1], null, 4), "utf-8");

            if(fs.existsSync(filename)){
                fs.unlinkSync(filename);

                setTimeout(function(){
                    fs.renameSync("a.json", filename);
                }, 100);
            }
            else{
                fs.renameSync("a.json", filename);
            }
        }
    });
});

ipcMain.on("open", function(event, filePath){
    mainWindow.webContents.reload();
        
    mainWindow.webContents.once("dom-ready", function(){
        setTimeout(function(){
            mainWindow.webContents.send("open", filePath); 
        }, 500);
    });
});

ipcMain.on("export", function(event, args){
    const dialog = electron.dialog;
    
    let options = {
        title: "Export Patterns As...",
        defaultPath: args[0],
        filters: [
            {name: "JSON", extensions: ["json"]}
        ]
    };
    
    dialog.showSaveDialog(mainWindow, options, function(filename){
        if(filename !== undefined){
            const fs = require("fs");
            fs.writeFileSync("a.json", JSON.stringify(args[1], null, 4), "utf-8");

            if(fs.existsSync(filename)){
                fs.unlinkSync(filename);

                setTimeout(function(){
                    fs.renameSync("a.json", filename);
                }, 100);
            }
            else{
                fs.renameSync("a.json", filename);
            }
        }
    });
});

ipcMain.on("config", function(event, configObj){
    config = configObj;
    
    mainWindow.webContents.send("config", config);
    
    const fs = require("fs");
    
    fs.writeFileSync("a.json", JSON.stringify(configObj, null, 4), "utf-8");
    fs.unlinkSync(configPath);
    setTimeout(function(){
       fs.renameSync("a.json", configPath);
    }, 100);
});