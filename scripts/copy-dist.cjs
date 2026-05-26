const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'dist');
const destDir = path.join(__dirname, '..', 'electron', 'dist');
const serverSrcDir = path.join(__dirname, '..', 'server', 'dist');
const serverDestDir = path.join(__dirname, '..', 'electron', 'server-dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    return;
  }
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`Copied ${src} to ${dest}`);
}

copyDir(srcDir, destDir);
copyDir(serverSrcDir, serverDestDir);