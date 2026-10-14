const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

// Determine data directory and file for persistent storage
const dataFile = path.join(app.getPath('userData'), 'products.json');

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    try {
      fs.mkdirSync(path.dirname(dataFile), { recursive: true });
      fs.writeFileSync(dataFile, '[]', 'utf8');
    } catch (err) {
      console.error('Failed to create initial data file:', err);
    }
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 850,
    minHeight: 600,
    title: 'TiniCRUD Desktop - Manajemen Produk',
    backgroundColor: '#f1f5f9',
    icon: path.join(__dirname, '../app/assets/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Remove default menu for clean desktop app feel (or keep minimal)
  mainWindow.setMenuBarVisibility(false);

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    // Development mode: wait for dev server then load
    console.log(`Connecting to Vite dev server at ${devServerUrl}...`);
    let connected = false;
    for (let i = 0; i < 30; i++) {
      try {
        await mainWindow.loadURL(devServerUrl);
        connected = true;
        break;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!connected) {
      console.error('Could not connect to Vite dev server. Loading fallback...');
      await mainWindow.loadFile(path.join(__dirname, '../.output/index.html'));
    }
  } else {
    // Production desktop mode: load prebuilt output
    const indexPath = path.join(__dirname, '../.output/index.html');
    if (fs.existsSync(indexPath)) {
      await mainWindow.loadFile(indexPath);
    } else {
      console.error(`.output/index.html not found at ${indexPath}. Please run 'npm run build' first.`);
    }
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-products', async () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading products from file:', err);
    return [];
  }
});

ipcMain.handle('save-products', async (_event, products) => {
  ensureDataFile();
  try {
    fs.writeFileSync(dataFile, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving products to file:', err);
    return false;
  }
});

ipcMain.handle('export-file', async (_event, { content, defaultName }) => {
  if (!mainWindow) return { success: false };

  const ext = path.extname(defaultName).toLowerCase();
  const filters = ext === '.csv'
    ? [{ name: 'CSV File (*.csv)', extensions: ['csv'] }]
    : [{ name: 'JSON File (*.json)', extensions: ['json'] }];

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Simpan Berkas Ekspor',
    defaultPath: defaultName,
    filters,
  });

  if (canceled || !filePath) {
    return { success: false };
  }

  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, filePath };
  } catch (err) {
    console.error('Failed to export file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('import-file', async () => {
  if (!mainWindow) return { success: false };

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Pilih Berkas JSON untuk Diimpor',
    filters: [{ name: 'JSON File (*.json)', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (canceled || filePaths.length === 0) {
    return { success: false };
  }

  try {
    const raw = fs.readFileSync(filePaths[0], 'utf8');
    const parsed = JSON.parse(raw);
    return { success: true, data: parsed, filePath: filePaths[0] };
  } catch (err) {
    console.error('Failed to import JSON file:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
  };
});

// App Lifecycle
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

