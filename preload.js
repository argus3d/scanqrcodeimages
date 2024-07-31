const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  verifyQRCode: (filePath) => ipcRenderer.invoke('verify-qrcode', filePath)
});
