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
const Store = require('electron-store')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {

	app.quit()

} else {

	const store = new Store()

	let showExitPrompt = true
	let readablePlayTime = 'too little'

	const defaultHost = 'pitboom.net'
	const productionUrl = `https://${defaultHost}/`

	app.on('second-instance', (event, commandLine, workingDirectory, additionalData) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore()
			}
			mainWindow.show()
		}
	})
	
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

		const handlers = new Map([
			['show-window', function (data) {
				if (mainWindow.isMinimized()) {
					mainWindow.restore()
				}
				mainWindow.show()
			}],
			['show-window-inactive', function (data) {
				mainWindow.showInactive()
			}],
			['close-window', function (data) {
				mainWindow.close()
			}],
			['show-menu', function (data) {
				Menu.getApplicationMenu().popup()
			}],
			['DOMContentLoaded', function (data) {
				const url = mainWindow.webContents.getURL()
				// Updating server url
				store.set('server.url', url)
				// config.json
				// { "server": { "url": "http://pitboom.net/" } }
			}],
			['get-app-version', function (data) {
				return app.getVersion()
			}],
			['get-app-user-data-path', function (data = 'userData') {
				return app.getPath(data)
			}],
			['get-cpus', function (data) {
				return os.cpus()
			}],
			['version', function (data) {
				if (data.match(/http[s]?:\/\//) === null) {
					data = `https://${data}/`
				}
				mainWindow.loadURL(data)
			}],
			['electron', function (data) {
				if (data === 'devtools') {
					mainWindow.webContents.openDevTools()
				}
			}],
			['play-time', function (data) {
				readablePlayTime = data
			}],
			['full-screen', function (data) {
				const toggle = mainWindow.isFullScreen()
				mainWindow.setFullScreen(!toggle)
			}],
		])

		ipcMain.on('pitboom', (event, action, data) => {
			const handler = handlers.get(action)
			if (typeof handler === 'function') {
				event.returnValue = handler(data)
			} else {
				console.warn('pitboom', action)
			}
		})

		handlers.forEach((handler, action) => {
			ipcMain.handle(action, (event, data) => {
				return handler(data)
			})
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
}