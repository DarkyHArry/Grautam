const StoreModule = require('electron-store');
const Store = StoreModule.default || StoreModule;

const defaults = {
  settings: { theme: 'amoled', notifications: true, updates: true, countries: ['Brazil'], airline: 'LATAM' },
  trips: [], bookings: [], supportDrafts: [], notifications: [], dismissed: [],
  schemaVersion: 1
};
const store = new Store({ name: 'grautam-local', defaults, clearInvalidConfig: false });

function isValidTripDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;
  const today = new Date();
  return date.getTime() >= Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
}

function validateTrip(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Registro inválido.');
  const trip = {
    id: typeof value.id === 'string' ? value.id.slice(0, 80) : '',
    origin: typeof value.origin === 'string' ? value.origin.trim().slice(0, 80) : '',
    destination: typeof value.destination === 'string' ? value.destination.trim().slice(0, 80) : '',
    date: typeof value.date === 'string' ? value.date.slice(0, 20) : '',
    passengers: Number(value.passengers), createdAt: Number(value.createdAt) || Date.now()
  };
  if (!trip.origin || !trip.destination || trip.origin === trip.destination) throw new Error('Informe origem e destino diferentes.');
  if (!Number.isInteger(trip.passengers) || trip.passengers < 1 || trip.passengers > 9) throw new Error('O número de passageiros deve ser de 1 a 9.');
  if (trip.date && !isValidTripDate(trip.date)) throw new Error('Informe uma data futura válida.');
  if (!trip.id) trip.id = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return trip;
}

function safeSettings(value = {}) {
  const countries = Array.isArray(value.countries) ? value.countries.filter(c => typeof c === 'string').slice(0, 20) : ['Brazil'];
  const airlines = ['LATAM', 'Azul', 'GOL', 'Avianca', 'Copa Airlines', 'Iberia', 'Air France', 'Lufthansa'];
  const notifications = value.notifications !== false;
  return { theme: 'amoled', notifications, updates: value.updates !== false, countries, airline: airlines.includes(value.airline) ? value.airline : 'LATAM' };
}
function listNotifications() { return store.get('notifications', []).slice(0, 100); }
function addNotification(input) {
  const item = { id: String(input?.id || `notice_${Date.now()}`).slice(0, 100), type: ['system', 'purchase', 'flight'].includes(input?.type) ? input.type : 'system', title: String(input?.title || 'Grautam').slice(0, 100), message: String(input?.message || '').slice(0, 500), createdAt: Number(input?.createdAt) || Date.now(), read: false };
  store.set('notifications', [item, ...listNotifications()].slice(0, 100));
  return item;
}
function clearNotifications() { store.set('notifications', []); }
function listTrips() { return store.get('trips', []); }
function saveTrip(value) {
  const trip = validateTrip(value);
  const rows = listTrips().filter(item => item.id !== trip.id);
  store.set('trips', [trip, ...rows].slice(0, 500));
  return trip;
}
function deleteTrip(id) {
  if (typeof id !== 'string') throw new Error('Identificador inválido.');
  store.set('trips', listTrips().filter(item => item.id !== id));
}
function getSettings() { return safeSettings(store.get('settings', {})); }
function setSettings(value) { const settings = safeSettings({ ...getSettings(), ...value }); store.set('settings', settings); return settings; }
module.exports = { store, listTrips, saveTrip, deleteTrip, getSettings, setSettings, listNotifications, addNotification, clearNotifications };
