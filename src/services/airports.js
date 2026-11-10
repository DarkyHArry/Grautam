// Catálogo Global de Aeroportos e Geodésia de Rotas - Grautam Viagens

const AIRPORTS_DETAILED = [
  { code: 'GRU', icao: 'SBGR', city: 'São Paulo', name: 'Aeroporto Internacional de Guarulhos', state: 'SP', country: 'Brasil', lat: -23.4356, lon: -46.4731, tz: 'America/Sao_Paulo' },
  { code: 'CGH', icao: 'SBSP', city: 'São Paulo', name: 'Aeroporto de Congonhas', state: 'SP', country: 'Brasil', lat: -23.6261, lon: -46.6564, tz: 'America/Sao_Paulo' },
  { code: 'GIG', icao: 'SBGL', city: 'Rio de Janeiro', name: 'Aeroporto Internacional do Galeão', state: 'RJ', country: 'Brasil', lat: -22.8089, lon: -43.2436, tz: 'America/Sao_Paulo' },
  { code: 'SDU', icao: 'SBRJ', city: 'Rio de Janeiro', name: 'Aeroporto Santos Dumont', state: 'RJ', country: 'Brasil', lat: -22.9105, lon: -43.1631, tz: 'America/Sao_Paulo' },
  { code: 'BSB', icao: 'SBBR', city: 'Brasília', name: 'Aeroporto Internacional Presidente Juscelino Kubitschek', state: 'DF', country: 'Brasil', lat: -15.8692, lon: -47.9172, tz: 'America/Sao_Paulo' },
  { code: 'SSA', icao: 'SBSV', city: 'Salvador', name: 'Aeroporto Internacional Dep. Luís Eduardo Magalhães', state: 'BA', country: 'Brasil', lat: -12.9086, lon: -38.3225, tz: 'America/Bahia' },
  { code: 'REC', icao: 'SBRF', city: 'Recife', name: 'Aeroporto Internacional dos Guararapes', state: 'PE', country: 'Brasil', lat: -8.1264, lon: -34.9228, tz: 'America/Recife' },
  { code: 'FOR', icao: 'SBFZ', city: 'Fortaleza', name: 'Aeroporto Internacional Pinto Martins', state: 'CE', country: 'Brasil', lat: -3.7763, lon: -38.5326, tz: 'America/Fortaleza' },
  { code: 'POA', icao: 'SBPA', city: 'Porto Alegre', name: 'Aeroporto Internacional Salgado Filho', state: 'RS', country: 'Brasil', lat: -29.9939, lon: -51.1711, tz: 'America/Sao_Paulo' },
  { code: 'CWB', icao: 'SBCT', city: 'Curitiba', name: 'Aeroporto Internacional Afonso Pena', state: 'PR', country: 'Brasil', lat: -25.5285, lon: -49.1758, tz: 'America/Sao_Paulo' },
  { code: 'CNF', icao: 'SBCF', city: 'Belo Horizonte', name: 'Aeroporto Internacional de Confins', state: 'MG', country: 'Brasil', lat: -19.6244, lon: -43.9719, tz: 'America/Sao_Paulo' },
  { code: 'FLN', icao: 'SBFL', city: 'Florianópolis', name: 'Aeroporto Internacional Hercílio Luz', state: 'SC', country: 'Brasil', lat: -27.6703, lon: -48.5525, tz: 'America/Sao_Paulo' },
  { code: 'FEN', icao: 'SBFN', city: 'Fernando de Noronha', name: 'Aeroporto Gov. Carlos Wilson', state: 'PE', country: 'Brasil', lat: -3.8549, lon: -32.4233, tz: 'America/Noronha' },
  { code: 'SCL', icao: 'SCEL', city: 'Santiago', name: 'Aeroporto Internacional Arturo Merino Benítez', state: 'RM', country: 'Chile', lat: -33.3930, lon: -70.7858, tz: 'America/Santiago' },
  { code: 'EZE', icao: 'SAEZ', city: 'Buenos Aires', name: 'Aeroporto Internacional Ministro Pistarini', state: 'BA', country: 'Argentina', lat: -34.8222, lon: -58.5358, tz: 'America/Argentina/Buenos_Aires' },
  { code: 'MVD', icao: 'SUMU', city: 'Montevidéu', name: 'Aeroporto Internacional de Carrasco', state: 'MO', country: 'Uruguai', lat: -34.8384, lon: -56.0308, tz: 'America/Montevideo' },
  { code: 'LIS', icao: 'LPPT', city: 'Lisboa', name: 'Aeroporto Humberto Delgado', state: 'LIS', country: 'Portugal', lat: 38.7756, lon: -9.1354, tz: 'Europe/Lisbon' },
  { code: 'MAD', icao: 'LEMD', city: 'Madri', name: 'Aeroporto Adolfo Suárez Madrid-Barajas', state: 'MD', country: 'Espanha', lat: 40.4839, lon: -3.5680, tz: 'Europe/Madrid' },
  { code: 'CDG', icao: 'LFPG', city: 'Paris', name: 'Aeroporto de Paris-Charles de Gaulle', state: 'IDF', country: 'França', lat: 49.0097, lon: 2.5479, tz: 'Europe/Paris' },
  { code: 'LHR', icao: 'EGLL', city: 'Londres', name: 'London Heathrow Airport', state: 'ENG', country: 'Reino Unido', lat: 51.4700, lon: -0.4543, tz: 'Europe/London' },
  { code: 'MIA', icao: 'KMIA', city: 'Miami', name: 'Miami International Airport', state: 'FL', country: 'Estados Unidos', lat: 25.7959, lon: -80.2870, tz: 'America/New_York' },
  { code: 'JFK', icao: 'KJFK', city: 'Nova York', name: 'John F. Kennedy International Airport', state: 'NY', country: 'Estados Unidos', lat: 40.6413, lon: -73.7781, tz: 'America/New_York' },
  { code: 'MCO', icao: 'KMCO', city: 'Orlando', name: 'Orlando International Airport', state: 'FL', country: 'Estados Unidos', lat: 28.4312, lon: -81.3081, tz: 'America/New_York' }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getAirportByCode(code) {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  return AIRPORTS_DETAILED.find(a => a.code === c || a.icao === c) || null;
}

function getFlightDistance(originCode, destCode) {
  const a1 = getAirportByCode(originCode);
  const a2 = getAirportByCode(destCode);
  if (!a1 || !a2) return null;
  return calculateDistanceKm(a1.lat, a1.lon, a2.lat, a2.lon);
}

module.exports = {
  AIRPORTS_DETAILED,
  getAirportByCode,
  calculateDistanceKm,
  getFlightDistance
};
