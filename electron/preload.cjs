const { clipboard, contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ecoSuiteApi', {
  copyText: async (text) => {
    clipboard.writeText(text ?? '');
    return true;
  },
  saveYaml: (payload) => ipcRenderer.invoke('save-yaml', payload),
  exportPack: (payload) => ipcRenderer.invoke('export-pack', payload),
  importPack: () => ipcRenderer.invoke('import-pack'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
