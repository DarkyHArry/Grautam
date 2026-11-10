// Testes Unitários - Motor de Voos e Tarifas Aéreas
const assert = require('node:assert');
const flights = require('../src/services/flights');
const airports = require('../src/services/airports');
const pricing = require('../src/services/pricing');

console.log('Executando testes de Voos e Tarifas...');

// 1. Teste de Busca de Voos
const searchResults = flights.searchFlights({
  origin: 'GRU',
  destination: 'GIG',
  date: '2026-11-20',
  passengers: 2,
  cabinClass: 'economy'
});

assert(Array.isArray(searchResults), 'Busca deve retornar um array');
assert(searchResults.length > 0, 'Deve encontrar voos disponíveis para GRU -> GIG');
assert.strictEqual(searchResults[0].origin.code, 'GRU');
assert.strictEqual(searchResults[0].destination.code, 'GIG');
assert(searchResults[0].totalPrice > searchResults[0].pricePerPassenger, 'Total para 2 passageiros deve ser maior que preço individual');
console.log('✓ Teste de Busca de Voos: PASSOU');

// 2. Teste de Cálculo de Distância Geodésica
const distKm = airports.getFlightDistance('GRU', 'GIG');
assert(distKm > 300 && distKm < 450, `Distância GRU-GIG deve estar entre 300 e 450 km (calculado: ${distKm} km)`);
console.log(`✓ Teste de Distância Geodésica (GRU-GIG: ${distKm} km): PASSOU`);

// 3. Teste de Taxas Aeroportuárias
const domesticTax = pricing.calculateBoardingTax(false);
const interTax = pricing.calculateBoardingTax(true);
assert(interTax > domesticTax, 'Tarifa internacional de embarque deve ser maior que a nacional');
console.log(`✓ Teste de Tarifas de Embarque (Nac: R$ ${domesticTax}, Int: R$ ${interTax}): PASSOU`);

// 4. Teste de Desconto PIX de 5%
assert.strictEqual(searchResults[0].pixPrice, Math.round(searchResults[0].totalPrice * 0.95));
console.log('✓ Teste de Desconto no PIX (5%): PASSOU');

console.log('\nTodos os testes de flights.test.js passaram com sucesso!\n');

