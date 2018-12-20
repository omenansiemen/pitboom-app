import { ipcRenderer } from "electron";

interface IElectron {
	electron: {
		ipc: Electron.IpcRenderer
		app: {
			version: string
			userDataPath: string
		}
	}
}

const w: any = window
const obj: IElectron = {
	electron: {
		ipc: ipcRenderer,
		app: {
			version: ipcRenderer.sendSync('pitboom', 'get-app-version'),
			userDataPath: ipcRenderer.sendSync('pitboom', 'get-app-user-data-path'),
		},
	}
}
w.electron = obj.electron
