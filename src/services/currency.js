// Conversor Monetário de Tarifas Aéreas em Tempo Real - Grautam Viagens

let RATES_TO_BRL = {
  BRL: 1.0,
  USD: 5.48,
  EUR: 6.12
};

const SYMBOLS = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€'
};

let lastFetched = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora de cache para taxas de câmbio

async function fetchLiveExchangeRates() {
  const now = Date.now();
  if (now - lastFetched < CACHE_TTL_MS) {
    return {
      rates: { ...RATES_TO_BRL },
      source: 'Cache Local (Atualizado recentemente)',
      lastUpdate: lastFetched,
      success: true
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/BRL', {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Status HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data && data.rates) {
      // 1 BRL = rates.USD -> 1 USD = 1 / rates.USD BRL
      if (data.rates.USD && data.rates.USD > 0) {
        RATES_TO_BRL.USD = Math.round((1 / data.rates.USD) * 100) / 100;
      }
      if (data.rates.EUR && data.rates.EUR > 0) {
        RATES_TO_BRL.EUR = Math.round((1 / data.rates.EUR) * 100) / 100;
      }
      lastFetched = now;
      return {
        rates: { ...RATES_TO_BRL },
        source: 'ExchangeRate-API Pública (Tempo Real)',
        lastUpdate: now,
        success: true
      };
    }
    throw new Error('Dados de taxas não encontrados');
  } catch (err) {
    console.warn('[Currency Service] Usando taxas de fallback:', err.message);
    return {
      rates: { ...RATES_TO_BRL },
      source: 'Taxas Referenciais de Fallback',
      lastUpdate: lastFetched || now,
      success: false,
      error: err.message
    };
  } finally {
    clearTimeout(timer);
  }
}

function convertCurrency(amountInBrl, targetCurrency = 'BRL') {
  const rate = RATES_TO_BRL[targetCurrency] || 1.0;
  const converted = (Number(amountInBrl) || 0) / rate;
  return Math.round(converted * 100) / 100;
}

function convertAmount(amount, fromCurrency = 'BRL', toCurrency = 'BRL') {
  const num = Number(amount) || 0;
  if (fromCurrency === toCurrency) return num;
  // Converte para BRL primeiro
  const inBrl = fromCurrency === 'BRL' ? num : num * (RATES_TO_BRL[fromCurrency] || 1.0);
  // Converte de BRL para moeda de destino
  return convertCurrency(inBrl, toCurrency);
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
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', rate: RATES_TO_BRL.BRL },
    { code: 'USD', name: 'Dólar Americano', symbol: 'US$', rate: RATES_TO_BRL.USD },
    { code: 'EUR', name: 'Euro Europeu', symbol: '€', rate: RATES_TO_BRL.EUR }
  ];
}

module.exports = {
  RATES_TO_BRL,
  SYMBOLS,
  fetchLiveExchangeRates,
  convertCurrency,
  convertAmount,
  formatPrice,
  getAvailableCurrencies
};
