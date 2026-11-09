const StoreModule = require('electron-store');
const { safeStorage } = require('electron');
const Store = StoreModule.default || StoreModule;

const defaults = {
  settings: { theme: 'amoled', notifications: true, updates: true, countries: ['Brazil'], airline: 'LATAM' },
  trips: [], bookings: [], supportDrafts: [], notifications: [], dismissed: [],
  schemaVersion: 2
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


const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024;
function ensureProfileEncryption() {
  if (!safeStorage.isEncryptionAvailable()) throw new Error('O sistema não disponibilizou criptografia segura. Nenhum dado do perfil foi salvo.');
  if (process.platform === 'linux' && safeStorage.getSelectedStorageBackend?.() === 'basic_text') throw new Error('Configure o armazenamento seguro do sistema antes de salvar dados pessoais.');
}
function readDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number), date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}
function isValidCpf(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  for (let position = 9; position <= 10; position++) {
    let sum = 0;
    for (let index = 0; index < position; index++) sum += Number(digits[index]) * (position + 1 - index);
    const check = (sum * 10) % 11;
    if (Number(digits[position]) !== (check === 10 ? 0 : check)) return false;
  }
  return true;
}
function validateProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Perfil inválido.');
  const fullName = String(value.fullName || '').trim().replace(/\s+/g, ' ').slice(0, 100);
  const email = String(value.email || '').trim().toLowerCase().slice(0, 254);
  const phone = String(value.phone || '').trim().slice(0, 30), phoneDigits = phone.replace(/\D/g, '');
  const birthDate = String(value.birthDate || ''), parsedBirthDate = readDate(birthDate), today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const ageMs = parsedBirthDate ? todayUtc - parsedBirthDate.getTime() : -1;
  const nationality = String(value.nationality || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  const documentType = ['CPF', 'PASSAPORTE'].includes(value.documentType) ? value.documentType : '';
  const rawDocument = String(value.documentNumber || '').trim().toUpperCase().slice(0, 30);
  const documentNumber = documentType === 'CPF' ? rawDocument.replace(/\D/g, '') : rawDocument.replace(/\s/g, '');
  if ((fullName.match(/\p{L}+/gu) || []).length < 2) throw new Error('Informe seu nome completo.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe um e-mail válido.');
  if (phoneDigits.length < 8 || phoneDigits.length > 15 || !/^[+0-9() .-]+$/.test(phone)) throw new Error('Informe um telefone válido com código do país.');
  if (!parsedBirthDate || ageMs < 0 || ageMs / (365.2425 * 86400000) > 120) throw new Error('Informe uma data de nascimento válida.');
  if (!/^[\p{L}][\p{L} .'-]{1,59}$/u.test(nationality)) throw new Error('Informe sua nacionalidade.');
  if (!documentType) throw new Error('Selecione CPF ou passaporte.');
  if (documentType === 'CPF' && !isValidCpf(documentNumber)) throw new Error('O CPF informado não passou na validação.');
  if (documentType === 'PASSAPORTE' && !/^[A-Z0-9][A-Z0-9-]{4,19}$/.test(documentNumber)) throw new Error('Informe um número de passaporte válido.');
  let avatar = value.avatar == null || value.avatar === '' ? null : String(value.avatar);
  if (avatar) {
    const match = avatar.match(/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/);
    if (!match) throw new Error('A foto deve ser um PNG ou JPG válido.');
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > MAX_AVATAR_BYTES || bytes.toString('base64') !== match[2]) throw new Error('A foto deve ter no máximo 1,5 MB após a otimização.');
    const pngSignature = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
    const isPng = match[1] === 'png' && bytes.subarray(0,8).equals(pngSignature);
    const isJpeg = match[1] === 'jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!isPng && !isJpeg) throw new Error('O conteúdo da imagem não corresponde ao formato declarado.');
    avatar = 'data:image/' + match[1] + ';base64,' + match[2];
  }
  return { fullName,email,phone,birthDate,nationality,documentType,documentNumber,avatar,updatedAt:new Date().toISOString() };
}
function getProfile() {
  const encrypted = store.get('profileEncrypted');
  if (!encrypted) return null;
  ensureProfileEncryption();
  try { return JSON.parse(safeStorage.decryptString(Buffer.from(encrypted,'base64'))); }
  catch { throw new Error('Não foi possível abrir o perfil protegido deste dispositivo.'); }
}
function saveProfile(value) {
  ensureProfileEncryption();
  const profile = validateProfile(value);
  store.set('profileEncrypted', safeStorage.encryptString(JSON.stringify(profile)).toString('base64'));
  return profile;
}
function clearProfile() { store.delete('profileEncrypted'); }

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
module.exports = { store, listTrips, saveTrip, deleteTrip, getSettings, setSettings, listNotifications, addNotification, clearNotifications, getProfile, saveProfile, clearProfile };
