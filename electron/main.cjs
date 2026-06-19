const { app, BrowserWindow, shell, ipcMain, screen } = require('electron');
const { join, dirname } = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// __filename and __dirname are provided by Node CommonJS modules, no redeclaration needed.

// Initialize electron-store for persistent settings
const store = new Store();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
try {
  const squirrelStartup = require('electron-squirrel-startup');
  if (squirrelStartup) {
    app.quit();
  }
} catch {
  // electron-squirrel-startup not installed, skip
}

let mainWindow = null;
let serverProcess = null;

const loadAppWithRetry = async (url, maxAttempts = 8) => {
  if (!mainWindow) return;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mainWindow.loadURL(url);
      return;
    } catch (error) {
      console.warn(`Failed to load ${url} (attempt ${attempt}/${maxAttempts}):`, error);
      if (attempt === maxAttempts) {
        console.error('Unable to load app URL after retries.');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.max(1200, width - 200),
    height: Math.max(800, height - 100),
    minWidth: 1024,
    minHeight: 768,
    title: 'Odyseus Nexus Pro',
    icon: join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#050505',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      sandbox: true
    },
    frame: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    vibrancy: 'under-window',
    visualEffectState: 'active'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    const devUrl = 'http://localhost:3000';
    mainWindow.webContents.once('did-fail-load', () => {
      loadAppWithRetry(devUrl);
    });
    loadAppWithRetry(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, dist is copied into electron/dist during build
    const distPath = join(__dirname, 'dist', 'index.html');
    mainWindow.loadFile(distPath);
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http') || url.startsWith('https')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const startServer = () => {
  if (serverProcess) return;
  
  const isWin = process.platform === 'win32';
  
  // In production, use compiled server; in development use tsx
  let serverScript;
  let useTsx = false;
  let nodeArgs = [];
  
  if (process.env.NODE_ENV === 'development') {
    serverScript = join(__dirname, '../server/index.ts');
    useTsx = true;
  } else {
    serverScript = join(__dirname, 'server-dist', 'index.js');
    // Node.js can run ESM directly from the dist folder
    nodeArgs = ['--experimental-specifier-resolution=node'];
  }
  
  if (useTsx) {
    serverProcess = spawn(isWin ? 'npx.cmd' : 'npx', ['tsx', serverScript], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    });
  } else {
    serverProcess = spawn('node', [...nodeArgs, serverScript], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' }
    });
  }

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[SERVER] ${data.toString()}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[SERVER ERROR] ${data.toString()}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    serverProcess = null;
  });
};

const stopServer = () => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
};

// IPC Handlers
ipcMain.handle('get-app-settings', () => {
  return store.get('appSettings', {
    windowState: 'normal',
    lastProject: null,
    autoSave: true,
    theme: 'dark'
  });
});

ipcMain.handle('set-app-settings', (event, settings) => {
  store.set('appSettings', settings);
});

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// App lifecycle
app.whenReady().then(() => {
  if (process.env.START_SERVER !== 'false') {
    startServer();
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});