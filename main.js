// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
} = require('electron')
const path = require('path')

// app.commandLine.appendSwitch('disable-renderer-backgrounding')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1847,
    height: 1035,
    icon: './images/Pitboom_logo_nowhite.png',
    webPreferences: {
      preload: path.join(__dirname, 'dist/electron-renderer.bundle.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#31363b'
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  const menuTemplate = [
    {
      label: 'Full screen',
      accelerator: 'F11',
      click: () => {
        const toggle = mainWindow.isFullScreen()
        mainWindow.setFullScreen(!toggle)
        console.log('toggle')
      }
    },
    {
      label: 'Reload',
      accelerator: 'F5',
      click: () => {
        mainWindow.reload()
      }
    },
    {
      label: 'Dev tools',
      accelerator: 'F8',
      click: () => {
        mainWindow.webContents.openDevTools()
      }
    }
  ]
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  ipcMain.on('pitboom', (event, action) => {
    switch (action) {
      case 'show-window':
        mainWindow.show()
        break
      case 'show-window-inactive':
        mainWindow.showInactive()
        break
      case 'toggle-full-screen':
        const toggle = mainWindow.isFullScreen()
        mainWindow.setFullScreen(!toggle)
        break
      case 'reload':
        mainWindow.reload()
        break
      case 'dev-tools':
        mainWindow.webContents.openDevTools()
        break
    }
  })

  const defaultProtocol = 'https'
  const defaultHost = 'pitboom.net'
  const defaultUrl = `${defaultProtocol}://${defaultHost}`
  const url = process.env.pitboom_server ? process.env.pitboom_server : defaultUrl
  mainWindow.loadURL(url)
  mainWindow.webContents.on('did-fail-load', () => {
    if(url === defaultUrl) {
      mainWindow.loadURL(`http://${defaultHost}`)
    }
  })
  mainWindow.webContents.on('did-finish-load', () => {
    // Tässä voidaan poistaa splash screen sitten kun sellain on tehty
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
