const { clipboard, contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ecoSuiteApi', {
  copyText: async (text) => {
    clipboard.writeText(text ?? '');
    return true;
  },
  saveYaml: (payload) => ipcRenderer.invoke('save-yaml', payload),
  exportPack: (payload) => ipcRenderer.invoke('export-pack', payload),
  importPack: () => ipcRenderer.invoke('import-pack'),
  readLibrary: () => ipcRenderer.invoke('library-read'),
  writeLibrary: (entries) => ipcRenderer.invoke('library-write', entries),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
