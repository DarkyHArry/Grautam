// Serviço comercial de voos e passagens aéreas Grautam
const AIRPORTS = [
  { code: 'GRU', city: 'São Paulo', name: 'Aeroporto Internacional de Guarulhos', state: 'SP', country: 'Brasil' },
  { code: 'CGH', city: 'São Paulo', name: 'Aeroporto de Congonhas', state: 'SP', country: 'Brasil' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Aeroporto Internacional do Galeão', state: 'RJ', country: 'Brasil' },
  { code: 'SDU', city: 'Rio de Janeiro', name: 'Aeroporto Santos Dumont', state: 'RJ', country: 'Brasil' },
  { code: 'BSB', city: 'Brasília', name: 'Aeroporto Internacional Presidente Juscelino Kubitschek', state: 'DF', country: 'Brasil' },
  { code: 'SSA', city: 'Salvador', name: 'Aeroporto Internacional Dep. Luís Eduardo Magalhães', state: 'BA', country: 'Brasil' },
  { code: 'REC', city: 'Recife', name: 'Aeroporto Internacional dos Guararapes', state: 'PE', country: 'Brasil' },
  { code: 'FOR', city: 'Fortaleza', name: 'Aeroporto Internacional Pinto Martins', state: 'CE', country: 'Brasil' },
  { code: 'POA', city: 'Porto Alegre', name: 'Aeroporto Internacional Salgado Filho', state: 'RS', country: 'Brasil' },
  { code: 'CWB', city: 'Curitiba', name: 'Aeroporto Internacional Afonso Pena', state: 'PR', country: 'Brasil' },
  { code: 'CNF', city: 'Belo Horizonte', name: 'Aeroporto Internacional de Confins', state: 'MG', country: 'Brasil' },
  { code: 'FLN', city: 'Florianópolis', name: 'Aeroporto Internacional Hercílio Luz', state: 'SC', country: 'Brasil' },
  { code: 'MCZ', city: 'Maceió', name: 'Aeroporto Internacional Zumbi dos Palmares', state: 'AL', country: 'Brasil' },
  { code: 'NAT', city: 'Natal', name: 'Aeroporto Internacional Gov. Aluízio Alves', state: 'RN', country: 'Brasil' },
  { code: 'MAO', city: 'Manaus', name: 'Aeroporto Internacional Eduardo Gomes', state: 'AM', country: 'Brasil' },
  { code: 'BEL', city: 'Belém', name: 'Aeroporto Internacional de Val-de-Cans', state: 'PA', country: 'Brasil' },
  { code: 'FEN', city: 'Fernando de Noronha', name: 'Aeroporto Gov. Carlos Wilson', state: 'PE', country: 'Brasil' },
  { code: 'SCL', city: 'Santiago', name: 'Aeroporto Internacional Arturo Merino Benítez', state: 'RM', country: 'Chile' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Aeroporto Internacional Ministro Pistarini', state: 'BA', country: 'Argentina' },
  { code: 'MVD', city: 'Montevidéu', name: 'Aeroporto Internacional de Carrasco', state: 'MO', country: 'Uruguai' },
  { code: 'LIS', city: 'Lisboa', name: 'Aeroporto Humberto Delgado', state: 'LIS', country: 'Portugal' },
  { code: 'MAD', city: 'Madri', name: 'Aeroporto Adolfo Suárez Madrid-Barajas', state: 'MD', country: 'Espanha' },
  { code: 'CDG', city: 'Paris', name: 'Aeroporto de Paris-Charles de Gaulle', state: 'IDF', country: 'França' },
  { code: 'MIA', city: 'Miami', name: 'Miami International Airport', state: 'FL', country: 'Estados Unidos' },
  { code: 'JFK', city: 'Nova York', name: 'John F. Kennedy International Airport', state: 'NY', country: 'Estados Unidos' },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International Airport', state: 'FL', country: 'Estados Unidos' }
];

const AIRLINES = [
  { code: 'LA', name: 'LATAM Airlines', badge: 'LATAM', color: '#e61d2b', models: ['Airbus A320neo', 'Boeing 787-9 Dreamliner', 'Airbus A321'] },
  { code: 'G3', name: 'GOL Linhas Aéreas', badge: 'GOL', color: '#ff7020', models: ['Boeing 737-800', 'Boeing 737 MAX 8'] },
  { code: 'AD', name: 'Azul Linhas Aéreas', badge: 'Azul', color: '#0084cb', models: ['Embraer E195-E2', 'Airbus A330-900neo', 'Airbus A320neo'] },
  { code: 'TP', name: 'TAP Air Portugal', badge: 'TAP', color: '#299238', models: ['Airbus A330neo', 'Airbus A321LR'] },
  { code: 'CM', name: 'Copa Airlines', badge: 'Copa', color: '#0c2340', models: ['Boeing 737 MAX 9', 'Boeing 737-800'] },
  { code: 'AA', name: 'American Airlines', badge: 'American', color: '#0078d2', models: ['Boeing 777-200ER', 'Boeing 787-8'] },
  { code: 'AF', name: 'Air France', badge: 'Air France', color: '#002157', models: ['Airbus A350-900', 'Boeing 777-300ER'] }
];

function findAirport(text) {
  if (!text) return null;
  const t = text.trim().toUpperCase();
  return AIRPORTS.find(a => a.code === t || a.city.toUpperCase().includes(t) || a.name.toUpperCase().includes(t)) || null;
}

function getAirports() {
  return AIRPORTS;
}

function calculateBaseFare(originCode, destinationCode) {
  const isInternational = ['LIS', 'MAD', 'CDG', 'MIA', 'JFK', 'MCO'].includes(originCode) || ['LIS', 'MAD', 'CDG', 'MIA', 'JFK', 'MCO'].includes(destinationCode);
  const isSouthAmerica = ['SCL', 'EZE', 'MVD'].includes(originCode) || ['SCL', 'EZE', 'MVD'].includes(destinationCode);
  if (isInternational) return 2380;
  if (isSouthAmerica) return 940;
  return 380;
}

function searchFlights({ origin = 'GRU', destination = 'GIG', date = '', passengers = 1, cabinClass = 'economy', directOnly = false, airline = 'all' }) {
  const orig = findAirport(origin) || AIRPORTS[0];
  const dest = findAirport(destination) || AIRPORTS[2];
  const pax = Math.max(1, Math.min(9, Number(passengers) || 1));
  const baseFare = calculateBaseFare(orig.code, dest.code);

  const schedules = [
    { dep: '06:15', arr: '07:25', duration: '1h 10m', stops: 0, codeSuffix: '3012', airline: 'LA' },
    { dep: '08:40', arr: '09:50', duration: '1h 10m', stops: 0, codeSuffix: '1420', airline: 'G3' },
    { dep: '11:20', arr: '12:35', duration: '1h 15m', stops: 0, codeSuffix: '4198', airline: 'AD' },
    { dep: '13:50', arr: '16:45', duration: '2h 55m', stops: 1, stopCity: 'BSB', codeSuffix: '3204', airline: 'LA' },
    { dep: '15:10', arr: '16:20', duration: '1h 10m', stops: 0, codeSuffix: '1850', airline: 'G3' },
    { dep: '17:35', arr: '18:50', duration: '1h 15m', stops: 0, codeSuffix: '4882', airline: 'AD' },
    { dep: '19:40', arr: '22:15', duration: '2h 35m', stops: 1, stopCity: 'CNF', codeSuffix: '2904', airline: 'G3' },
    { dep: '21:15', arr: '22:25', duration: '1h 10m', stops: 0, codeSuffix: '3940', airline: 'LA' }
  ];

  // Se for internacional, ajusta horários e companhias
  const isInter = ['LIS', 'MAD', 'CDG', 'MIA', 'JFK', 'MCO'].includes(dest.code);
  const flightTemplates = isInter ? [
    { dep: '18:20', arr: '07:15', duration: '9h 55m', stops: 0, codeSuffix: '082', airline: 'TP' },
    { dep: '20:45', arr: '09:30', duration: '9h 45m', stops: 0, codeSuffix: '8060', airline: 'LA' },
    { dep: '21:30', arr: '06:10', duration: '8h 40m', stops: 0, codeSuffix: '904', airline: 'AA' },
    { dep: '22:50', arr: '13:40', duration: '11h 50m', stops: 1, stopCity: 'LIS', codeSuffix: '442', airline: 'AF' }
  ] : schedules;

  let results = flightTemplates.map((s, idx) => {
    const al = AIRLINES.find(a => a.code === s.airline) || AIRLINES[0];
    const aircraft = al.models[idx % al.models.length];
    
    // Variação de tarifa por horário e companhia
    const multiplier = s.stops === 0 ? 1.08 : 0.88;
    const timeFactor = (idx === 0 || idx === 7) ? 0.92 : (idx === 1 || idx === 5) ? 1.15 : 1.0;
    const classMultiplier = cabinClass === 'business' ? 2.8 : cabinClass === 'premium' ? 1.45 : 1.0;
    
    const pricePerPax = Math.round(baseFare * multiplier * timeFactor * classMultiplier);
    const totalPrice = pricePerPax * pax;
    const installments = Math.min(12, Math.max(1, Math.floor(totalPrice / 50)));
    const installmentValue = Math.round((totalPrice / installments) * 100) / 100;
    
    const seatsRemaining = 2 + ((idx * 3 + pax) % 7);
    const flightNumber = `${al.code} ${s.codeSuffix}`;

    return {
      id: `fl_${s.codeSuffix}_${Date.now()}_${idx}`,
      flightNumber,
      airline: al.name,
      airlineCode: al.code,
      airlineBadge: al.badge,
      origin: {
        code: orig.code,
        city: orig.city,
        name: orig.name,
        terminal: orig.code === 'GRU' ? 'Terminal 3' : 'Terminal 1'
      },
      destination: {
        code: dest.code,
        city: dest.city,
        name: dest.name,
        terminal: dest.code === 'GIG' ? 'Terminal 2' : 'Terminal 1'
      },
      departureTime: s.dep,
      arrivalTime: s.arr,
      duration: s.duration,
      stops: s.stops,
      stopDetails: s.stops > 0 ? `1 escala em ${s.stopCity || 'BSB'}` : 'Voo direto',
      aircraft,
      cabinClass: cabinClass === 'business' ? 'Executiva' : cabinClass === 'premium' ? 'Premium Economy' : 'Econômica',
      baggage: cabinClass === 'business' ? '2x Despachada (23kg) + Mala de mão (10kg)' : '1x Mala de mão (10kg) inclusa',
      seatsRemaining,
      pricePerPassenger: pricePerPax,
      totalPrice,
      installments,
      installmentValue,
      pixPrice: Math.round(totalPrice * 0.95), // 5% de desconto no PIX
      date: date || new Date().toISOString().slice(0, 10)
    };
  });

  if (directOnly) {
    results = results.filter(f => f.stops === 0);
  }

  if (airline && airline !== 'all') {
    results = results.filter(f => f.airline.toLowerCase().includes(airline.toLowerCase()) || f.airlineCode.toLowerCase() === airline.toLowerCase());
  }

  return results;
}

function getDeals() {
  return [
    {
      id: 'deal-1',
      origin: 'São Paulo (GRU)',
      destination: 'Rio de Janeiro (GIG)',
      destCode: 'GIG',
      destCity: 'Rio de Janeiro',
      airline: 'LATAM Airlines',
      badge: 'LATAM',
      price: 219,
      regularPrice: 349,
      discount: '37% OFF',
      tag: 'Mais vendido',
      type: 'Nacional',
      dates: 'Novembro a Março'
    },
    {
      id: 'deal-2',
      origin: 'São Paulo (GRU)',
      destination: 'Salvador (SSA)',
      destCode: 'SSA',
      destCity: 'Salvador',
      airline: 'GOL Linhas Aéreas',
      badge: 'GOL',
      price: 369,
      regularPrice: 590,
      discount: '37% OFF',
      tag: 'Praia & Sol',
      type: 'Nacional',
      dates: 'Dezembro a Fevereiro'
    },
    {
      id: 'deal-3',
      origin: 'São Paulo (GRU)',
      destination: 'Fernando de Noronha (FEN)',
      destCode: 'FEN',
      destCity: 'Fernando de Noronha',
      airline: 'Azul Linhas Aéreas',
      badge: 'Azul',
      price: 689,
      regularPrice: 1120,
      discount: '38% OFF',
      tag: 'Super Oferta',
      type: 'Paraíso',
      dates: 'Fevereiro a Maio'
    },
    {
      id: 'deal-4',
      origin: 'São Paulo (GRU)',
      destination: 'Buenos Aires (EZE)',
      destCode: 'EZE',
      destCity: 'Buenos Aires',
      airline: 'LATAM Airlines',
      badge: 'LATAM',
      price: 840,
      regularPrice: 1390,
      discount: '39% OFF',
      tag: 'América do Sul',
      type: 'Internacional',
      dates: 'Novembro a Abril'
    },
    {
      id: 'deal-5',
      origin: 'São Paulo (GRU)',
      destination: 'Lisboa (LIS)',
      destCode: 'LIS',
      destCity: 'Lisboa',
      airline: 'TAP Air Portugal',
      badge: 'TAP',
      price: 2490,
      regularPrice: 3890,
      discount: '35% OFF',
      tag: 'Europa Sem Escalas',
      type: 'Internacional',
      dates: 'Março a Junho'
    },
    {
      id: 'deal-6',
      origin: 'São Paulo (GRU)',
      destination: 'Miami (MIA)',
      destCode: 'MIA',
      destCity: 'Miami',
      airline: 'American Airlines',
      badge: 'American',
      price: 2680,
      regularPrice: 4100,
      discount: '34% OFF',
      tag: 'EUA Promocional',
      type: 'Internacional',
      dates: 'Fevereiro a Maio'
    }
  ];
}

function getFlightStatus(flightNumberOrRoute) {
  const query = String(flightNumberOrRoute || '').trim().toUpperCase();
  const statuses = [
    { flight: 'LA 3012', airline: 'LATAM', route: 'GRU → GIG', schedDep: '06:15', status: 'Decolado', gate: 'B12', terminal: 'T3', remark: 'No horário' },
    { flight: 'G3 1420', airline: 'GOL', route: 'GRU → GIG', schedDep: '08:40', status: 'Embarque Próximo', gate: 'A04', terminal: 'T2', remark: 'Portão A04' },
    { flight: 'AD 4198', airline: 'Azul', route: 'VCP → SDU', schedDep: '11:20', status: 'Programado', gate: 'C18', terminal: 'T1', remark: 'Aguardando' },
    { flight: 'TP 082', airline: 'TAP', route: 'GRU → LIS', schedDep: '18:20', status: 'Check-in Aberto', gate: 'D02', terminal: 'T3', remark: 'Internacional' },
    { flight: 'LA 8060', airline: 'LATAM', route: 'GRU → MIA', schedDep: '20:45', status: 'Programado', gate: 'B22', terminal: 'T3', remark: 'No horário' }
  ];

  if (!query) return statuses;
  return statuses.filter(s => s.flight.includes(query) || s.route.includes(query) || s.airline.toUpperCase().includes(query));
}

module.exports = {
  AIRPORTS,
  AIRLINES,
  getAirports,
  searchFlights,
  getDeals,
  getFlightStatus
};
