'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win

async function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    frame: false, // sem moldura
    titleBarStyle: 'hidden', // opcional no macOS
    webPreferences: {
      nodeIntegration: true, // só se você realmente precisa
      contextIsolation: false, // true é mais seguro, mas precisa adaptar o preload
    }
  })

  Menu.setApplicationMenu(null)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  // Controles de janela via IPC
  ipcMain.on('window-close', () => win.close())
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () =>
    win.isMaximized() ? win.unmaximize() : win.maximize()
  )
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

if (isDevelopment) {
  const exitHandler = () => app.quit()
  process.platform === 'win32'
    ? process.on('message', (data) => data === 'graceful-exit' && exitHandler())
    : process.on('SIGTERM', exitHandler)
}

