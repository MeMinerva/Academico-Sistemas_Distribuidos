const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1250,
        height: 720,
        minHeight: 720,
        minWidth: 1250,
        resizable:false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    Menu.setApplicationMenu(null);
    mainWindow.loadFile('app/index.html');
    mainWindow.webContents.openDevTools();

}

ipcMain.on('init-chat', () => {
    const initGrChatWindow = new BrowserWindow({
        width: 300,
        height: 375,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
        },
        alwaysOnTop: true,
        frame: false,
        show: false,
        opacity: 0.95
    });

    Menu.setApplicationMenu(null);
    initGrChatWindow.loadFile('app/html/nova-conversa.html');
    initGrChatWindow.once('ready-to-show', () => {
        initGrChatWindow.show();
    });
    initGrChatWindow.on('blur', () => {
        if (!initGrChatWindow.webContents.isDevToolsOpened()) {
            initGrChatWindow.close();
        }
    });
});

ipcMain.on('init-group-chat', () => {
    const initGrChatWindow = new BrowserWindow({
        width: 320,
        height: 375,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
        },
        alwaysOnTop: true,
        frame: false,
        show: false,
        opacity: 0.95
    });
    Menu.setApplicationMenu(null);
    initGrChatWindow.loadFile('app/html/novo_grupo.html');
    initGrChatWindow.once('ready-to-show', () => {
        initGrChatWindow.show();
    });
    initGrChatWindow.on('blur', () => {
        if (!initGrChatWindow.webContents.isDevToolsOpened()) {
            initGrChatWindow.close();
        }
    });
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

