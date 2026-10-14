const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApi', {
  isDesktop: true,

  getProducts: () => ipcRenderer.invoke('get-products'),

  saveProducts: (products) => ipcRenderer.invoke('save-products', products),

  exportData: (content, defaultName) =>
    ipcRenderer.invoke('export-file', { content, defaultName }),

  importData: () => ipcRenderer.invoke('import-file'),

  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
});

