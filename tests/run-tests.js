// Test Runner Integrado - Grautam Viagens
const { spawnSync } = require('node:child_process');
const path = require('node:path');

console.log('=== INICIANDO SUÍTE DE TESTES DO GRAUTAM ===\n');

const testFiles = ['flights.test.js', 'store.test.js'];
let passed = 0;

for (const file of testFiles) {
  const filePath = path.join(__dirname, file);
  console.log(`[TEST SUITE] ${file}:`);
  const res = spawnSync(process.execPath, [filePath], { stdio: 'inherit' });
  if (res.status === 0) {
    passed++;
  } else {
    console.error(`Falha no teste: ${file}`);
    process.exit(1);
  }
}

console.log(`=== TODOS OS ${passed} ARQUIVOS DE TESTE EXECUTADOS COM SUCESSO! ===`);
