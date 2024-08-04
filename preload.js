const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: (searchTerm) => ipcRenderer.invoke('select-folder',searchTerm),
  verifyQRCode: (file) => ipcRenderer.invoke('verify-qrcode', file),
  openFileLocation: (filePath) => ipcRenderer.invoke('open-file-location', filePath),
  searchFiles: (searchTerm) => ipcRenderer.invoke('search-files', searchTerm),
});