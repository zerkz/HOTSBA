//handle all these damn squirrel events.
if(require('electron-squirrel-startup')) return;

const electron = require('electron');
const {app, BrowserWindow} = electron;
const config = require('convict');

let win;
let devMode = false;


app.on('ready', createMainWindow);

function createMainWindow(width, height) {
  let primaryDisplay = electron.screen.getPrimaryDisplay();
  win = new BrowserWindow({
    width: width,
    height: height,
    show : false,
    minWidth : 510
  });
  win.loadURL(`file://${__dirname}/index.html`);
  if (devMode) {
    win.webContents.openDevTools();
  }
  win.once('ready-to-show', () => {
    win.show()
  });
}

app.on('will-quit', saveConfigs);

function saveConfigs () {
  //save screen stuff to configs before closing.
}
