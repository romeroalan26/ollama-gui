const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Configuración de almacenamiento
const store = new Store();

let mainWindow;

function createWindow() {
    // Crear la ventana del navegador
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../public/assets/settings.png'),
        titleBarStyle: 'default',
        show: false,
        backgroundColor: '#1a1a1a'
    });

    // Cargar el archivo HTML
    mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

    // Mostrar la ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        // Verificar si Ollama está ejecutándose
        checkOllamaStatus();
    });

    // Manejar cuando se cierra la ventana
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Abrir enlaces externos en el navegador
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Crear menú personalizado
    createMenu();
}

// Verificar estado de Ollama
async function checkOllamaStatus() {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            mainWindow.webContents.send('ollama-status', { status: 'running' });
        } else {
            mainWindow.webContents.send('ollama-status', { status: 'error', message: 'Ollama no responde' });
        }
    } catch (error) {
        mainWindow.webContents.send('ollama-status', {
            status: 'error',
            message: 'No se puede conectar a Ollama. Asegúrate de que esté ejecutándose.'
        });
    }
}

// Crear menú de la aplicación
function createMenu() {
    const template = [
        {
            label: 'Archivo',
            submenu: [
                {
                    label: 'Nueva Conversación',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-conversation');
                    }
                },
                {
                    label: 'Exportar Conversación',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.send('export-conversation');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Salir',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Herramientas',
            submenu: [
                {
                    label: 'Verificar Ollama',
                    click: () => {
                        checkOllamaStatus();
                    }
                },
                {
                    label: 'Abrir Ollama Web',
                    click: () => {
                        shell.openExternal('http://localhost:11434');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Configuración',
                    click: () => {
                        mainWindow.webContents.send('open-settings');
                    }
                }
            ]
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: 'Acerca de Chat IA Local',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Acerca de Chat IA Local',
                            message: 'Chat IA Local v1.0.0',
                            detail: 'Una aplicación de escritorio para chatear con modelos de IA locales usando Ollama.\n\nDesarrollado con Electron y JavaScript.'
                        });
                    }
                },
                {
                    label: 'Documentación de Ollama',
                    click: () => {
                        shell.openExternal('https://ollama.ai/docs');
                    }
                },
                {
                    label: 'Reportar un Problema',
                    click: () => {
                        shell.openExternal('https://github.com/tu-usuario/chat-ia-local/issues');
                    }
                }
            ]
        }
    ];

    // Agregar menú específico de macOS
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Eventos de la aplicación
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Manejar eventos IPC
ipcMain.handle('get-settings', () => {
    return store.get('settings', {
        apiUrl: 'http://localhost:11434',
        model: 'llama3:8b',
        theme: 'default'
    });
});

ipcMain.handle('save-settings', (event, settings) => {
    store.set('settings', settings);
    return true;
});

ipcMain.handle('export-conversation', async (event, conversation) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Exportar Conversación',
        defaultPath: `conversacion-${new Date().toISOString().split('T')[0]}.txt`,
        filters: [
            { name: 'Archivos de texto', extensions: ['txt'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ]
    });

    if (filePath) {
        const fs = require('fs');
        fs.writeFileSync(filePath, conversation);
        return { success: true, filePath };
    }
    return { success: false };
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    dialog.showErrorBox('Error', `Ha ocurrido un error inesperado:\n${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    dialog.showErrorBox('Error', `Ha ocurrido un error inesperado:\n${reason}`);
}); 