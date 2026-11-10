// Previsão Meteorológica nos Aeroportos de Destino - Grautam Viagens

const WEATHER_PRESETS = {
  GIG: { condition: 'Ensolarado', tempC: 29, icon: 'bi-sun', humidity: '65%', visibility: '10 km' },
  SDU: { condition: 'Ensolarado com brisa', tempC: 28, icon: 'bi-sun', humidity: '68%', visibility: '10 km' },
  GRU: { condition: 'Parcialmente Nublado', tempC: 22, icon: 'bi-cloud-sun', humidity: '72%', visibility: '9 km' },
  CGH: { condition: 'Parcialmente Nublado', tempC: 23, icon: 'bi-cloud-sun', humidity: '70%', visibility: '8 km' },
  BSB: { condition: 'Céu Aberto', tempC: 26, icon: 'bi-sun', humidity: '45%', visibility: '10 km' },
  SSA: { condition: 'Ensolarado e Quente', tempC: 31, icon: 'bi-sun', humidity: '75%', visibility: '10 km' },
  FEN: { condition: 'Sol e Águas Claras', tempC: 30, icon: 'bi-brightness-high', humidity: '70%', visibility: '10 km' },
  LIS: { condition: 'Ameno e Claro', tempC: 19, icon: 'bi-sun', humidity: '60%', visibility: '10 km' },
  MIA: { condition: 'Tropical e Ensolarado', tempC: 32, icon: 'bi-sun', humidity: '80%', visibility: '10 km' },
  CDG: { condition: 'Chuva Leve', tempC: 15, icon: 'bi-cloud-rain', humidity: '85%', visibility: '7 km' },
  EZE: { condition: 'Fresco e Agradável', tempC: 21, icon: 'bi-cloud-sun', humidity: '55%', visibility: '10 km' },
  SCL: { condition: 'Céu Limpo com vista Cordilheira', tempC: 24, icon: 'bi-sun', humidity: '40%', visibility: '10 km' }
};

function getDestinationWeather(airportCode) {
  const code = String(airportCode || '').toUpperCase().trim();
  return WEATHER_PRESETS[code] || {
    condition: 'Tempo Estável',
    tempC: 25,
    icon: 'bi-cloud-sun',
    humidity: '60%',
    visibility: '10 km'
  };
}

module.exports = {
  getDestinationWeather
};

