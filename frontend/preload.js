const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example methods for future use
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  
  // Screenshot functionality
  takeScreenshot: () => ipcRenderer.invoke('screenshot:take'),
  
  // OpenAI Vision API integration
  findSlackIcon: (screenshotData) => ipcRenderer.invoke('ai:findSlackIcon', screenshotData),
  findDhruvDM: (screenshotData) => ipcRenderer.invoke('ai:findDhruvDM', screenshotData),
  
  // Mouse automation
  clickAtCoordinates: (x, y) => ipcRenderer.invoke('mouse:click', x, y),
  clickMouse: (x, y) => ipcRenderer.invoke('mouse:click', x, y)
}) 