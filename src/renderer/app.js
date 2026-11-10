// Grautam Viagens — Lógica da Interface Comercial (Claude Code Style)
const api = window.grautam;

// Utility functions
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);
const formatBRL = val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
const escapeHtml = str => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
    tracker: 'Status de Voos',
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
    if ($('#passengerDisplayName')) {
      $('#passengerDisplayName').textContent = userSettings.passengerName || 'Carlos Silveira';
    }
  } catch (err) {
    console.error(err);
  }

  // Load Initial Data
  loadBookings();
  loadNotifications();
  loadDeals();
  loadFlightTracker();

  // Execute initial search so user immediately sees available flights
  performFlightSearch();
});
