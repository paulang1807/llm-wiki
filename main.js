const { app, BrowserWindow, dialog, shell } = require('electron');
const path = require('path');
const net = require('net');
const fs = require('fs');
const child_process = require('child_process');

let mainWindow = null;
let nextProcess = null;
let activePort = null;

// Find a free port, starting from preferredPort if available
function findFreePort(preferredPort = 3000) {
  return new Promise((resolve, reject) => {
    const tryListen = (portToTry) => {
      const server = net.createServer();
      server.unref();
      server.on('error', (err) => {
        if (portToTry !== 0) {
          tryListen(0);
        } else {
          reject(err);
        }
      });
      server.listen(portToTry, '127.0.0.1', () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
    };
    tryListen(preferredPort);
  });
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.replace(/\\n/gm, '\n');
      }
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      process.env[key] = value;
    }
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "LLM Wiki",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const activeUrl = `http://localhost:${port}`;
  console.log(`[LLM-Wiki] Opening window at ${activeUrl}`);
  mainWindow.loadURL(activeUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open target links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

async function startServerAndApp() {
  if (nextProcess && activePort) {
    createWindow(activePort);
    return;
  }

  const docsPath = app.getPath('documents');
  const wikiDir = path.join(docsPath, 'LLM-Wiki');

  // Ensure documents directory exists
  if (!fs.existsSync(wikiDir)) {
    fs.mkdirSync(wikiDir, { recursive: true });
  }

  // Handle environment variables from ~/Documents/LLM-Wiki/.env
  const envPath = path.join(wikiDir, '.env');
  if (!fs.existsSync(envPath)) {
    const defaultEnv = `GOOGLE_API_KEY=your_api_key_here\nDEFAULT_MODEL=gemini-2.5-flash\n`;
    fs.writeFileSync(envPath, defaultEnv);
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Configuration Needed',
      message: `A configuration file was created at:\n${envPath}\n\nPlease add your GOOGLE_API_KEY to this file for the LLM features to work.`
    });
  }

  parseEnvFile(envPath);
  process.env.DATA_DIR = wikiDir;

  // Find open port dynamically
  const preferred = parseInt(process.env.PORT || '3000', 10);
  const port = await findFreePort(preferred);
  activePort = port;
  process.env.PORT = port.toString();
  process.env.NODE_ENV = 'production';
  process.env.HOSTNAME = '127.0.0.1';

  console.log(`[LLM-Wiki] Starting server on http://localhost:${port} (port ${port}) with WIKI_DIR=${wikiDir}`);

  // Determine path to Next.js standalone server
  const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

  if (!fs.existsSync(serverPath)) {
    dialog.showErrorBox('Server Not Found', 'Could not find the packaged server. Ensure the app was built correctly.');
    app.quit();
    return;
  }

  // Spawn the server
  nextProcess = child_process.fork(serverPath, [], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'pipe'
  });

  nextProcess.stdout.on('data', (data) => console.log(`[Next.js]: ${data}`));
  nextProcess.stderr.on('data', (data) => console.error(`[Next.js Error]: ${data}`));

  const waitForPort = () => {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const socket = new net.Socket();
        socket.on('connect', () => {
          socket.destroy();
          clearInterval(interval);
          resolve();
        });
        socket.on('error', () => {
          socket.destroy();
          if (attempts > 30) {
            clearInterval(interval);
            console.error('Timeout waiting for Next.js server');
            app.quit();
          }
        });
        socket.connect(port, '127.0.0.1');
      }, 500);
    });
  };

  await waitForPort();
  console.log(`[LLM-Wiki] Server ready at http://localhost:${port}`);
  createWindow(port);
}

app.whenReady().then(() => {
  startServerAndApp().catch(err => {
    console.error(err);
    dialog.showErrorBox('Launch Error', err.message);
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    startServerAndApp();
  }
});

app.on('will-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});
