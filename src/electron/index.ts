import { ipcRenderer } from "electron";

interface IElectron {
	electron: {
		ipc: Electron.IpcRenderer
	}
}

const w: any = window
const obj: IElectron = {
	electron: {
		ipc: ipcRenderer
	}
}
w.electron = obj.electron
