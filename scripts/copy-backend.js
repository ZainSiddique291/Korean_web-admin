import fs from 'fs';
import path from 'path';

const srcServer = path.resolve('../E_commerce2/server');
const destServer = path.resolve('./server');

const srcApi = path.resolve('../E_commerce2/api');
const destApi = path.resolve('./api');

// Helper to copy directory recursively excluding node_modules
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy server
console.log('Copying server from E_commerce2/server to E_commerce-admin/server...');
copyDirSync(srcServer, destServer);
console.log('✓ Copied server directory');

// 2. Copy api
console.log('Copying api from E_commerce2/api to E_commerce-admin/api...');
copyDirSync(srcApi, destApi);
console.log('✓ Copied api directory');

console.log('Backend copy complete!');
