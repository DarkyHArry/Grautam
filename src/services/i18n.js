// Sistema de Internacionalização (i18n) - Grautam Viagens
const DICTIONARIES = {
  'pt-BR': {
    appName: 'Grautam Linhas Aéreas',
    tagline: 'Sistema de Passagens Aéreas',
    searchFlights: 'Buscar Passagens',
    myBookings: 'Minhas Reservas',
    dailyDeals: 'Ofertas do Dia',
    flightStatus: 'Status de Voos',
    supportCenter: 'Central de Ajuda',
    notifications: 'Notificações',
    roundTrip: 'Ida e Volta',
    oneWay: 'Somente Ida',
    origin: 'Origem',
    destination: 'Destino',
    departureDate: 'Data de Ida',
    returnDate: 'Data de Volta',
    passengers: 'Passageiros',
    cabinClass: 'Classe de Cabine',
    economy: 'Econômica',
    premiumEconomy: 'Premium Economy',
    business: 'Executiva',
    searchButton: 'Buscar Voos',
    availableFlights: 'Voos Disponíveis',
    directFlight: 'Voo direto',
    stops: 'escala(s)',
    perPassenger: 'Por passageiro',
    totalEstimated: 'Total',
    selectFlight: 'Selecionar Voo',
    seatMap: 'Mapa de Assentos',
    passengerDetails: 'Dados do Passageiro',
    fullName: 'Nome Completo',
    document: 'CPF / Passaporte',
    email: 'E-mail',
    phone: 'Telefone',
    extraBaggage: 'Bagagem Despachada (23kg)',
    travelInsurance: 'Seguro Viagem Proteção Total',
    paymentMethod: 'Forma de Pagamento',
    pixDiscount: 'PIX (5% de desconto)',
    creditCard: 'Cartão de Crédito',
    bankSlip: 'Boleto Bancário',
    issueTicket: 'Emitir Bilhete Eletrônico',
    boardingPass: 'Cartão de Embarque',
    locatorPnr: 'Localizador (PNR)',
    eticketNo: 'Bilhete Eletrônico',
    gate: 'Portão',
    terminal: 'Terminal',
    seat: 'Assento',
    statusConfirmed: 'CONFIRMADO',
    statusCanceled: 'CANCELADO',
    printTicket: 'Imprimir Bilhete',
    cancelBooking: 'Cancelar Reserva'
  },
  'en-US': {
    appName: 'Grautam Airlines',
    tagline: 'Flight Booking System',
    searchFlights: 'Search Flights',
    myBookings: 'My Bookings',
    dailyDeals: 'Daily Deals',
    flightStatus: 'Flight Status',
    supportCenter: 'Help Center',
    notifications: 'Notifications',
    roundTrip: 'Round Trip',
    oneWay: 'One Way',
    origin: 'Origin',
    destination: 'Destination',
    departureDate: 'Departure Date',
    returnDate: 'Return Date',
    passengers: 'Passengers',
    cabinClass: 'Cabin Class',
    economy: 'Economy',
    premiumEconomy: 'Premium Economy',
    business: 'Business Class',
    searchButton: 'Search Flights',
    availableFlights: 'Available Flights',
    directFlight: 'Direct flight',
    stops: 'stop(s)',
    perPassenger: 'Per passenger',
    totalEstimated: 'Total',
    selectFlight: 'Select Flight',
    seatMap: 'Seat Map',
    passengerDetails: 'Passenger Information',
    fullName: 'Full Name',
    document: 'ID / Passport',
    email: 'Email',
    phone: 'Phone',
    extraBaggage: 'Checked Baggage (23kg)',
    travelInsurance: 'Full Protection Travel Insurance',
    paymentMethod: 'Payment Method',
    pixDiscount: 'Instant Transfer (5% off)',
    creditCard: 'Credit Card',
    bankSlip: 'Bank Slip',
    issueTicket: 'Issue E-Ticket',
    boardingPass: 'Boarding Pass',
    locatorPnr: 'Booking Reference (PNR)',
    eticketNo: 'Electronic Ticket',
    gate: 'Gate',
    terminal: 'Terminal',
    seat: 'Seat',
    statusConfirmed: 'CONFIRMED',
    statusCanceled: 'CANCELED',
    printTicket: 'Print Ticket',
    cancelBooking: 'Cancel Booking'
  },
  'es-ES': {
    appName: 'Grautam Líneas Aéreas',
    tagline: 'Sistema de Venta de Billetes',
    searchFlights: 'Buscar Vuelos',
    myBookings: 'Mis Reservas',
    dailyDeals: 'Ofertas del Día',
    flightStatus: 'Estado de Vuelos',
    supportCenter: 'Centro de Ayuda',
    notifications: 'Notificaciones',
    roundTrip: 'Ida y Vuelta',
    oneWay: 'Solo Ida',
    origin: 'Origen',
    destination: 'Destino',
    departureDate: 'Fecha de Salida',
    returnDate: 'Fecha de Regreso',
    passengers: 'Pasajeros',
    cabinClass: 'Clase de Cabina',
    economy: 'Turista',
    premiumEconomy: 'Turista Premium',
    business: 'Business',
    searchButton: 'Buscar Vuelos',
    availableFlights: 'Vuelos Disponibles',
    directFlight: 'Vuelo directo',
    stops: 'escala(s)',
    perPassenger: 'Por pasajero',
    totalEstimated: 'Total',
    selectFlight: 'Seleccionar Vuelo',
    seatMap: 'Mapa de Asientos',
    passengerDetails: 'Datos del Pasajero',
    fullName: 'Nombre Completo',
    document: 'DNI / Pasaporte',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    extraBaggage: 'Equipaje Facturado (23kg)',
    travelInsurance: 'Seguro de Viaje Cobertura Total',
    paymentMethod: 'Método de Pago',
    pixDiscount: 'Pago Inmediato (5% desc.)',
    creditCard: 'Tarjeta de Crédito',
    bankSlip: 'Transferencia Bancaria',
    issueTicket: 'Emitir Billete Electrónico',
    boardingPass: 'Tarjeta de Embarque',
    locatorPnr: 'Código Localizador (PNR)',
    eticketNo: 'Billete Electrónico',
    gate: 'Puerta',
    terminal: 'Terminal',
    seat: 'Asiento',
    statusConfirmed: 'CONFIRMADO',
    statusCanceled: 'CANCELADO',
    printTicket: 'Imprimir Billete',
    cancelBooking: 'Cancelar Reserva'
  }
};

let currentLocale = 'pt-BR';

function setLocale(locale) {
  if (DICTIONARIES[locale]) {
    currentLocale = locale;
  }
  return currentLocale;
}

function getLocale() {
  return currentLocale;
}

function t(key) {
  const dict = DICTIONARIES[currentLocale] || DICTIONARIES['pt-BR'];
  return dict[key] || DICTIONARIES['pt-BR'][key] || key;
}

function getAvailableLocales() {
  return [
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
  ];
}

module.exports = {
  DICTIONARIES,
  setLocale,
  getLocale,
  getAvailableLocales,
  t
};

