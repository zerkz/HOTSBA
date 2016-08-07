const electron = require('electron');
const {app, BrowserWindow} = electron;
const config = require('convict');

let win;
let devMode = true;


app.on('ready', createMainWindow);

function createMainWindow(width, height) {
  let primaryDisplay = electron.screen.getPrimaryDisplay();
  console.log(primaryDisplay);
  win = new BrowserWindow({width: width, height: height, show : false})
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
