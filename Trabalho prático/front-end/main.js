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
        width: 300,
        height: 375,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
                    // webSecurity: false // desabilita CORS e outras proteções (apenas para teste)

        },
        alwaysOnTop: true, // opcional: para ficar sobre a janela principal
        frame: false,       // ou false se for popup tipo modal
        show: false,
        opacity: 0.95        // vibrancy: 'under-window'    
});

    Menu.setApplicationMenu(null);

    novaConversaWindow.loadFile('app/html/nova-conversa.html');

    novaConversaWindow.once('ready-to-show', () => {
        novaConversaWindow.show();
    });

    // Fecha quando perder o foco (clicou fora)
    novaConversaWindow.on('blur', () => {
        if (!novaConversaWindow.webContents.isDevToolsOpened()) {
            novaConversaWindow.close();
        }
    });
});

ipcMain.on('abrir-novo-grupo', () => {
    const novaConversaWindow = new BrowserWindow({
        width: 320,
        height: 375,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
                    // webSecurity: false // desabilita CORS e outras proteções (apenas para teste)

        },
        alwaysOnTop: true, // opcional: para ficar sobre a janela principal
        frame: false,       // ou false se for popup tipo modal
        show: false,
        opacity: 0.95        // vibrancy: 'under-window'    
});

    Menu.setApplicationMenu(null);

    novaConversaWindow.loadFile('app/html/novo_grupo.html');

    novaConversaWindow.once('ready-to-show', () => {    
        novaConversaWindow.show();
    });

    // Fecha quando perder o foco (clicou fora)
    novaConversaWindow.on('blur', () => {
        if (!novaConversaWindow.webContents.isDevToolsOpened()) {
            novaConversaWindow.close();
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
