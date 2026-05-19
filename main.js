const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const net = require('net');
const fs = require('fs');
const child_process = require('child_process');

let mainWindow;
let nextProcess;

// Find a free port
function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
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

async function startServerAndApp() {
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
  
  // Find open port
  const port = await findFreePort();
  process.env.PORT = port.toString();
  process.env.NODE_ENV = 'production';
  process.env.HOSTNAME = '127.0.0.1';

  console.log(`Starting LLM-Wiki on port ${port} with WIKI_DIR=${wikiDir}`);

  // Determine path to Next.js standalone server
  let serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
  
  if (!fs.existsSync(serverPath)) {
    // If running in dev mode using just 'electron .'
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

  // Wait for the server to be ready
  const waitForServer = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const req = net.request({ port, host: '127.0.0.1' });
        req.on('response', (res) => {
          clearInterval(interval);
          resolve();
        });
        req.on('error', () => {});
        req.end();
      }, 500);
    });
  };
  
  // Actually wait for it... wait, net.request doesn't exist in standard node 'net'. Use 'http' or just attempt connect.
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

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "LLM Wiki",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://localhost:${port}`);
  
  // Open target links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
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
  }
});
