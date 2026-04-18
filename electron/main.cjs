const { app, BrowserWindow, dialog, ipcMain, session, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const ALLOWED_EXTERNAL_HOSTS = new Set([
  'plugins.auxilor.io',
  'github.com',
  'www.github.com',
]);

const shouldLoadDist = app.isPackaged || process.argv.includes('--dist');

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
].join('; ');

function applyProductionCsp() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [PROD_CSP],
      },
    });
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1580,
    height: 980,
    minWidth: 1260,
    minHeight: 820,
    backgroundColor: '#f4efe4',
    title: 'EcoSuite Builder',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (shouldLoadDist) {
    window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    return;
  }

  window.loadURL('http://127.0.0.1:5173');
}

app.whenReady().then(() => {
  if (shouldLoadDist) {
    applyProductionCsp();
  }

  ipcMain.handle('open-external', async (_event, targetUrl) => {
    try {
      const parsed = new URL(String(targetUrl ?? ''));
      if (parsed.protocol !== 'https:') return false;
      if (!ALLOWED_EXTERNAL_HOSTS.has(parsed.host)) return false;
      await shell.openExternal(parsed.toString());
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('import-pack', async () => {
    const directory = await dialog.showOpenDialog({
      title: 'Pick a folder containing plugin configs',
      properties: ['openDirectory'],
    });

    if (directory.canceled || !directory.filePaths?.[0]) {
      return { canceled: true };
    }

    const root = directory.filePaths[0];
    const MAX_FILES = 2000;
    const MAX_BYTES = 2 * 1024 * 1024;
    const files = [];
    const skipped = [];

    async function walk(current) {
      if (files.length >= MAX_FILES) return;
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        if (files.length >= MAX_FILES) return;
        const absolute = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === '.git') continue;
          await walk(absolute);
          continue;
        }
        if (!entry.isFile()) continue;
        if (!/\.ya?ml$/i.test(entry.name)) continue;
        if (entry.name === '_example.yml' || entry.name === '_example.yaml') continue;
        try {
          const content = await fs.readFile(absolute, 'utf8');
          if (Buffer.byteLength(content, 'utf8') > MAX_BYTES) {
            skipped.push({ path: absolute, reason: 'file too large' });
            continue;
          }
          const relative = path.relative(root, absolute).replace(/\\/g, '/');
          files.push({ path: relative, content });
        } catch (err) {
          skipped.push({ path: absolute, reason: err?.message ?? 'read failed' });
        }
      }
    }

    try {
      await walk(root);
    } catch (err) {
      return { canceled: false, error: err?.message ?? 'walk failed', directory: root, files: [], skipped };
    }

    return { canceled: false, directory: root, files, skipped };
  });

  ipcMain.handle('export-pack', async (_event, payload) => {
    const { files } = payload ?? {};
    if (!Array.isArray(files) || files.length === 0) {
      return { canceled: true };
    }

    const directory = await dialog.showOpenDialog({
      title: 'Pick a folder to export the pack into',
      properties: ['openDirectory', 'createDirectory'],
    });

    if (directory.canceled || !directory.filePaths?.[0]) {
      return { canceled: true };
    }

    const root = directory.filePaths[0];
    const written = [];
    const failed = [];

    await Promise.all(
      files.map(async (file) => {
        const relativePath = String(file.path ?? '').replace(/^\/+/, '');
        if (!relativePath) {
          failed.push({ path: file.path, reason: 'Missing path.' });
          return;
        }
        const absolute = path.join(root, relativePath);
        try {
          await fs.mkdir(path.dirname(absolute), { recursive: true });
          await fs.writeFile(absolute, String(file.content ?? ''), 'utf8');
          written.push(absolute);
        } catch (err) {
          failed.push({ path: relativePath, reason: err?.message ?? 'unknown error' });
        }
      }),
    );

    return { canceled: false, directory: root, written, failed };
  });

  ipcMain.handle('save-yaml', async (_event, payload) => {
    const { content, defaultFileName } = payload ?? {};
    const result = await dialog.showSaveDialog({
      title: 'Export EcoSuite Config',
      defaultPath: defaultFileName || 'config.yml',
      filters: [
        { name: 'YAML', extensions: ['yml', 'yaml'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    await fs.writeFile(result.filePath, content ?? '', 'utf8');
    return {
      canceled: false,
      filePath: result.filePath,
    };
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
