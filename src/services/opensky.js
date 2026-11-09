const BASE = 'https://opensky-network.org/api/states/all';
let cache = { at: 0, value: null };
let inFlight = null;
const CACHE_MS = 25_000;

async function getStates(bounds = {}) {
  if (cache.value && Date.now() - cache.at < CACHE_MS) return { ...cache.value, cached: true, fetchedAt: cache.at };
  if (inFlight) return inFlight;
  const params = new URLSearchParams();
  const allowed = { lamin: [-90, 90], lamax: [-90, 90], lomin: [-180, 180], lomax: [-180, 180] };
  for (const [key, [min, max]] of Object.entries(allowed)) {
    const val = Number(bounds[key]);
    if (Number.isFinite(val) && val >= min && val <= max) params.set(key, String(val));
  }
  inFlight = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(`${BASE}${params.size ? `?${params}` : ''}`, { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 429 ? 'Limite temporário da fonte de tráfego. Usando dados recentes em cache.' : `OpenSky respondeu ${response.status}.`);
      const body = await response.json();
      if (!Array.isArray(body.states)) throw new Error('Resposta OpenSky inválida.');
      const states = body.states.slice(0, 8000).map(s => ({
        icao24: String(s[0] || '').slice(0, 10), callsign: String(s[1] || '').trim().slice(0, 16), originCountry: String(s[2] || 'País indisponível').slice(0, 80),
        longitude: Number.isFinite(s[5]) ? s[5] : null, latitude: Number.isFinite(s[6]) ? s[6] : null,
        altitudeM: Number.isFinite(s[7]) ? Math.round(s[7]) : null, onGround: s[8] === true,
        velocityMs: Number.isFinite(s[9]) ? Math.round(s[9]) : null, heading: Number.isFinite(s[10]) ? Math.round(s[10]) : null,
        verticalRate: Number.isFinite(s[11]) ? Math.round(s[11]) : null, geoAltitudeM: Number.isFinite(s[13]) ? Math.round(s[13]) : null
      }));
      cache = { at: Date.now(), value: { time: Number(body.time) || Math.floor(Date.now() / 1000), states, source: 'OpenSky ADS-B', count: states.length } };
      return { ...cache.value, cached: false, fetchedAt: cache.at };
    } finally { clearTimeout(timeout); inFlight = null; }
  })();
  try { return await inFlight; } catch (error) {
    if (cache.value) return { ...cache.value, cached: true, stale: true, fetchedAt: cache.at, warning: error.message };
    throw error;
  }
}
module.exports = { getStates };
