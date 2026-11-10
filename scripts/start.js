// Launcher Seguro do Electron - Grautam Viagens
const { spawn } = require('node:child_process');
const electronPath = require('electron');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, ['.'], {
  env,
  stdio: 'inherit',
  windowsHide: false
});

child.on('close', code => {
  process.exit(code || 0);
});
