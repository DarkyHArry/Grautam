// Grautam Viagens — Lógica da Interface Comercial (Claude Code Style)
const api = window.grautam;

// Utility functions
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const escapeHtml = str => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let currentCurrency = 'BRL';

let CURRENCY_RATES = {
  BRL: 1.0,
  USD: 5.48,
  EUR: 6.12
};

const CURRENCY_LOCALES = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE'
};

function formatCurrency(valInBrl, currency = currentCurrency) {
  const rate = CURRENCY_RATES[currency] || 1.0;
  const converted = (Number(valInBrl) || 0) / rate;
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] || 'pt-BR', {
    style: 'currency',
    currency: currency
  }).format(converted);
}

async function syncLiveCurrencyRates(silent = true) {
  try {
    const res = await api.request('currency:rates');
    if (res && res.rates) {
      if (res.rates.USD) CURRENCY_RATES.USD = res.rates.USD;
      if (res.rates.EUR) CURRENCY_RATES.EUR = res.rates.EUR;
      
      if (!silent) {
        showToast(`Taxas atualizadas: 1 USD = R$ ${CURRENCY_RATES.USD.toFixed(2)} · 1 EUR = R$ ${CURRENCY_RATES.EUR.toFixed(2)}`, 'bi-arrow-repeat');
      }
      
      const lbl = $('#qnavCurrencyLabel');
      if (lbl) lbl.textContent = `USD R$ ${CURRENCY_RATES.USD.toFixed(2)}`;

      renderFlightResults(activeSearchResults);
      loadDeals();
      loadBookings();
      updateSimAmountUI();
    }
  } catch (err) {
    console.warn('Falha ao sincronizar taxas de câmbio:', err);
  }
}

const formatBRL = val => formatCurrency(val);

const WEATHER_DATA = {
  GIG: { temp: '29°C', condition: 'Ensolarado', icon: 'bi-sun' },
  SDU: { temp: '28°C', condition: 'Ensolarado', icon: 'bi-sun' },
  GRU: { temp: '22°C', condition: 'Nublado', icon: 'bi-cloud-sun' },
  BSB: { temp: '26°C', condition: 'Céu Aberto', icon: 'bi-sun' },
  SSA: { temp: '31°C', condition: 'Sol e Praia', icon: 'bi-sun' },
  FEN: { temp: '30°C', condition: 'Sol Forte', icon: 'bi-brightness-high' },
  LIS: { temp: '19°C', condition: 'Ameno', icon: 'bi-cloud-sun' },
  MIA: { temp: '32°C', condition: 'Tropical', icon: 'bi-sun' }
};

function getWeatherSnippet(destCode) {
  const w = WEATHER_DATA[destCode] || { temp: '25°C', condition: 'Estável', icon: 'bi-sun' };
  return `<span style="display: inline-flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--claude-accent); margin-top: 3px;"><i class="bi ${w.icon}"></i> ${w.temp} · ${w.condition}</span>`;
}
let currentTab = 'search';
let activeSearchResults = [];
let selectedFlightForCheckout = null;
let currentSelectedSeat = '12A';
let currentPaymentMethod = 'PIX';
let currentAirlineFilter = 'all';
let currentTimeFilter = 'all';
let filterDirectOnlyActive = false;
let userSettings = {};

// ==========================================================================
// TOAST NOTIFICATIONS (CLAUDE CODE AESTHETIC)
// ==========================================================================
function showToast(message, icon = 'bi-info-circle') {
  const host = $('#toastHost');
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'claude-toast';
  toast.innerHTML = `<i class="bi ${icon}" style="color: var(--claude-accent); font-size: 15px;"></i><span>${escapeHtml(message)}</span>`;
  host.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 4200);
}

// ==========================================================================
// NAVIGATION (SPA TABS SWITCHER)
// ==========================================================================
function switchTab(tabId) {
  currentTab = tabId;

  // Update sidebar buttons
  $$('.nav-item[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update views
  $$('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `view-${tabId}`);
  });

  // Update Breadcrumbs
  const tabNames = {
    search: 'Buscar Passagens',
    bookings: 'Minhas Reservas',
    deals: 'Ofertas do Dia',
    miles: 'Grautam Miles',
    tracker: 'Status de Voos',
    radar: 'Radar Ao Vivo (ADS-B)',
    support: 'Central de Ajuda'
  };

  const title = tabNames[tabId] || 'Grautam';
  const tbEl = $('#titlebarCurrentView');
  const bcEl = $('#breadcrumbCurrentView');
  if (tbEl) tbEl.textContent = title;
  if (bcEl) bcEl.textContent = title;

  // Tab-specific refreshes
  if (tabId === 'bookings') loadBookings();
  if (tabId === 'deals') loadDeals();
  if (tabId === 'tracker') loadFlightTracker();
  if (tabId === 'radar') {
    loadRadarFlights();
    startRadarAutoRefresh();
  } else {
    stopRadarAutoRefresh();
  }
}

// ==========================================================================
// SEARCH & FLIGHT RESULTS
// ==========================================================================
async function performFlightSearch() {
  const origin = $('#searchOriginInput').value.trim();
  const destination = $('#searchDestinationInput').value.trim();
  const date = $('#searchDateDep').value;
  const passengers = Number($('#searchPaxSelect').value);
  const cabinClass = $('#searchCabinSelect').value;

  if (!origin || !destination) {
    showToast('Informe origem e destino.', 'bi-exclamation-triangle');
    return;
  }

  if (origin.toUpperCase() === destination.toUpperCase()) {
    showToast('A origem e o destino devem ser diferentes.', 'bi-exclamation-triangle');
    return;
  }

  const resultsContainer = $('#flightResultsList');
  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px;">
      <i class="bi bi-arrow-repeat spin" style="font-size: 20px; display: block; margin-bottom: 8px; color: var(--claude-accent);"></i>
      Pesquisando tarifas em tempo real nas companhias aéreas...
    </div>
  `;

  try {
    const results = await api.request('flights:search', {
      origin,
      destination,
      date,
      passengers,
      cabinClass,
      directOnly: filterDirectOnlyActive,
      airline: currentAirlineFilter
    });

    activeSearchResults = results;
    renderFlightResults(results);

    $('#resultsHeaderTitle').textContent = `Voos Disponíveis (${origin.split('(')[0].trim()} → ${destination.split('(')[0].trim()})`;
    $('#resultsHeaderSubtitle').textContent = `${results.length} voos encontrados para ${passengers} passageiro(s) em ${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}`;
  } catch (error) {
    resultsContainer.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--status-crimson); font-size: 12px;">${escapeHtml(error.message)}</div>`;
  }
}

function renderFlightResults(flights) {
  const container = $('#flightResultsList');
  if (!container) return;

  let filtered = flights;
  if (currentAirlineFilter !== 'all') {
    filtered = filtered.filter(f => f.airline.includes(currentAirlineFilter) || f.airlineBadge === currentAirlineFilter);
  }
  if (filterDirectOnlyActive) {
    filtered = filtered.filter(f => f.stops === 0);
  }
  if (currentTimeFilter !== 'all') {
    filtered = filtered.filter(f => {
      const hour = parseInt(f.departureTime.split(':')[0], 10);
      if (currentTimeFilter === 'morning') return hour >= 6 && hour < 12;
      if (currentTimeFilter === 'afternoon') return hour >= 12 && hour < 18;
      if (currentTimeFilter === 'night') return hour >= 18 || hour < 6;
      return true;
    });
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 12px; color: var(--text-muted);">
        <i class="bi bi-airplane" style="font-size: 28px; display: block; margin-bottom: 8px;"></i>
        <b style="color: var(--text-secondary); font-size: 13px;">Nenhum voo encontrado com os filtros atuais</b>
        <p style="font-size: 11px; margin: 4px 0 0;">Tente remover o filtro de conexões ou escolher outra companhia aérea.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(flight => `
    <div class="flight-card" data-flight-id="${flight.id}">
      <!-- Coluna da Companhia -->
      <div class="flight-airline-col">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="stops-badge" style="background-color: var(--bg-input); border-color: var(--border-medium); color: var(--claude-accent); font-weight: 700;">
            ${escapeHtml(flight.airlineBadge)}
          </span>
          <span class="flight-airline-name">${escapeHtml(flight.airline)}</span>
        </div>
        <span class="flight-number-tag">${escapeHtml(flight.flightNumber)}</span>
        <span class="aircraft-type-tag"><i class="bi bi-airplane-engines"></i> ${escapeHtml(flight.aircraft)}</span>
        <span style="font-size: 10px; color: var(--text-muted); margin-top: 2px;"><i class="bi bi-bag"></i> ${escapeHtml(flight.baggage)}</span>
      </div>

      <!-- Coluna de Horários e Duração -->
      <div class="flight-schedule-col">
        <div class="time-point">
          <span class="time-val">${escapeHtml(flight.departureTime)}</span>
          <span class="airport-code">${escapeHtml(flight.origin.code)}</span>
          <span class="airport-city">${escapeHtml(flight.origin.city)}</span>
        </div>

        <div class="route-duration-center">
          <span class="duration-label">${escapeHtml(flight.duration)}</span>
          <div class="flight-line">
            <i class="bi bi-airplane-fill"></i>
          </div>
          <span class="stops-badge ${flight.stops > 0 ? 'has-stops' : ''}">
            ${escapeHtml(flight.stopDetails)}
          </span>
        </div>

        <div class="time-point" style="align-items: flex-end;">
          <span class="time-val">${escapeHtml(flight.arrivalTime)}</span>
          <span class="airport-code">${escapeHtml(flight.destination.code)}</span>
          <span class="airport-city">${escapeHtml(flight.destination.city)}</span>
          ${getWeatherSnippet(flight.destination.code)}
        </div>
      </div>

      <!-- Coluna de Preço e Seleção -->
      <div class="flight-price-col">
        <span class="pix-badge"><i class="bi bi-qr-code"></i> PIX: ${formatBRL(flight.pixPrice)}</span>
        <span class="price-sub">Por passageiro</span>
        <span class="price-val">${formatBRL(flight.pricePerPassenger)}</span>
        <span class="installments-text">Total ${formatBRL(flight.totalPrice)} em até ${flight.installments}x</span>
        <button type="button" class="btn-select-flight select-flight-action" data-id="${flight.id}">
          Selecionar Voo <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Event Listeners for Select Flight
  container.querySelectorAll('.select-flight-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const flightId = btn.dataset.id;
      const flight = activeSearchResults.find(f => f.id === flightId);
      if (flight) {
        openCheckoutModal(flight);
      }
    });
  });
}

// ==========================================================================
// SEAT MAP GENERATION & CHECKOUT MODAL
// ==========================================================================
function renderSeatMap(selectedSeat = '12A') {
  const grid = $('#seatMapGrid');
  if (!grid) return;

  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15];
  const occupiedSeats = new Set(['1A', '2B', '3F', '5C', '7A', '8D', '10F', '11B', '14C']);

  let html = '';
  rows.forEach(r => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    letters.slice(0, 3).forEach(l => {
      const s = `${r}${l}`;
      const isOcc = occupiedSeats.has(s);
      const isSel = s === selectedSeat;
      html += `<div class="seat-box ${isOcc ? 'occupied' : ''} ${isSel ? 'selected' : ''}" data-seat="${s}">${s}</div>`;
    });

    html += `<div class="aisle-space">${r}</div>`;

    letters.slice(3, 6).forEach(l => {
      const s = `${r}${l}`;
      const isOcc = occupiedSeats.has(s);
      const isSel = s === selectedSeat;
      html += `<div class="seat-box ${isOcc ? 'occupied' : ''} ${isSel ? 'selected' : ''}" data-seat="${s}">${s}</div>`;
    });
  });

  grid.innerHTML = html;

  grid.querySelectorAll('.seat-box:not(.occupied)').forEach(box => {
    box.addEventListener('click', () => {
      grid.querySelectorAll('.seat-box').forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');
      currentSelectedSeat = box.dataset.seat;
      const isWindow = ['A', 'F'].includes(currentSelectedSeat.slice(-1));
      const isAisle = ['C', 'D'].includes(currentSelectedSeat.slice(-1));
      const type = isWindow ? 'Janela' : isAisle ? 'Corredor' : 'Meio';
      $('#selectedSeatLabel').textContent = `${currentSelectedSeat} (${type})`;
    });
  });
}

function openCheckoutModal(flight) {
  selectedFlightForCheckout = flight;
  currentSelectedSeat = '12A';
  currentPaymentMethod = 'PIX';

  // Fill Flight Summary
  $('#checkoutFlightSummary').innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <b style="font-size: 13px; color: var(--text-primary);">${escapeHtml(flight.airline)} · ${escapeHtml(flight.flightNumber)}</b>
        <div style="font-family: var(--font-mono); font-size: 11px; color: var(--claude-accent); margin-top: 2px;">
          ${escapeHtml(flight.origin.code)} → ${escapeHtml(flight.destination.code)} · ${escapeHtml(flight.cabinClass)}
        </div>
      </div>
      <div style="text-align: right;">
        <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);">${escapeHtml(flight.date)}</span>
        <b style="display: block; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);">${escapeHtml(flight.departureTime)} - ${escapeHtml(flight.arrivalTime)}</b>
      </div>
    </div>
  `;

  // Pre-fill passenger inputs from settings
  $('#chkPaxName').value = userSettings.passengerName || 'Carlos Silveira';
  $('#chkPaxDoc').value = userSettings.passengerDoc || '284.912.840-12';
  $('#chkPaxEmail').value = userSettings.passengerEmail || 'carlos.silveira@grautam.com.br';
  $('#chkPaxPhone').value = userSettings.passengerPhone || '(11) 98765-4321';

  // Uncheck extras
  $('#extraBaggage').checked = false;
  $('#extraInsurance').checked = false;

  // Render Seat Map
  renderSeatMap('12A');
  $('#selectedSeatLabel').textContent = '12A (Janela)';

  // Payment Tabs state
  $$('.payment-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.payment === 'PIX'));
  $('#pixPaymentBox').style.display = 'flex';
  $('#cardPaymentBox').style.display = 'none';
  $('#boletoPaymentBox').style.display = 'none';

  updateCheckoutTotal();
  $('#checkoutModal').classList.add('show');
}

function updateCheckoutTotal() {
  if (!selectedFlightForCheckout) return;

  let total = selectedFlightForCheckout.totalPrice;
  if ($('#extraBaggage').checked) total += 110.0;
  if ($('#extraInsurance').checked) total += 49.90;

  if (currentPaymentMethod === 'PIX') {
    total = total * 0.95; // 5% de desconto no PIX
  }

  $('#checkoutFinalTotal').textContent = formatBRL(total);

  // Update card installments option values
  const select = $('#cardInstallmentsSelect');
  if (select) {
    select.innerHTML = `
      <option value="1">1x de ${formatBRL(total)} à vista sem juros</option>
      <option value="3">3x de ${formatBRL(total / 3)} sem juros</option>
      <option value="6">6x de ${formatBRL(total / 6)} sem juros</option>
      <option value="10">10x de ${formatBRL(total / 10)} sem juros</option>
      <option value="12">12x de ${formatBRL(total / 12)} sem juros</option>
    `;
  }
}

// Payment Methods toggle
$$('.payment-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.payment-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPaymentMethod = btn.dataset.payment;

    $('#pixPaymentBox').style.display = currentPaymentMethod === 'PIX' ? 'flex' : 'none';
    $('#cardPaymentBox').style.display = currentPaymentMethod === 'Cartão de Crédito' ? 'block' : 'none';
    $('#boletoPaymentBox').style.display = currentPaymentMethod === 'Boleto' ? 'block' : 'none';

    updateCheckoutTotal();
  });
});

$('#extraBaggage').addEventListener('change', updateCheckoutTotal);
$('#extraInsurance').addEventListener('change', updateCheckoutTotal);

$('#closeCheckoutModal').addEventListener('click', () => {
  $('#checkoutModal').classList.remove('show');
});

$('#btnCopyPix').addEventListener('click', () => {
  showToast('Chave PIX copiada para a área de transferência!', 'bi-clipboard-check');
});

$('#btnOpenSimFromCheckout')?.addEventListener('click', () => {
  const currentTotal = selectedFlightForCheckout?.totalPrice || 389.00;
  openPaymentSimulator(currentTotal);
});

// Confirm Ticket Emission
$('#btnConfirmEmission').addEventListener('click', async () => {
  if (!selectedFlightForCheckout) return;

  const paxName = $('#chkPaxName').value.trim();
  const paxDoc = $('#chkPaxDoc').value.trim();
  const paxEmail = $('#chkPaxEmail').value.trim();
  const paxPhone = $('#chkPaxPhone').value.trim();

  if (!paxName || !paxDoc || !paxEmail) {
    showToast('Preencha os dados do passageiro.', 'bi-exclamation-triangle');
    return;
  }

  let finalPrice = selectedFlightForCheckout.totalPrice;
  const extras = [];
  if ($('#extraBaggage').checked) {
    finalPrice += 110;
    extras.push('Bagagem despachada (23kg)');
  }
  if ($('#extraInsurance').checked) {
    finalPrice += 49.90;
    extras.push('Seguro Viagem Proteção Total');
  }
  if (currentPaymentMethod === 'PIX') {
    finalPrice = finalPrice * 0.95;
  }

  const bookingPayload = {
    flightNumber: selectedFlightForCheckout.flightNumber,
    airline: selectedFlightForCheckout.airline,
    origin: `${selectedFlightForCheckout.origin.city} (${selectedFlightForCheckout.origin.code})`,
    originCode: selectedFlightForCheckout.origin.code,
    originCity: selectedFlightForCheckout.origin.city,
    originTerminal: selectedFlightForCheckout.origin.terminal,
    destination: `${selectedFlightForCheckout.destination.city} (${selectedFlightForCheckout.destination.code})`,
    destinationCode: selectedFlightForCheckout.destination.code,
    destinationCity: selectedFlightForCheckout.destination.city,
    destinationTerminal: selectedFlightForCheckout.destination.terminal,
    date: selectedFlightForCheckout.date,
    departureTime: selectedFlightForCheckout.departureTime,
    arrivalTime: selectedFlightForCheckout.arrivalTime,
    duration: selectedFlightForCheckout.duration,
    cabinClass: selectedFlightForCheckout.cabinClass,
    seat: currentSelectedSeat,
    gate: `B${Math.floor(10 + Math.random() * 15)}`,
    baggage: selectedFlightForCheckout.baggage,
    extras,
    passengers: [
      {
        name: paxName,
        document: paxDoc,
        seat: currentSelectedSeat
      }
    ],
    paymentMethod: currentPaymentMethod,
    installments: currentPaymentMethod === 'Cartão de Crédito' ? $('#cardInstallmentsSelect').value + 'x' : '1x',
    total: finalPrice
  };

  try {
    const issuedBooking = await api.request('bookings:create', bookingPayload);
    $('#checkoutModal').classList.remove('show');
    showToast(`Bilhete Emitido! Localizador: ${issuedBooking.pnr}`, 'bi-check2-circle');

    // Update settings with passenger name if needed
    userSettings.passengerName = paxName;
    userSettings.passengerDoc = paxDoc;
    userSettings.passengerEmail = paxEmail;
    userSettings.passengerPhone = paxPhone;
    api.request('settings:set', userSettings).catch(() => {});

    // Open Boarding Pass Modal
    openBoardingPassModal(issuedBooking);

    // Refresh Bookings
    loadBookings();
    loadNotifications();
  } catch (err) {
    showToast(err.message || 'Erro ao emitir bilhete.', 'bi-x-circle');
  }
});

// ==========================================================================
// BOARDING PASS (CARTÃO DE EMBARQUE)
// ==========================================================================
let currentBoardingPassBooking = null;

function openBoardingPassModal(booking) {
  currentBoardingPassBooking = booking;
  $('#passAirlineName').textContent = booking.airline;
  $('#passPnr').textContent = booking.pnr;
  $('#passOriginCode').textContent = booking.originCode || 'GRU';
  $('#passOriginCity').textContent = booking.originCity || 'São Paulo';
  $('#passDestCode').textContent = booking.destinationCode || 'GIG';
  $('#passDestCity').textContent = booking.destinationCity || 'Rio de Janeiro';
  $('#passDuration').textContent = booking.duration || '1h 10m';
  $('#passPaxName').textContent = booking.passengers?.[0]?.name || 'Carlos Silveira';
  $('#passFlightNo').textContent = booking.flightNumber;
  $('#passDate').textContent = booking.date ? new Date(booking.date + 'T12:00:00').toLocaleDateString('pt-BR') : '--/--/----';
  $('#passTime').textContent = booking.departureTime;
  $('#passTerminal').textContent = booking.originTerminal || 'T3';
  $('#passGate').textContent = booking.gate || 'B12';
  $('#passSeat').textContent = booking.seat || '12A';
  $('#passClass').textContent = booking.cabinClass || 'Econômica';
  $('#passEticket').textContent = booking.eticket || '042-89210948';

  $('#boardingPassModal').classList.add('show');
}

$('#closeBoardingPassModal').addEventListener('click', () => {
  $('#boardingPassModal').classList.remove('show');
});

$('#btnClosePass').addEventListener('click', () => {
  $('#boardingPassModal').classList.remove('show');
});

$('#btnPrintTicket').addEventListener('click', () => {
  window.print();
});

$('#btnExportCalendar')?.addEventListener('click', async () => {
  if (!currentBoardingPassBooking) return;
  try {
    const icsContent = await api.request('calendar:export', currentBoardingPassBooking);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Voo_${currentBoardingPassBooking.pnr || 'Grautam'}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo de agenda (.ics) gerado com sucesso!', 'bi-calendar-check');
  } catch (err) {
    showToast(err.message, 'bi-x-circle');
  }
});

$('#closeReceiptModal')?.addEventListener('click', () => {
  $('#receiptModal').classList.remove('show');
});

$('#btnCloseReceipt')?.addEventListener('click', () => {
  $('#receiptModal').classList.remove('show');
});

$('#btnPrintReceipt')?.addEventListener('click', () => {
  window.print();
});

// ==========================================================================
// MY BOOKINGS & TICKETS LIST
// ==========================================================================
async function loadBookings() {
  const container = $('#myBookingsGrid');
  if (!container) return;

  try {
    const bookings = await api.request('bookings:list');
    $('#bookingsCountPill').textContent = String(bookings.length);

    if (!bookings.length) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 12px; color: var(--text-muted);">
          <i class="bi bi-ticket-perforated" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
          <b style="color: var(--text-secondary); font-size: 14px;">Você não possui passagens emitidas no momento</b>
          <p style="font-size: 11px; margin: 4px 0 16px;">Pesquise um destino na aba "Buscar Passagens" e conclua sua primeira reserva.</p>
          <button type="button" class="btn-search-flights" style="margin: 0 auto; width: auto; padding: 0 18px;" onclick="switchTab('search')">
            <i class="bi bi-search"></i> Pesquisar Voos
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = bookings.map(b => `
      <div class="booking-ticket-card">
        <div class="ticket-top-row">
          <span class="ticket-pnr">PNR: ${escapeHtml(b.pnr)}</span>
          <span class="ticket-status-pill ${b.status === 'CANCELADO' ? 'canceled' : ''}">${escapeHtml(b.status)}</span>
        </div>

        <div class="ticket-route">
          <span>${escapeHtml(b.originCode || b.origin)}</span>
          <i class="bi bi-arrow-right"></i>
          <span>${escapeHtml(b.destinationCode || b.destination)}</span>
        </div>

        <div class="ticket-details-grid">
          <div class="ticket-detail-item">
            <small>VOO</small>
            <b>${escapeHtml(b.flightNumber)}</b>
          </div>
          <div class="ticket-detail-item">
            <small>DATA</small>
            <b>${b.date ? new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}</b>
          </div>
          <div class="ticket-detail-item">
            <small>ASSENTO</small>
            <b>${escapeHtml(b.seat)}</b>
          </div>
          <div class="ticket-detail-item">
            <small>HORÁRIO</small>
            <b>${escapeHtml(b.departureTime)}</b>
          </div>
          <div class="ticket-detail-item">
            <small>PORTÃO</small>
            <b>${escapeHtml(b.gate)}</b>
          </div>
          <div class="ticket-detail-item">
            <small>VALOR</small>
            <b>${formatBRL(b.total)}</b>
          </div>
        </div>

        <div class="ticket-actions">
          <button type="button" class="btn-boarding-pass view-pass-btn" data-pnr="${b.pnr}">
            <i class="bi bi-qr-code"></i> Cartão de Embarque
          </button>
          <button type="button" class="btn-boarding-pass view-receipt-btn" data-pnr="${b.pnr}" title="Ver Recibo Fiscal">
            <i class="bi bi-file-earmark-text"></i> Recibo
          </button>
          ${b.status !== 'CANCELADO' ? `
            <button type="button" class="btn-cancel-ticket cancel-ticket-btn" data-id="${b.id}" title="Cancelar Reserva">
              <i class="bi bi-x-circle"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Event listeners
    container.querySelectorAll('.view-pass-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pnr = btn.dataset.pnr;
        const b = bookings.find(item => item.pnr === pnr);
        if (b) openBoardingPassModal(b);
      });
    });

    container.querySelectorAll('.view-receipt-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pnr = btn.dataset.pnr;
        const b = bookings.find(item => item.pnr === pnr);
        if (b) {
          const html = await api.request('receipt:html', b);
          $('#receiptModalBody').innerHTML = html;
          $('#receiptModal').classList.add('show');
        }
      });
    });

    container.querySelectorAll('.cancel-ticket-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Deseja realmente cancelar esta reserva? O valor será estornado conforme regras tarifárias.')) return;
        try {
          await api.request('bookings:cancel', { id: btn.dataset.id });
          showToast('Reserva cancelada com sucesso.', 'bi-check2-circle');
          loadBookings();
        } catch (err) {
          showToast(err.message, 'bi-x-circle');
        }
      });
    });

  } catch (err) {
    console.error(err);
  }
}

// ==========================================================================
// DEALS TAB (OFERTAS DO DIA)
// ==========================================================================
async function loadDeals() {
  const container = $('#dealsGrid');
  if (!container) return;

  try {
    const deals = await api.request('flights:deals');
    container.innerHTML = deals.map(deal => `
      <div class="deal-card">
        <div class="deal-top">
          <span class="deal-tag">${escapeHtml(deal.tag)}</span>
          <span class="deal-discount">${escapeHtml(deal.discount)}</span>
        </div>
        <h4 class="deal-destination">${escapeHtml(deal.destCity)}</h4>
        <span class="deal-route">${escapeHtml(deal.origin)} → ${escapeHtml(deal.destination)}</span>
        <span style="font-size: 10px; color: var(--text-muted);"><i class="bi bi-calendar3"></i> ${escapeHtml(deal.dates)}</span>

        <div class="deal-pricing">
          <div>
            <span class="deal-regular">${formatBRL(deal.regularPrice)}</span>
            <span class="deal-promo-price">${formatBRL(deal.price)}</span>
          </div>
          <button type="button" class="btn-book-deal book-deal-action" data-dest="${deal.destCity} (${deal.destCode})">
            Pesquisar Voo <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.book-deal-action').forEach(btn => {
      btn.addEventListener('click', () => {
        $('#searchDestinationInput').value = btn.dataset.dest;
        switchTab('search');
        performFlightSearch();
      });
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================================================================
// FLIGHT TRACKER
// ==========================================================================
async function loadFlightTracker() {
  const query = $('#trackerSearchInput')?.value || '';
  const tbody = $('#statusTableBody');
  if (!tbody) return;

  try {
    const items = await api.request('flights:status', { query });
    tbody.innerHTML = items.map(f => {
      const pillClass = f.status.includes('Decolado') ? 'departed' : f.status.includes('Embarque') ? 'boarding' : 'scheduled';
      return `
        <tr>
          <td><b style="font-family: var(--font-mono); color: var(--claude-accent);">${escapeHtml(f.flight)}</b></td>
          <td>${escapeHtml(f.airline)}</td>
          <td><b style="font-family: var(--font-mono);">${escapeHtml(f.route)}</b></td>
          <td><span style="font-family: var(--font-mono); font-weight: 600;">${escapeHtml(f.schedDep)}</span></td>
          <td><span style="font-family: var(--font-mono); font-size: 11px;">${escapeHtml(f.terminal)} / ${escapeHtml(f.gate)}</span></td>
          <td><span class="status-pill ${pillClass}">${escapeHtml(f.status)}</span></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

$('#trackerSearchInput')?.addEventListener('input', () => {
  loadFlightTracker();
});

// ==========================================================================
// SUPPORT & FAQ
// ==========================================================================
$$('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const ans = btn.nextElementSibling;
    const isVisible = ans.style.display !== 'none';
    ans.style.display = isVisible ? 'none' : 'block';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('bi-chevron-down', isVisible);
      icon.classList.toggle('bi-chevron-up', !isVisible);
    }
  });
});

$('#supportTicketForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  const email = $('#supportEmail').value.trim();
  const subject = $('#supportSubject').value.trim();
  const message = $('#supportMessage').value.trim();

  try {
    await api.request('support:send', { email, subject, message });
    showToast('Chamado registrado com sucesso!', 'bi-envelope-check');
    $('#supportTicketForm').reset();
  } catch (err) {
    showToast(err.message, 'bi-x-circle');
  }
});

// ==========================================================================
// NOTIFICATIONS POPOVER
// ==========================================================================
async function loadNotifications() {
  try {
    const notifs = await api.request('notifications:list');
    const badge = $('#topbarNotifBadge');
    const pill = $('#sidebarNotifPill');

    if (badge && pill) {
      if (notifs.length > 0) {
        badge.style.display = 'flex';
        badge.textContent = String(notifs.length);
        pill.textContent = String(notifs.length);
      } else {
        badge.style.display = 'none';
        pill.textContent = '0';
      }
    }

    const container = $('#notifListContainer');
    if (container) {
      if (!notifs.length) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 11px;">Nenhuma notificação por enquanto.</div>';
      } else {
        container.innerHTML = notifs.map(n => `
          <div class="notif-item">
            <b>${escapeHtml(n.title)}</b>
            <span>${escapeHtml(n.message)}</span>
            <time>${new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time>
          </div>
        `).join('');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function toggleNotifPopover() {
  $('#notifPopover').classList.toggle('show');
}

$('#topbarNotifBtn')?.addEventListener('click', toggleNotifPopover);
$('#sidebarNotifBtn')?.addEventListener('click', toggleNotifPopover);

$('#btnClearNotifs')?.addEventListener('click', async () => {
  await api.request('notifications:clear');
  loadNotifications();
  showToast('Notificações limpas.', 'bi-check2');
});

// Close popover when clicking outside
document.addEventListener('click', e => {
  const popover = $('#notifPopover');
  const topbarBtn = $('#topbarNotifBtn');
  const sidebarBtn = $('#sidebarNotifBtn');
  if (popover && !popover.contains(e.target) && !topbarBtn?.contains(e.target) && !sidebarBtn?.contains(e.target)) {
    popover.classList.remove('show');
  }
});

// Global Keyboard Shortcuts (Escape to close modals, Alt+1..4 for Quick Navigation)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    let closedAny = false;

    const simModal = $('#paymentSimulatorModal');
    if (simModal && simModal.classList.contains('open')) {
      closePaymentSimulator();
      closedAny = true;
    }

    const anacModal = $('#anacHelpModal');
    if (anacModal && anacModal.classList.contains('open')) {
      anacModal.classList.remove('open');
      closedAny = true;
    }

    const chkModal = $('#checkoutModal');
    if (chkModal && chkModal.classList.contains('show')) {
      chkModal.classList.remove('show');
      closedAny = true;
    }

    const passModal = $('#boardingPassModal');
    if (passModal && passModal.classList.contains('show')) {
      passModal.classList.remove('show');
      closedAny = true;
    }

    const recModal = $('#receiptModal');
    if (recModal && recModal.classList.contains('show')) {
      recModal.classList.remove('show');
      closedAny = true;
    }

    const notifPopover = $('#notifPopover');
    if (notifPopover && notifPopover.classList.contains('show')) {
      notifPopover.classList.remove('show');
      closedAny = true;
    }

    if (closedAny) e.preventDefault();
  }

  if (e.altKey && !e.ctrlKey) {
    if (e.key === '1') { switchTab('search'); $('#searchOriginInput')?.focus(); e.preventDefault(); }
    else if (e.key === '2') { switchTab('radar'); e.preventDefault(); }
    else if (e.key === '3') { openPaymentSimulator(); e.preventDefault(); }
    else if (e.key === '4') { switchTab('bookings'); e.preventDefault(); }
  }
});

// ==========================================================================
// RADAR AO VIVO (API PÚBLICA OPENSKY ADS-B)
// ==========================================================================
let liveRadarFlights = [];
let currentRadarFilter = 'all';
let radarRefreshInterval = null;
let radarCountdownValue = 25;

async function loadRadarFlights(force = false) {
  const icon = $('#radarRefreshIcon');
  if (icon) icon.classList.add('spin-animation');

  try {
    const res = await api.request('flights:live');
    if (res && Array.isArray(res.flights)) {
      liveRadarFlights = res.flights;

      if ($('#radarStatTotal')) $('#radarStatTotal').textContent = res.totalTracked || res.flights.length;

      const latamCount = res.flights.filter(f => f.airlineBadge === 'LATAM').length;
      if ($('#radarStatLatam')) $('#radarStatLatam').textContent = `${latamCount} voos`;

      const avgAlt = Math.round(res.flights.reduce((acc, f) => acc + (f.altitudeFt || 0), 0) / (res.flights.length || 1));
      if ($('#radarStatAltitude')) {
        $('#radarStatAltitude').textContent = `FL${Math.round(avgAlt / 100)} (${Math.round(avgAlt * 0.3048).toLocaleString('pt-BR')} m)`;
      }

      if ($('#radarStatSource')) {
        $('#radarStatSource').textContent = res.cached ? 'OpenSky (Cache 25s)' : 'OpenSky ADS-B Ao Vivo';
        $('#radarStatSource').style.color = res.cached ? 'var(--status-amber)' : 'var(--status-emerald)';
      }

      renderRadarFlights();
      radarCountdownValue = 25;
      if ($('#radarCountdown')) $('#radarCountdown').textContent = '25s';

      if (force) {
        showToast(`Radar atualizado: ${res.flights.length} aeronaves monitoradas.`, 'bi-radar');
      }
    }
  } catch (err) {
    console.error('Erro ao buscar dados do radar:', err);
    showToast('Rede OpenSky temporariamente indisponível. Usando telemetria em cache.', 'bi-exclamation-triangle');
  } finally {
    if (icon) icon.classList.remove('spin-animation');
  }
}

function renderRadarFlights() {
  const container = $('#radarFlightsContainer');
  if (!container) return;

  const search = ($('#radarSearchInput')?.value || '').trim().toUpperCase();

  const filtered = liveRadarFlights.filter(f => {
    if (currentRadarFilter !== 'all') {
      if (currentRadarFilter === 'TAP') {
        if (!['TAP', 'AA', 'AF', 'LH', 'IB'].includes(f.airlineBadge) && f.country === 'Brasil') return false;
      } else if (f.airlineBadge !== currentRadarFilter) {
        return false;
      }
    }
    if (search) {
      const matchCall = f.callsign.toUpperCase().includes(search);
      const matchIcao = f.icao24.toUpperCase().includes(search);
      const matchAir = f.airline.toUpperCase().includes(search);
      if (!matchCall && !matchIcao && !matchAir) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: 12px;">
        <i class="bi bi-radar" style="font-size: 32px; color: var(--text-muted);"></i>
        <h3 style="margin: 12px 0 6px 0; color: var(--text-primary);">Nenhuma aeronave encontrada</h3>
        <p style="color: var(--text-secondary); font-size: 12px; margin: 0;">Nenhum voo corresponde aos filtros ativos. Tente selecionar "Todos os Voos" ou limpar o campo de busca.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(f => {
    const isLatam = f.airlineBadge === 'LATAM';
    const badgeColor = f.airlineColor || (isLatam ? '#e6004c' : '#7b6d92');
    const headingDeg = f.heading || 0;

    return `
      <div class="radar-flight-card ${isLatam ? 'latam-card' : ''}">
        <div class="radar-flight-header">
          <div class="radar-flight-callsign">
            <span class="radar-airline-badge" style="background-color: ${badgeColor};">${escapeHtml(f.airlineBadge)}</span>
            <span class="radar-callsign-code">${escapeHtml(f.callsign)}</span>
          </div>
          <span class="flight-status-badge ${f.status.class}">
            <i class="bi ${f.status.icon}"></i> ${escapeHtml(f.status.label)}
          </span>
        </div>

        <div style="font-size: 11.5px; color: var(--text-secondary); display: flex; align-items: center; justify-content: space-between;">
          <span>${escapeHtml(f.airline)} · <small style="font-family: var(--font-mono); color: var(--text-muted);">${escapeHtml(f.icao24)}</small></span>
          <span style="font-size: 10px; color: var(--text-muted);">${escapeHtml(f.country)}</span>
        </div>

        <div class="radar-flight-metrics">
          <div class="radar-metric-item">
            <span class="radar-metric-val">FL${Math.round(f.altitudeFt / 100)}</span>
            <span class="radar-metric-label">${f.altitudeM.toLocaleString('pt-BR')} m</span>
          </div>
          <div class="radar-metric-item">
            <span class="radar-metric-val">${f.velocityKmh} <small style="font-size: 9px;">km/h</small></span>
            <span class="radar-metric-label">Velocidade Solo</span>
          </div>
          <div class="radar-metric-item">
            <span class="radar-metric-val">
              <i class="bi bi-compass radar-heading-icon" style="transform: rotate(${headingDeg}deg);"></i> ${headingDeg}°
            </span>
            <span class="radar-metric-label">Proa Magnética</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 6px; border-top: 1px solid var(--border-subtle);">
          <span style="color: var(--text-muted); font-size: 10px;">
            <i class="bi bi-broadcast"></i> ADS-B transponder ativo
          </span>
          <button type="button" class="btn-select-flight" style="width: auto; padding: 4px 10px; font-size: 10.5px;" onclick="trackLiveFlightInSearch('${escapeHtml(f.callsign)}')">
            <i class="bi bi-search"></i> Pesquisar Tarifa
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function startRadarAutoRefresh() {
  stopRadarAutoRefresh();
  radarCountdownValue = 25;
  radarRefreshInterval = setInterval(() => {
    radarCountdownValue--;
    if ($('#radarCountdown')) $('#radarCountdown').textContent = `${radarCountdownValue}s`;
    if (radarCountdownValue <= 0) {
      radarCountdownValue = 25;
      loadRadarFlights();
    }
  }, 1000);
}

function stopRadarAutoRefresh() {
  if (radarRefreshInterval) {
    clearInterval(radarRefreshInterval);
    radarRefreshInterval = null;
  }
}

window.trackLiveFlightInSearch = function(callsign) {
  switchTab('search');
  if (callsign.startsWith('TAM') || callsign.startsWith('LA')) {
    $('#searchOriginInput').value = 'São Paulo (GRU)';
    $('#searchDestinationInput').value = 'Rio de Janeiro (GIG)';
  } else if (callsign.startsWith('GLO') || callsign.startsWith('G3')) {
    $('#searchOriginInput').value = 'Brasília (BSB)';
    $('#searchDestinationInput').value = 'Rio de Janeiro (SDU)';
  } else if (callsign.startsWith('AZU') || callsign.startsWith('AD')) {
    $('#searchOriginInput').value = 'Campinas (VCP)';
    $('#searchDestinationInput').value = 'Belo Horizonte (CNF)';
  }
  performFlightSearch();
  showToast(`Buscando tarifas comerciais compatíveis com voo ${callsign}...`, 'bi-airplane');
};

// ==========================================================================
// SIMULADOR DE GERAÇÃO DE PAGAMENTOS (PIX, CARTÃO, BOLETO)
// ==========================================================================
let currentSimAmount = 389.00;
let simPixCountdownTimer = null;
let simPixSecondsRemaining = 900; // 15 minutos

function generateSvgQrCode(content) {
  const size = 25;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  function drawFinder(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (!inTopLeft && !inTopRight && !inBottomLeft) {
        const bit = ((hash ^ (r * 31 + c * 17)) + (r * c)) % 3;
        matrix[r][c] = bit === 0 || ((r + c) % 2 === 0 && bit === 1);
      }
    }
  }

  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#fcfaff" />`;
      }
    }
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; shape-rendering: crispEdges;">
      <rect width="${size}" height="${size}" fill="#160228" />
      ${rects}
    </svg>
  `;
}

function openPaymentSimulator(amount = 389.00) {
  currentSimAmount = Number(amount) || 389.00;
  updateSimAmountUI();

  $('#simPixPendingView').style.display = 'flex';
  $('#simPixSuccessView').style.display = 'none';
  $('#simCardSuccessView').style.display = 'none';
  $('#simBoletoSuccessView').style.display = 'none';

  switchSimTab('pix');
  startPixCountdown();

  $('#paymentSimulatorModal')?.classList.add('open');
}

function closePaymentSimulator() {
  stopPixCountdown();
  $('#paymentSimulatorModal')?.classList.remove('open');
}

function switchSimTab(tabId) {
  $$('.sim-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.simTab === tabId);
  });
  $('#simPanelPix').style.display = tabId === 'pix' ? 'block' : 'none';
  $('#simPanelCard').style.display = tabId === 'card' ? 'flex' : 'none';
  $('#simPanelBoleto').style.display = tabId === 'boleto' ? 'flex' : 'none';
}

function startPixCountdown() {
  stopPixCountdown();
  simPixSecondsRemaining = 900;
  updatePixCountdownDisplay();
  simPixCountdownTimer = setInterval(() => {
    simPixSecondsRemaining--;
    if (simPixSecondsRemaining <= 0) {
      stopPixCountdown();
      if ($('#simPixCountdownDisplay')) $('#simPixCountdownDisplay').textContent = 'Expirado';
    } else {
      updatePixCountdownDisplay();
    }
  }, 1000);
}

function stopPixCountdown() {
  if (simPixCountdownTimer) {
    clearInterval(simPixCountdownTimer);
    simPixCountdownTimer = null;
  }
}

function updatePixCountdownDisplay() {
  const m = Math.floor(simPixSecondsRemaining / 60).toString().padStart(2, '0');
  const s = (simPixSecondsRemaining % 60).toString().padStart(2, '0');
  if ($('#simPixCountdownDisplay')) $('#simPixCountdownDisplay').textContent = `${m}:${s}`;
}

function updateSimAmountUI() {
  const formatted = formatCurrency(currentSimAmount);
  if ($('#simSelectedAmountDisplay')) $('#simSelectedAmountDisplay').textContent = formatted;
  if ($('#simCustomAmountInput')) $('#simCustomAmountInput').value = currentSimAmount.toFixed(2);

  const pixPayload = `00020126580014br.gov.bcb.pix0136grautam-pix-gateway-55420212BR.GOV.BCB.PIX520400005303986540${currentSimAmount.toFixed(2)}5802BR5915GRAUTAM VIAGENS6009SAO PAULO62070503***6304${(Math.floor(Math.random() * 8999) + 1000).toString(16).toUpperCase()}`;
  if ($('#simPixKeyInput')) $('#simPixKeyInput').value = pixPayload;
  if ($('#simPixQrContainer')) $('#simPixQrContainer').innerHTML = generateSvgQrCode(pixPayload);

  updateCardInstallmentsDropdown();

  const cents = Math.round(currentSimAmount * 100).toString().padStart(10, '0');
  const boletoLine = `23793.38128 60014.281903 04000.053039 1 954${cents}`;
  if ($('#simBoletoLineInput')) $('#simBoletoLineInput').value = boletoLine;
}

function updateCardInstallmentsDropdown() {
  const select = $('#simCardInstallmentsSelect');
  if (!select) return;

  const options = [];
  for (let i = 1; i <= 12; i++) {
    const installmentValue = currentSimAmount / i;
    const formattedInst = formatCurrency(installmentValue);
    const suffix = i === 1 ? 'à vista (sem juros)' : `${i}x de ${formattedInst} sem juros`;
    options.push(`<option value="${i}">${suffix}</option>`);
  }
  select.innerHTML = options.join('');
}

async function openLastTicketModal() {
  try {
    const list = await api.request('bookings:list');
    if (list && list.length > 0) {
      const latest = list[list.length - 1];
      openBoardingPassModal(latest);
    } else {
      showToast('Nenhum bilhete emitido ainda. Realize uma busca para emitir sua passagem!', 'bi-info-circle');
      switchTab('search');
    }
  } catch (err) {
    showToast('Falha ao recuperar último bilhete.', 'bi-exclamation-circle');
  }
}

// ==========================================================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================================================

// Tab navigation buttons
$$('.nav-item[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

// Trip type toggle
$$('.trip-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.trip-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const isRound = btn.dataset.triptype === 'round';
    $('#dateReturnGroup').style.display = isRound ? 'flex' : 'none';
  });
});

// Swap locations button
$('#btnSwapAirports')?.addEventListener('click', () => {
  const orig = $('#searchOriginInput');
  const dest = $('#searchDestinationInput');
  const tmp = orig.value;
  orig.value = dest.value;
  dest.value = tmp;
});

// Search form submit
$('#flightSearchForm')?.addEventListener('submit', event => {
  event.preventDefault();
  performFlightSearch();
});

// Airline Filter Pills
$$('.filter-pill-btn[data-airlinefilter]').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter-pill-btn[data-airlinefilter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAirlineFilter = btn.dataset.airlinefilter;
    renderFlightResults(activeSearchResults);
  });
});

// Direct Flights Only Filter
$('#filterDirectOnly')?.addEventListener('click', () => {
  filterDirectOnlyActive = !filterDirectOnlyActive;
  $('#filterDirectOnly').classList.toggle('active', filterDirectOnlyActive);
  renderFlightResults(activeSearchResults);
});

// Time Slot Filters
$$('.filter-pill-btn[data-timefilter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const isAlreadyActive = btn.classList.contains('active');
    $$('.filter-pill-btn[data-timefilter]').forEach(b => b.classList.remove('active'));
    if (!isAlreadyActive) {
      btn.classList.add('active');
      currentTimeFilter = btn.dataset.timefilter;
    } else {
      currentTimeFilter = 'all';
    }
    renderFlightResults(activeSearchResults);
  });
});

// Initialize Date Defaults (Departure in 3 days, Return in 10 days)
document.addEventListener('DOMContentLoaded', async () => {
  const now = new Date();
  const depDate = new Date(now.getTime() + 86400000 * 3);
  const retDate = new Date(now.getTime() + 86400000 * 10);

  const formatDateStr = d => d.toISOString().slice(0, 10);
  if ($('#searchDateDep')) {
    $('#searchDateDep').value = formatDateStr(depDate);
    $('#searchDateDep').min = formatDateStr(now);
  }
  if ($('#searchDateRet')) {
    $('#searchDateRet').value = formatDateStr(retDate);
    $('#searchDateRet').min = formatDateStr(depDate);
  }

  // Update topbar live date
  const dateStr = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(now);
  if ($('#topbarLiveDate')) $('#topbarLiveDate').textContent = dateStr;

  // Load Settings
  try {
    userSettings = await api.request('settings:get');
    if (userSettings.currency) {
      currentCurrency = userSettings.currency;
      if ($('#topbarCurrencySelect')) $('#topbarCurrencySelect').value = currentCurrency;
    }
    if ($('#passengerDisplayName')) {
      $('#passengerDisplayName').textContent = userSettings.passengerName || 'Carlos Silveira';
    }
  } catch (err) {
    console.error(err);
  }

  // Topbar Currency Change Event
  $('#topbarCurrencySelect')?.addEventListener('change', async e => {
    currentCurrency = e.target.value;
    userSettings.currency = currentCurrency;
    api.request('settings:set', userSettings).catch(() => {});
    renderFlightResults(activeSearchResults);
    loadDeals();
    loadBookings();
    showToast(`Moeda alterada para ${currentCurrency}.`, 'bi-cash-coin');
  });

  // Quick Navigation Bar Handlers
  $('#qnavSearch')?.addEventListener('click', () => {
    switchTab('search');
    $('#searchOriginInput')?.focus();
  });

  $('#qnavRadar')?.addEventListener('click', () => {
    switchTab('radar');
  });

  $('#qnavPaymentSim')?.addEventListener('click', () => {
    openPaymentSimulator();
  });

  $('#qnavLastTicket')?.addEventListener('click', () => {
    openLastTicketModal();
  });

  $('#qnavDeals')?.addEventListener('click', () => {
    switchTab('deals');
  });

  $('#qnavCurrencySync')?.addEventListener('click', () => {
    syncLiveCurrencyRates(false);
  });

  $('#qnavAnacHelp')?.addEventListener('click', () => {
    $('#anacHelpModal')?.classList.add('open');
  });

  // Radar Controls Listeners
  $$('.radar-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.radar-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentRadarFilter = chip.dataset.radarFilter;
      renderRadarFlights();
    });
  });

  $('#radarSearchInput')?.addEventListener('input', () => {
    renderRadarFlights();
  });

  $('#btnRefreshRadar')?.addEventListener('click', () => {
    loadRadarFlights(true);
  });

  // Payment Simulator Listeners
  $('#closePaymentSimModal')?.addEventListener('click', closePaymentSimulator);

  $$('.sim-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSimTab(btn.dataset.simTab));
  });

  $$('.sim-preset-chip[data-sim-val]').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.sim-preset-chip[data-sim-val]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentSimAmount = Number(chip.dataset.simVal) || 389.00;
      updateSimAmountUI();
    });
  });

  $('#simCustomAmountInput')?.addEventListener('input', e => {
    const val = Number(e.target.value) || 0;
    if (val > 0) {
      currentSimAmount = val;
      $$('.sim-preset-chip[data-sim-val]').forEach(c => c.classList.remove('active'));
      updateSimAmountUI();
    }
  });

  $('#btnCopySimPix')?.addEventListener('click', async () => {
    const val = $('#simPixKeyInput')?.value;
    if (val) {
      try {
        await navigator.clipboard.writeText(val);
        showToast('Chave Copia e Cola PIX copiada para a área de transferência!', 'bi-clipboard-check');
      } catch (_) {
        showToast('Código copiado!', 'bi-check2');
      }
    }
  });

  $('#btnSimulatePixPayment')?.addEventListener('click', () => {
    const btn = $('#btnSimulatePixPayment');
    btn.disabled = true;
    btn.innerHTML = '<span class="spin-animation"><i class="bi bi-arrow-repeat"></i></span> Processando liquidação via BACEN SPI...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check2-circle" style="font-size: 18px;"></i> <span>Simular Pagamento Concluído (Aprovação Instantânea)</span>';

      $('#simPixPendingView').style.display = 'none';
      $('#simPixSuccessView').style.display = 'flex';

      const nowTime = new Date().toLocaleTimeString('pt-BR');
      const e2eId = `E00416968${Date.now()}91248019`;
      if ($('#simPixE2E')) $('#simPixE2E').textContent = e2eId;
      if ($('#simPixPaidVal')) $('#simPixPaidVal').textContent = formatCurrency(currentSimAmount);
      if ($('#simPixPaidTime')) $('#simPixPaidTime').textContent = nowTime;

      api.request('notice:create', {
        type: 'purchase',
        title: 'Pagamento PIX Confirmado',
        message: `Tarifa de ${formatCurrency(currentSimAmount)} liquidada com sucesso via SPI Banco Central.`
      }).then(() => loadNotifications()).catch(() => {});

      showToast(`PIX de ${formatCurrency(currentSimAmount)} aprovado com sucesso!`, 'bi-check-circle-fill');
    }, 700);
  });

  $('#btnSimResetPix')?.addEventListener('click', () => {
    $('#simPixPendingView').style.display = 'flex';
    $('#simPixSuccessView').style.display = 'none';
    startPixCountdown();
  });

  $('#btnSimClosePixDone')?.addEventListener('click', closePaymentSimulator);

  // Card Preview Live Updates
  $('#simCardInputNumber')?.addEventListener('input', e => {
    const val = e.target.value.trim() || '•••• •••• •••• 4120';
    if ($('#simCardPreviewNum')) $('#simCardPreviewNum').textContent = val;
  });

  $('#simCardInputHolder')?.addEventListener('input', e => {
    const val = e.target.value.trim() || 'CARLOS SILVEIRA';
    if ($('#simCardPreviewHolder')) $('#simCardPreviewHolder').textContent = val.toUpperCase();
  });

  $('#simCardInputExp')?.addEventListener('input', e => {
    const val = e.target.value.trim() || '11/30';
    if ($('#simCardPreviewExp')) $('#simCardPreviewExp').textContent = val;
  });

  $('#btnFillCardLatam')?.addEventListener('click', () => {
    $('#simCardInputNumber').value = '4120 8912 3012 4120';
    $('#simCardInputHolder').value = 'CARLOS SILVEIRA';
    $('#simCardInputExp').value = '11/30';
    $('#simCardInputCvv').value = '892';
    if ($('#simCardPreviewNum')) $('#simCardPreviewNum').textContent = '4120 8912 3012 4120';
    if ($('#simCardPreviewHolder')) $('#simCardPreviewHolder').textContent = 'CARLOS SILVEIRA';
    if ($('#simCardPreviewExp')) $('#simCardPreviewExp').textContent = '11/30';
    if ($('#simCardPreviewBrand')) $('#simCardPreviewBrand').textContent = 'LATAM PASS · VISA INFINITE';
    showToast('Cartão LATAM Pass Visa Infinite preenchido!', 'bi-credit-card');
  });

  $('#btnFillCardMaster')?.addEventListener('click', () => {
    $('#simCardInputNumber').value = '5412 7512 9012 3341';
    $('#simCardInputHolder').value = 'CARLOS SILVEIRA';
    $('#simCardInputExp').value = '08/29';
    $('#simCardInputCvv').value = '512';
    if ($('#simCardPreviewNum')) $('#simCardPreviewNum').textContent = '5412 7512 9012 3341';
    if ($('#simCardPreviewHolder')) $('#simCardPreviewHolder').textContent = 'CARLOS SILVEIRA';
    if ($('#simCardPreviewExp')) $('#simCardPreviewExp').textContent = '08/29';
    if ($('#simCardPreviewBrand')) $('#simCardPreviewBrand').textContent = 'MASTERCARD BLACK';
    showToast('Cartão Mastercard Black preenchido!', 'bi-credit-card');
  });

  $('#btnSimulateCardPayment')?.addEventListener('click', () => {
    const btn = $('#btnSimulateCardPayment');
    btn.disabled = true;
    btn.innerHTML = '<span class="spin-animation"><i class="bi bi-arrow-repeat"></i></span> Autenticando com Adquirente (3DS 2.0)...';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-shield-check" style="font-size: 18px;"></i> <span>Processar Transação de Teste (Simular Cobrança)</span>';

      const instSel = $('#simCardInstallmentsSelect');
      const instText = instSel ? instSel.options[instSel.selectedIndex]?.text : '1x sem juros';
      if ($('#simCardApprovedInstallments')) $('#simCardApprovedInstallments').textContent = instText;

      $('#simCardSuccessView').style.display = 'flex';

      api.request('notice:create', {
        type: 'purchase',
        title: 'Transação com Cartão Aprovada',
        message: `${instText} no valor de ${formatCurrency(currentSimAmount)} autorizada sob código #AUT-948120.`
      }).then(() => loadNotifications()).catch(() => {});

      showToast('Cobrança de cartão autorizada com sucesso!', 'bi-check-circle-fill');
    }, 600);
  });

  $('#btnSimCloseCardDone')?.addEventListener('click', closePaymentSimulator);

  $('#btnCopySimBoleto')?.addEventListener('click', async () => {
    const val = $('#simBoletoLineInput')?.value;
    if (val) {
      try {
        await navigator.clipboard.writeText(val);
        showToast('Linha digitável do boleto copiada!', 'bi-clipboard-check');
      } catch (_) {
        showToast('Linha copiada!', 'bi-check2');
      }
    }
  });

  $('#btnSimulateBoletoCompensation')?.addEventListener('click', () => {
    $('#simBoletoSuccessView').style.display = 'flex';
    showToast('Compensação bancária simulada com sucesso!', 'bi-bank');
  });

  $('#btnSimCloseBoletoDone')?.addEventListener('click', closePaymentSimulator);

  // ANAC Modal Listeners
  $('#closeAnacModal')?.addEventListener('click', () => {
    $('#anacHelpModal')?.classList.remove('open');
  });

  $('#btnCloseAnacModal')?.addEventListener('click', () => {
    $('#anacHelpModal')?.classList.remove('open');
  });

  // Memory & Energy Optimization: pause timers when minimized/tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRadarAutoRefresh();
      stopPixCountdown();
    } else {
      if (currentTab === 'radar') {
        startRadarAutoRefresh();
      }
      if ($('#paymentSimulatorModal')?.classList.contains('open')) {
        startPixCountdown();
      }
    }
  });

  // Load Initial Data
  loadBookings();
  loadNotifications();
  loadDeals();
  loadFlightTracker();
  syncLiveCurrencyRates(true);

  // Execute initial search so user immediately sees available flights
  performFlightSearch();
});
