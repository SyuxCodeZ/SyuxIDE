const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');

let backendProcess;

function startBackend() {
  return new Promise((resolve) => {
    const backendDir = path.join(__dirname, '..', 'backend');
    const serverPath = path.join(backendDir, 'syux-server.exe');

    if (!fs.existsSync(serverPath)) {
      console.error(`Backend binary not found at ${serverPath}`);
      resolve(false);
      return;
    }

    console.log(`Starting backend: ${serverPath}`);
    backendProcess = spawn(serverPath, [], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false
    });

    backendProcess.stdout.on('data', (d) => process.stdout.write(`[backend] ${d}`));
    backendProcess.stderr.on('data', (d) => process.stderr.write(`[backend] ${d}`));
    backendProcess.on('error', (err) => console.error('Backend error:', err.message));
    backendProcess.on('exit', (code) => console.log(`Backend exited (${code})`));

    waitForPort(9090, '127.0.0.1', 10000)
      .then(() => { console.log('Backend ready'); resolve(true); })
      .catch(() => { console.log('Backend not detected'); resolve(false); });
  });
}

function waitForPort(port, host, timeout) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    function check() {
      const s = new net.Socket();
      s.setTimeout(500);
      s.on('connect', () => { s.destroy(); resolve(); });
      s.on('error', () => { s.destroy(); if (Date.now() - start > timeout) reject(); else setTimeout(check, 300); });
      s.on('timeout', () => { s.destroy(); if (Date.now() - start > timeout) reject(); else setTimeout(check, 300); });
      s.connect(port, host);
    }
    check();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1e1e1e',
    title: 'SYUX IDE',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
          nodeIntegration: false,
          webSecurity: false,
          allowFileAccess: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
