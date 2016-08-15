//handle all these damn squirrel events.
if(require('electron-squirrel-startup')) return;
const argv = require('minimist')(process.argv.slice(2));
const electron = require('electron');
const {app, BrowserWindow, dialog, autoUpdater, os} = electron;
const config = require('convict');
const fs = require('fs');
const width = 800;
const height = 600;
let updateFeed;

const osxUpdateFeed = 'https://hotsba-nuts.herokuapp.com/download/latest/osx';
const winUpdateFeed = 'https://hotsba-nuts.herokuapp.com/download/latest/win';

let win;
let devMode = (process.env.NODE_ENV == 'development') || (argv.NODE_ENV == 'development');

if (!devMode) {
  updateFeed = os === 'darwin' ? undefined : winUpdateFeed;
}

function checkForUpdatesAndStart() {
  if (!updateFeed) {
    createMainWindow();
  } else {
    let updateWindow = new BrowserWindow({width: 300, height: 300, frame: false, show:false})

    autoUpdater.setFeedURL(updateFeed + "?v=" + app.getVersion());

    autoUpdater.addListener("checking-for-update", (event) => {
      updateWindow.show();
    });

    autoUpdater.addListener("update-not-available", (event) => {
      updateWindow.destroy();
      createMainWindow();
    });
    autoUpdater.addListener("update-downloaded", (event) => {
      //so metal.
      updateWindow.destroy();
      dialog.showMessageBox(null, {
        type: "question",
        buttons : ["Update", "Do Not Update"],
        default : 0,
        cancelId : 1,
        title : "HOTSBA Update Available!",
        message : "An update to HOTSBA is available (" + event.releaseName + ")."
      }, function (index) {
        if (index = 0) {
          //accepted update
          autoUpdater.quitAndInstall();
        } else {
          //declined update
          createMainWindow();
        }
      });
    });

    autoUpdater.addListener("error", (error) => {
      updateWindow.destroy();
      fs.writeFileSync('error.log', error);
      dialog.showErrorBox("HOTSBA Updater Exploded :(", "An error log was generated at " + process.cwd());
      createMainWindow();
    });

    autoUpdater.checkForUpdates();
  }

  function createMainWindow() {
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
}


app.on('ready', checkForUpdatesAndStart);



app.on('will-quit', saveConfigs);

function saveConfigs () {
  //save screen stuff to configs before closing.
}
