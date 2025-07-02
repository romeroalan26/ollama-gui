const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Configuración
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    // Exportar conversación
    exportConversation: (conversation) => ipcRenderer.invoke('export-conversation', conversation),

    // Eventos del menú
    onNewConversation: (callback) => ipcRenderer.on('new-conversation', callback),
    onExportConversation: (callback) => ipcRenderer.on('export-conversation', callback),
    onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
    onOllamaStatus: (callback) => ipcRenderer.on('ollama-status', callback),

    // Limpiar listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Exponer información del sistema
contextBridge.exposeInMainWorld('systemInfo', {
    platform: process.platform,
    version: process.versions.electron,
    isDev: process.env.NODE_ENV === 'development'
}); 