const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any electron APIs you want to expose to the renderer process here
  platform: process.platform,
  isElectron: true
});