import { ipcRenderer } from "electron";

interface IElectron {
	electron: {
		ipc: Electron.IpcRenderer
		app: {
			version: string
		}
	}
}

const w: any = window
const obj: IElectron = {
	electron: {
		ipc: ipcRenderer,
		app: {
			version: ipcRenderer.sendSync('pitboom', 'get-app-version'),
		},
	}
}
w.electron = obj.electron
