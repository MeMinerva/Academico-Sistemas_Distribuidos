const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
            width: 1050,
            height: 700,
            minHeight: 700,
            minWidth: 1050,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        Menu.setApplicationMenu(null);
        mainWindow.loadFile('app/index.html');
    }



ipcMain.on('abrir-nova-conversa', () => {
    const novaConversaWindow = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    novaConversaWindow.loadFile('app/html/nova-conversa.html');
});

ipcMain.on('abrir-novo-grupo', () => {
    const novaConversaWindow = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    novaConversaWindow.loadFile('app/html/novo_grupo.html');
});

app.whenReady().then(() => {
    createMainWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
