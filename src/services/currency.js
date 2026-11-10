// Conversor Monetário de Tarifas Aéreas - Grautam Viagens

const RATES_TO_BRL = {
  BRL: 1.0,
  USD: 5.42,
  EUR: 5.88
};

const SYMBOLS = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€'
};

function convertCurrency(amountInBrl, targetCurrency = 'BRL') {
  const rate = RATES_TO_BRL[targetCurrency] || 1.0;
  const converted = amountInBrl / rate;
  return Math.round(converted * 100) / 100;
}

function formatPrice(amountInBrl, currency = 'BRL') {
  const val = convertCurrency(amountInBrl, currency);
  const localeMap = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE'
  };
  return new Intl.NumberFormat(localeMap[currency] || 'pt-BR', {
    style: 'currency',
    currency: currency
  }).format(val);
}

function getAvailableCurrencies() {
  return [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', rate: 1.0 },
    { code: 'USD', name: 'Dólar Americano', symbol: 'US$', rate: 5.42 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 5.88 }
  ];
}

module.exports = {
  RATES_TO_BRL,
  SYMBOLS,
  convertCurrency,
  formatPrice,
  getAvailableCurrencies
};

