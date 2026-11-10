// Testes Unitários - Armazenamento de Reservas, PNR e Fidelidade
const assert = require('node:assert');
const miles = require('../src/services/miles');
const baggage = require('../src/services/baggage');
const calendar = require('../src/services/calendar');
const passengers = require('../src/services/passengers');

console.log('Executando testes de Serviços e Validações...');

// 1. Teste de Validação de CPF
assert.strictEqual(passengers.validateCpf('111.111.111-11'), false, 'CPF com dígitos repetidos deve ser inválido');
assert.strictEqual(passengers.validateCpf('12345678909'), true, 'CPF válido deve passar');
assert.strictEqual(passengers.formatCpf('12345678909'), '123.456.789-09');
console.log('✓ Teste de Validação Documental de CPF: PASSOU');

// 2. Teste de Cálculo de Milhas
const earnedMiles = miles.calculateMilesEarned(1000, 'economy', 'GOLD');
assert(earnedMiles > 0, 'Deve acumular milhas');
const progress = miles.getTierProgress(15000);
assert.strictEqual(progress.tier.name, 'Gold', 'Categoria com 15k pontos deve ser Gold');
console.log(`✓ Teste de Programa de Milhas (Gold acumula: ${earnedMiles} pts): PASSOU`);

// 3. Teste de Cálculo de Bagagem
const baggageFee = baggage.calculateBaggageFee(2, 0, []);
assert(baggageFee === 270, `2 malas despachadas devem totalizar R$ 270 (calculado: R$ ${baggageFee})`);
console.log('✓ Teste de Franquia e Tarifação de Bagagem: PASSOU');

// 4. Teste de Geração de Calendário RFC 5545
const ics = calendar.generateIcsCalendar({
  flightNumber: 'LA 3012',
  originCode: 'GRU',
  destinationCode: 'GIG',
  date: '2026-11-20',
  departureTime: '06:15',
  arrivalTime: '07:25',
  pnr: 'GTM-78241'
});

assert(ics.includes('BEGIN:VCALENDAR'), 'Arquivo deve conter cabeçalho RFC 5545');
assert(ics.includes('GTM-78241'), 'Evento deve conter o localizador PNR');
assert(ics.includes('END:VCALENDAR'), 'Arquivo deve conter encerramento do calendário');
console.log('✓ Teste de Exportação iCalendar (.ics): PASSOU');

console.log('\nTodos os testes de store.test.js passaram com sucesso!\n');
