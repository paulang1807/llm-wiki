const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

console.log('Preparing standalone build for Electron packaging...');

if (!fs.existsSync(standaloneDir)) {
  console.error('Error: .next/standalone directory not found. Did you run next build first?');
  process.exit(1);
}

// Copy public folder
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc)) {
  console.log('Copying public folder...');
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

// Copy .next/static folder
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  console.log('Copying .next/static folder...');
  fs.cpSync(staticSrc, staticDest, { recursive: true });
}

console.log('Successfully prepared standalone Next.js server.');
