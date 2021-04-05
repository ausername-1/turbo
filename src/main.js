const {
  app,
  ipcMain,
  BrowserWindow
} = require('electron');
const url = require('url');
const path = require('path');
const Store = require('electron-store');

const { settings } = require('./server/data/settings');
const { Tablist } = require('./server/models/tablist');
const { ipcEventHandler } = require('./server/handlers/ipc');
const { windowEventHandler } = require('./server/handlers/window');
const { keyboardEventHandler } = require('./server/handlers/keyboard');

let win;
const store = new Store();

const createWindow = () => {

  win = new BrowserWindow({
    show: false,
    frame: false,
    hasShadow: false,
    minWidth: settings.size.window.min.width,
    minHeight: settings.size.window.min.height,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const reactURL = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  win.loadURL(reactURL)
  win.maximize()
  win.show();
  win.webContents.openDevTools();

  const winSize = win.getSize();
  const modalWidth =  (winSize[0] * settings.size.modal.default.width) > settings.size.modal.min.width
    ? winSize[0] * settings.size.modal.default.width
    : settings.size.modal.min.width
  const modalHeight =  (winSize[1] * settings.size.modal.default.height) > settings.size.modal.min.height
    ? winSize[1] * settings.size.modal.default.height
    : settings.size.modal.min.height
  console.log(winSize)
  console.log(modalWidth, modalHeight)
  const modal = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    frame: false,
    hasShadow: false,
    minWidth: modalWidth,
    minHeight: modalHeight,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  modal.loadURL(process.env.ELECTRON_START_URL + settings.path.settings);
  modal.show();
  modal.webContents.openDevTools();

  console.log(modal.getSize())

  const tablist = new Tablist(win);

  ipcEventHandler(win, { ipcMain: ipcMain, tablist: tablist, store: store });
  windowEventHandler(win);
  keyboardEventHandler(win, { tablist: tablist });

  win.on('closed', () => {
    win = null;
  });

}

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  } else {
    return;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
