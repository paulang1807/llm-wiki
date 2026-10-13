const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const mode = process.argv[2] === 'start' ? 'start' : 'dev';
const preferredPort = parseInt(process.env.PORT || '3000', 10);

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port);
  });
}

async function findAvailablePort(startPort, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = startPort + i;
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, () => {
      const assigned = srv.address().port;
      srv.close(() => resolve(assigned));
    });
  });
}

async function main() {
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`[LLM-Wiki] Port ${preferredPort} is occupied, falling back to port ${port}.`);
  }
  console.log(`[LLM-Wiki] Active URL: http://localhost:${port} (mode: ${mode})`);

  const nextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
  const child = spawn(nextBin, [mode, '-p', String(port)], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(port) }
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('[LLM-Wiki] Failed to start server:', err);
  process.exit(1);
});
