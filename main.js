// Modules to control application life and create native browser window
const {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
} = require('electron')
const path = require('path')
const prompt = require('electron-prompt')
const fs = require('fs')
const Store = require('electron-store')
const store = new Store()

// app.commandLine.hasSwitch('no-sandbox')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const defaultProtocol = 'https'
const defaultHost = 'pitboom.net'
const defaultUrl = `${defaultProtocol}://${defaultHost}/`

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1847,
		height: 1035,
		icon: './images/Pitboom_logo_nowhite.png',
		webPreferences: {
			preload: path.join(__dirname, 'dist/electron-renderer.bundle.js'),
			nodeIntegration: false,
			contextIsolation: false, // Window control events won't work if set true, for example closing window
			backgroundThrottling: false,
		},
		backgroundColor: '#31363b',
		// frame: false,
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
			label: 'Start',
			accelerator: 'F8',
			click: () => {
				mainWindow.webContents.send('start')
			},
		},
		{
			label: 'Toggle Chat',
			accelerator: 'F9',
			click: () => {
				mainWindow.webContents.send('toggle-chat')
			},
		},
		{
			role: 'toggleFullScreen',
			accelerator: 'F11',
			registerAccelerator: false,
		},
		{
			label: 'Dev',
			submenu: [
				{
					label: 'Server URL...',
					click: () => {
						promptServerUrl(mainWindow)
					},
				},
				{
					label: 'Dev tools',
					click: () => {
						mainWindow.webContents.openDevTools()
					},
				},
				{ role: 'forceReload' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ role: 'resetZoom' },
				{ role: 'quit' },
			]
		},
	]
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	// Accelerations won't work when menu is set null
	// this is wanted behavior because events are fired from browser context
	// otherwise actions will be run twice
	mainWindow.setMenu(null)

	ipcMain.on('pitboom', (event, action) => {
		switch (action) {
			case 'show-window':
				mainWindow.show()
				break
			case 'show-window-inactive':
				mainWindow.showInactive()
				break
			case 'close-window':
				mainWindow.close()
				break
			case 'show-menu':
				Menu.getApplicationMenu().popup()
				break
			case 'prompt-server-url':
				promptServerUrl(mainWindow)
				break
			case 'DOMContentLoaded':
				const url = mainWindow.webContents.getURL()
				if (url !== store.get('server.url')) {
					// Updating server url
					store.set('server.url', url)
				}
				break
			case 'get-app-version':
				event.returnValue = app.getVersion()
				break
			case 'get-app-user-data-path':
				event.returnValue = app.getPath('userData')
				break
			default:
				// Some event
				console.warn('pitboom', action)
		}
	})

	ipcMain.on('accelerator', (_, action) => {
		switch (action) {
			case 'F11':
				const toggle = mainWindow.isFullScreen()
				mainWindow.setFullScreen(!toggle)
				break
			case 'F5':
				mainWindow.reload()
				break
		}
	})

	const url = store.get('server.url', defaultUrl)
	mainWindow.loadURL(url)

	let numberOfFails = 0
	mainWindow.webContents.on('did-fail-load', () => {
		if (numberOfFails > 1) {
			promptServerUrl(mainWindow, defaultUrl)
		} else {
			mainWindow.loadURL(defaultUrl)
		}
		numberOfFails++
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

const promptServerUrl = (mainWindow, url) => {
	if(typeof url === 'undefined') {
		url = mainWindow.webContents.getURL()
	}
	prompt({
		title: 'Pitboom server URL',
		value: url,
		inputAttrs: {
			type: 'url'
		},
		height: 120,
		customStylesheet: path.join(__dirname, 'public/prompt.css'),
	}, mainWindow)
		.then((r) => {
			if (r === null) {
				console.log('user cancelled');
			} else {
				mainWindow.loadURL(r)
			}
		})
		.catch(console.error);
}
