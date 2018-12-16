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

window.addEventListener('keydown', (ev: KeyboardEvent) => {
	switch (ev.code) {
		case 'F5':
			ipcRenderer.send('pitboom', 'reload')
			break
		case 'F8':
			ipcRenderer.send('pitboom', 'dev-tools')
			break
		case 'F11':
			ipcRenderer.send('pitboom', 'toggle-full-screen')
			break
	}
}, true)
