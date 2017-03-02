const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;

let template = [{
        label: "File",
        submenu: [
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
                label: "Exit",
                role: "quit"
            }
        ]
    },
    {
        label: "View",
        submenu:[
            {
                label: "Reload",
                accelerator: "CmdOrCtrl+R",
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
    

const path = require('path')
const url = require('url')
require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow();
  mainWindow.maximize();
    
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on("save", function(event, args){    
    const fs = require("fs");
    
    fs.writeFileSync("a.json", JSON.stringify(args[1], null, 4), "utf-8");
    fs.unlinkSync(args[0]);
    setTimeout(function(){
       fs.renameSync("a.json", args[0]);
    }, 100);
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
    });
});