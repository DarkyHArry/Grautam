const StoreModule = require('electron-store');
const Store = StoreModule.default || StoreModule;
const { randomUUID } = require('node:crypto');

const defaults = {
  settings: {
    theme: 'dark',
    notifications: true,
    currency: 'BRL',
    passengerName: 'Carlos Silveira',
    passengerDoc: '284.912.840-12',
    passengerEmail: 'carlos.silveira@grautam.com.br',
    passengerPhone: '(11) 98765-4321',
    preferredAirline: 'LATAM Airlines'
  },
  trips: [
    {
      id: 'trip_demo_1',
      origin: 'São Paulo (GRU)',
      destination: 'Rio de Janeiro (GIG)',
      date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      passengers: 1,
      notes: 'Planejamento de final de semana',
      createdAt: Date.now() - 3600000 * 24
    }
  ],
  bookings: [
    {
      id: 'book_initial_1',
      pnr: 'GTM-78241',
      eticket: '042-89210948',
      flightNumber: 'LA 3012',
      airline: 'LATAM Airlines',
      origin: 'São Paulo (GRU)',
      originCode: 'GRU',
      originCity: 'São Paulo',
      originTerminal: 'Terminal 3',
      destination: 'Rio de Janeiro (GIG)',
      destinationCode: 'GIG',
      destinationCity: 'Rio de Janeiro',
      destinationTerminal: 'Terminal 2',
      date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
      departureTime: '06:15',
      arrivalTime: '07:25',
      duration: '1h 10m',
      cabinClass: 'Econômica',
      seat: '12A',
      gate: 'B12',
      baggage: '1x Mala de mão (10kg) inclusa',
      passengers: [
        {
          name: 'Carlos Silveira',
          document: '284.912.840-12',
          seat: '12A'
        }
      ],
      paymentMethod: 'PIX',
      total: 349.00,
      status: 'CONFIRMADO',
      createdAt: Date.now() - 86400000 * 2
    }
  ],
  supportDrafts: [],
  notifications: [
    {
      id: 'notice_welcome',
      type: 'system',
      title: 'Bem-vindo ao Grautam Viagens',
      message: 'Sistema comercial de busca, reserva e emissão de passagens aéreas pronto.',
      createdAt: Date.now(),
      read: false
    }
  ],
  schemaVersion: 2
};

const store = new Store({ name: 'grautam-local', defaults, clearInvalidConfig: false });

function listBookings() {
  return store.get('bookings', []);
}

function saveBooking(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Dados de reserva inválidos.');
  
  const id = raw.id || `book_${randomUUID().slice(0, 8)}`;
  const pnr = raw.pnr || `GTM-${Math.floor(10000 + Math.random() * 90000)}`;
  const eticket = raw.eticket || `042-${Math.floor(10000000 + Math.random() * 90000000)}`;
  
  const booking = {
    id,
    pnr,
    eticket,
    flightNumber: String(raw.flightNumber || 'GT 1000').slice(0, 20),
    airline: String(raw.airline || 'Grautam Airlines').slice(0, 50),
    origin: String(raw.origin || 'São Paulo (GRU)').slice(0, 80),
    originCode: String(raw.originCode || 'GRU').slice(0, 5),
    originCity: String(raw.originCity || 'São Paulo').slice(0, 50),
    originTerminal: String(raw.originTerminal || 'Terminal 1').slice(0, 30),
    destination: String(raw.destination || 'Rio de Janeiro (GIG)').slice(0, 80),
    destinationCode: String(raw.destinationCode || 'GIG').slice(0, 5),
    destinationCity: String(raw.destinationCity || 'Rio de Janeiro').slice(0, 50),
    destinationTerminal: String(raw.destinationTerminal || 'Terminal 1').slice(0, 30),
    date: String(raw.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    departureTime: String(raw.departureTime || '08:00').slice(0, 10),
    arrivalTime: String(raw.arrivalTime || '09:15').slice(0, 10),
    duration: String(raw.duration || '1h 15m').slice(0, 20),
    cabinClass: String(raw.cabinClass || 'Econômica').slice(0, 30),
    seat: String(raw.seat || '14C').slice(0, 10),
    gate: String(raw.gate || `A${Math.floor(1 + Math.random() * 20)}`).slice(0, 10),
    baggage: String(raw.baggage || 'Mala de mão 10kg inclusa').slice(0, 80),
    extras: Array.isArray(raw.extras) ? raw.extras.map(e => String(e).slice(0, 50)) : [],
    passengers: Array.isArray(raw.passengers) && raw.passengers.length ? raw.passengers.map(p => ({
      name: String(p.name || 'Passageiro').trim().slice(0, 80),
      document: String(p.document || '').trim().slice(0, 40),
      seat: String(p.seat || raw.seat || '12A').slice(0, 10)
    })) : [
      {
        name: String(raw.passengerName || 'Passageiro Titular').trim().slice(0, 80),
        document: String(raw.passengerDoc || '').trim().slice(0, 40),
        seat: String(raw.seat || '14C').slice(0, 10)
      }
    ],
    paymentMethod: ['PIX', 'Cartão de Crédito', 'Boleto'].includes(raw.paymentMethod) ? raw.paymentMethod : 'PIX',
    installments: String(raw.installments || '1x').slice(0, 40),
    total: Math.max(1, Number(raw.total) || 100),
    status: 'CONFIRMADO',
    createdAt: Date.now()
  };

  const list = listBookings().filter(b => b.id !== booking.id);
  store.set('bookings', [booking, ...list].slice(0, 200));
  return booking;
}

function cancelBooking(id) {
  if (!id) throw new Error('ID da reserva não informado.');
  const list = listBookings();
  const target = list.find(b => b.id === id || b.pnr === id);
  if (!target) throw new Error('Reserva não encontrada.');
  target.status = 'CANCELADO';
  store.set('bookings', list);
  return target;
}

function validateTrip(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Registro inválido.');
  const trip = {
    id: typeof value.id === 'string' ? value.id.slice(0, 80) : `trip_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    origin: typeof value.origin === 'string' ? value.origin.trim().slice(0, 80) : '',
    destination: typeof value.destination === 'string' ? value.destination.trim().slice(0, 80) : '',
    date: typeof value.date === 'string' ? value.date.slice(0, 20) : '',
    passengers: Number(value.passengers) || 1,
    notes: typeof value.notes === 'string' ? value.notes.slice(0, 200) : '',
    createdAt: Number(value.createdAt) || Date.now()
  };
  if (!trip.origin || !trip.destination || trip.origin === trip.destination) throw new Error('Informe origem e destino diferentes.');
  if (!Number.isInteger(trip.passengers) || trip.passengers < 1 || trip.passengers > 9) throw new Error('O número de passageiros deve ser de 1 a 9.');
  return trip;
}

function listTrips() {
  return store.get('trips', []);
}

function saveTrip(value) {
  const trip = validateTrip(value);
  const rows = listTrips().filter(item => item.id !== trip.id);
  store.set('trips', [trip, ...rows].slice(0, 200));
  return trip;
}

function deleteTrip(id) {
  if (typeof id !== 'string') throw new Error('Identificador inválido.');
  store.set('trips', listTrips().filter(item => item.id !== id));
}

function listNotifications() {
  return store.get('notifications', []).slice(0, 100);
}

function addNotification(input) {
  const item = {
    id: String(input?.id || `notice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`).slice(0, 100),
    type: ['system', 'purchase', 'flight'].includes(input?.type) ? input.type : 'system',
    title: String(input?.title || 'Grautam Viagens').slice(0, 100),
    message: String(input?.message || '').slice(0, 500),
    createdAt: Number(input?.createdAt) || Date.now(),
    read: false
  };
  store.set('notifications', [item, ...listNotifications()].slice(0, 100));
  return item;
}

function clearNotifications() {
  store.set('notifications', []);
}

function getSettings() {
  const s = store.get('settings', defaults.settings);
  return {
    theme: 'dark',
    notifications: s.notifications !== false,
    currency: 'BRL',
    passengerName: s.passengerName || 'Carlos Silveira',
    passengerDoc: s.passengerDoc || '284.912.840-12',
    passengerEmail: s.passengerEmail || 'carlos.silveira@grautam.com.br',
    passengerPhone: s.passengerPhone || '(11) 98765-4321',
    preferredAirline: s.preferredAirline || 'LATAM Airlines'
  };
}

function setSettings(value) {
  const current = getSettings();
  const next = { ...current, ...(value || {}) };
  store.set('settings', next);
  return next;
}

module.exports = {
  store,
  listBookings,
  saveBooking,
  cancelBooking,
  listTrips,
  saveTrip,
  deleteTrip,
  listNotifications,
  addNotification,
  clearNotifications,
  getSettings,
  setSettings
};
