// Modules to control application life and create native browser window
const {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
	dialog,
} = require('electron')
const path = require('path')
const os = require('os')
// const prompt = require('electron-prompt')
const Store = require('electron-store')
const store = new Store()

// app.commandLine.hasSwitch('no-sandbox')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let showExitPrompt = true
let readablePlayTime = 'too little'

const defaultHost = 'pitboom.net'
const productionUrl = `https://${defaultHost}/`

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	const options = {
		width: 1847,
		height: 1035,
		icon: path.join(__dirname, 'public/Pitboom_logo_nowhite.png'),
		webPreferences: {
			preload: path.join(__dirname, 'dist/electron-renderer.bundle.js'),
			nodeIntegration: false,
			contextIsolation: false,
			backgroundThrottling: false,
		},
		backgroundColor: '#31363b',
	}
	if (store.get('window.fullscreen') === true) {
		options.fullscreen = true
	}
	// Create the browser window.
	mainWindow = new BrowserWindow(options)

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

	mainWindow.on('close', (e) => {
		if (showExitPrompt) {
			e.preventDefault() // Prevents the window from closing 
			dialog.showMessageBox({
				type: 'question',
				buttons: ['Yes', 'No'],
				title: 'Confirm',
				message: `You have played ${readablePlayTime}! Really want to quit?`,
				icon: path.join(__dirname, 'public/Pitboom_logo_nowhite.png'),
			}).then(data => {
				if (data.response === 0) {
					showExitPrompt = false
					mainWindow.close()
				}
			}).catch(() => {
				showExitPrompt = false
				mainWindow.close()
			})
		}
	})

	const menuTemplate = [
		{
			label: 'Start',
			// accelerator: 'F8',
			click: () => {
				mainWindow.webContents.send('start')
			},
			// https://github.com/electron/electron/pull/18985
			registerAccelerator: false // F8 key up listener in pb code
		},
		{
			label: 'Toggle Chat',
			// accelerator: 'F9',
			click: () => {
				mainWindow.webContents.send('toggle-chat')
			},
			// https://github.com/electron/electron/pull/18985
			registerAccelerator: false // F9 key up listener in pb code
		},
		{
			role: 'toggleFullScreen',
		},
		{
			label: 'More',
			submenu: [
				{
					role: 'editMenu',
				},
				{
					role: 'toggleDevTools',
				},
				{
					role: 'quit'
				},
			],
		},
	]
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	// Accelerations won't work when menu is set null
	// this is wanted behavior because events are fired from browser context
	// otherwise actions will be run twice
	mainWindow.setMenu(null)

	ipcMain.on('pitboom', (event, action, data) => {
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
			// case 'prompt-server-url':
			// 	promptServerUrl(mainWindow)
			// 	break
			case 'DOMContentLoaded':
				const url = mainWindow.webContents.getURL()
				// Updating server url
				store.set('server.url', url)
				// config.json
				// { "server": { "url": "http://pitboom.net/" } }
				break
			case 'get-app-version':
				event.returnValue = app.getVersion()
				break
			case 'get-app-user-data-path':
				event.returnValue = app.getPath('userData')
				break
			case 'get-cpus':
				event.returnValue = os.cpus()
				break
			case 'version':
				if (data.match(/http[s]?:\/\//) === null) {
					data = `https://${data}/`
				}
				mainWindow.loadURL(data)
				break
			case 'electron':
				if (data === 'devtools') {
					mainWindow.webContents.openDevTools()
				}
				break
			case 'play-time':
				readablePlayTime = data
				break
			case 'full-screen':
				const toggle = mainWindow.isFullScreen()
				mainWindow.setFullScreen(!toggle)
				break
			default:
				// Some event
				console.warn('pitboom', action)
		}
	})

	const url = store.get('server.url', productionUrl)
	mainWindow.loadURL(url)

	let numberOfFails = 0
	mainWindow.webContents.on('did-fail-load', () => {
		if (numberOfFails > 1) {
			// promptServerUrl(mainWindow, productionUrl)
		} else {
			mainWindow.loadURL(productionUrl)
		}
		numberOfFails++
	})
	mainWindow.webContents.on('did-finish-load', (event) => {
		// Tässä voidaan poistaa splash screen sitten kun sellain on tehty
	})
	mainWindow.on('enter-full-screen', () => {
		store.set('window.fullscreen', true)
	})
	mainWindow.on('leave-full-screen', () => {
		store.set('window.fullscreen', false)
	})
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') { }
	// I want to quit the app! It is annoying when stays background until explicitly closed. So APPLE, Fuck you! 🖕
	app.quit()
})
