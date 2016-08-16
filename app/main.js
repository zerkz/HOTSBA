//handle all these damn squirrel events.
if(require('electron-squirrel-startup')) return;
const argv = require('minimist')(process.argv.slice(2));
const electron = require('electron');
const {app, BrowserWindow, dialog, autoUpdater} = electron;
const config = require('convict');
const fs = require('fs');
const os = require('os').platform();
const width = 800;
const height = 600;
let updateFeed;

const osxUpdateFeed = 'https://hotsba-nuts.herokuapp.com/update/osx/';
const winUpdateFeed = 'https://hotsba-nuts.herokuapp.com/update/win/';

let win;
let devMode = (process.env.NODE_ENV == 'development') || (argv.NODE_ENV == 'development');

if (!devMode) {
  updateFeed = os === 'darwin' ? osxUpdateFeed : winUpdateFeed;
}

function checkForUpdatesAndStart() {
  if (!updateFeed) {
    createMainWindow();
  } else {
    let updateWindow = new BrowserWindow({width: 300, height: 300, frame: false, show:false})
    updateWindow.loadURL(`file://${__dirname}/updateCheck.html`);
    updateWindow.show();
    dialog.showErrorBox("feedurl for " + os, updateFeed + app.getVersion());
    autoUpdater.setFeedURL(updateFeed + app.getVersion());

    autoUpdater.addListener("checking-for-update", (event) => {
      updateWindow.show();
    });

    autoUpdater.addListener("update-not-available", (event) => {
      updateWindow.destroy();
      createMainWindow();
    });
    autoUpdater.addListener("update-downloaded", (event, releaseNotes, releaseName) => {
      //so metal.
      updateWindow.destroy();
      dialog.showMessageBox({
        type: "question",
        buttons : ["Update", "Do Not Update"],
        defaultId : 0,
        cancelId : 1,
        title : "HOTSBA Update Available!",
        message : "An update to HOTSBA is available (" + releaseName + ")."
      }, function (index) {
        if (index == 0) {
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
      dialog.showErrorBox("HOTSBA Updater Exploded :(", "An error log was generated at " + process.cwd() + '\n' + error);
      fs.writeFileSync(`${__dirname}/index.html`, error);
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
    app.on('window-all-closed', function() {
      app.quit();
    });

    app.on('will-quit', saveConfigs);
  }
}

app.on('ready', checkForUpdatesAndStart);


function saveConfigs () {
  //save screen stuff to configs before closing.
}
