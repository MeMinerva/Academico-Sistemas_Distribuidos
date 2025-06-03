const { app, BrowserWindow, ipcMain, Menu } = require('electron');

app.on('ready', () => {
    console.log("Olá mundo!");
    let mainWindow = new BrowserWindow({
        width: 1050,
        height: 700,
        minHeight: 700,
        minWidth: 1050,
    });
    Menu.setApplicationMenu(null);
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}) 

app.on('window-all-closed', () => {
    app.quit();
})

ipcMain.on('open-window', () => {
    let sobreWindow = new BrowserWindow({
        width: 300,
        height: 200
    });

    
})