const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const net = require('net');
const { createServer } = require('./backend/server');
const { getDatabase, closeDatabase, setDatabasePath } = require('./db/database');

let mainWindow;
let httpServer;
let expressPort;

function getFreePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function startExpressServer() {
  const port = await getFreePort();
  const expressApp = createServer();
  httpServer = expressApp.listen(port);
  expressPort = port;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));
}

ipcMain.handle('get-port', () => expressPort);

app.whenReady().then(async () => {
  setDatabasePath(path.join(app.getPath('userData'), 'pocketman.db'));
  getDatabase();
  await startExpressServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (httpServer) httpServer.close();
  closeDatabase();
});
