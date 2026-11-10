// Testes Unitários - Telemetria de Voos em Tempo Real e Câmbio de Moedas
const assert = require('node:assert');
const liveFlights = require('../src/services/liveFlights');
const currency = require('../src/services/currency');

console.log('Executando testes de Telemetria e Câmbio...');

// 1. Detecção de Companhia Aérea pelo Callsign ADS-B
const latamCall = liveFlights.detectAirline('TAM3012');
assert.strictEqual(latamCall.badge, 'LATAM', 'TAM3012 deve ser detectado como LATAM');
assert.strictEqual(latamCall.color, '#e6004c', 'Cor da LATAM deve ser Coral #e6004c');

const golCall = liveFlights.detectAirline('GLO1420');
assert.strictEqual(golCall.badge, 'GOL', 'GLO1420 deve ser detectado como GOL');

const azulCall = liveFlights.detectAirline('AZU4198');
assert.strictEqual(azulCall.badge, 'Azul', 'AZU4198 deve ser detectado como Azul');

console.log('✓ Teste de Identificação ADS-B de Companhias Aéreas: PASSOU');

// 2. Fallback Resiliente de Voos em Tempo Real
const fallback = liveFlights.getFallbackLiveFlights();
assert(Array.isArray(fallback) && fallback.length >= 6, 'Fallback deve conter pelo menos 6 voos comerciais');
assert(fallback.some(f => f.airlineBadge === 'LATAM'), 'Fallback deve conter voos da LATAM');
console.log('✓ Teste de Fallback Resiliente ADS-B: PASSOU');

// 3. Conversor de Moedas e Bidirecionalidade
const valInBrl = 1000;
const inUsd = currency.convertCurrency(valInBrl, 'USD');
assert(inUsd > 100 && inUsd < 250, `1000 BRL em USD deve estar entre 100 e 250 (calculado: ${inUsd})`);

const inEur = currency.convertCurrency(valInBrl, 'EUR');
assert(inEur > 100 && inEur < 250, `1000 BRL em EUR deve estar entre 100 e 250 (calculado: ${inEur})`);

const backToBrl = currency.convertAmount(inUsd, 'USD', 'BRL');
assert(Math.abs(backToBrl - valInBrl) < 2.0, 'Conversão bidirecional USD -> BRL deve ser precisa');

console.log('✓ Teste de Câmbio Multimoedas (BRL/USD/EUR): PASSOU');

console.log('\nTodos os testes de liveFlights.test.js passaram com sucesso!\n');

