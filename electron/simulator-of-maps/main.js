const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron')
const appicon = './assets/icon.ico';

function createWindow() {
  // Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    title: 'Simulator of Maps',
    icon: appicon,
    backgroundColor: 'black',
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  updateCoordinates=(x,y)=>mainWindow.webContents.send('newCoords', x, y);

  // and load the index.html of the app.
  mainWindow.loadFile('index.htm')

  let windowCoords;
  let menu = new Menu();
  let menuZoomIn = new MenuItem({
    role: 'zoomIn',
    label: 'Zoom In',
    accelerator: 'CmdOrCtrl+numadd'
  })
  let menuZoomOut = new MenuItem({
    role: 'zoomOut',
    label: 'Zoom Out',
    accelerator: 'CmdOrCtrl+numsub'
  })
  let menuFullscreen = new MenuItem({
    role: 'togglefullscreen',
    label: 'Fullscreen',
    accelerator: 'F11'
  })
  let menuQuit = new MenuItem({
    role: 'quit',
    label: 'Quit'
  })
  let menuItem1 = new MenuItem({
    click: function (menuItem, mainWindow) {
      if (!windowCoords) {
        windowCoords = new BrowserWindow({
          width: 300,
          height: 150,
          title: 'Choose coordinates',
          icon: appicon,
          modal: true,
          maximizable: false,
          resizable: false,
          parent: mainWindow,
          webPreferences: {
            nodeIntegration: true
          }
        })
        windowCoords.setMenu(null);
        windowCoords.loadFile('coords.htm');
        windowCoords.on('closed', function () {
          mainWindow.focus();
          windowCoords = null;
        })
      }
    },
    icon: appicon,
    label: 'Go to...',
    accelerator: 'CmdOrCtrl+G',
    sublabel: 'Choose coordinates'
  });
  menu.append(menuItem1);
  menu.append(menuZoomIn);
  menu.append(menuZoomOut);
  menu.append(menuFullscreen);
  menu.append(menuQuit);
  mainWindow.setMenu(menu);

  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.on('swipe', (e) => console.log(e));
}

let updateCoordinates = ()=>{}

app.on('ready', createWindow)
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('coordinates', (event, x, y) => {
  updateCoordinates(x,y);
});
ipcMain.on('errorInWindow', (event, error, url, line) => {
  if (url.length > 20)
    url = '...' + url.substr(-20);
  console.error(error + ' on ' + url + ' at line ' + line);
});
ipcMain.on('logWindow', (event, message) => {
  console.log(message);
});