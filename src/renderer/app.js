const api = window.grautam;
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const countryNames = { Brazil: 'Brasil', Chile: 'Chile', Argentina: 'Argentina', Uruguay: 'Uruguai', Paraguay: 'Paraguai', Bolivia: 'Bolívia', Peru: 'Peru', Ecuador: 'Equador', Colombia: 'Colômbia', Venezuela: 'Venezuela', 'United States': 'Estados Unidos', Spain: 'Espanha', France: 'França', Germany: 'Alemanha', Mexico: 'México', Portugal: 'Portugal' };
const countries = ['Brazil', 'Chile', 'Argentina', 'Uruguay', 'Paraguay', 'Bolivia', 'Peru', 'Ecuador', 'Colombia', 'Venezuela', 'United States', 'Spain', 'France', 'Germany', 'Mexico', 'Portugal'];
const now = new Date();
$('#todayDate').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(now);
$('#dateLabel').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(now).toUpperCase();
api.request('app:version').then(version => { $('#appVersion').textContent = `Versão ${version}`; }).catch(() => {});
let flightData = [], settings = {}, previousFlights = new Set(), noticeTimer;
function toast(message, type = 'success') { const item = document.createElement('div'); item.className = `toast align-items-center border-0 text-bg-${type} show`; item.setAttribute('role', 'status'); item.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto"></button></div>'; item.querySelector('.toast-body').textContent = message; item.querySelector('button').onclick = () => item.remove(); $('#toastHost').append(item); setTimeout(() => item.remove(), 4500); }
function selectedCountries() { return settings.countries?.length ? settings.countries : ['Brazil']; }
function renderCountryPicker() {
  const target = $('#countryChips'); if (!target) return;
  target.innerHTML = countries.map(code => `<label class="country-chip ${selectedCountries().includes(code) ? 'selected' : ''}"><input type="checkbox" value="${code}" ${selectedCountries().includes(code) ? 'checked' : ''}><span>${countryNames[code]}</span></label>`).join('');
  target.querySelectorAll('input').forEach(input => input.addEventListener('change', async () => {
    const chosen = [...target.querySelectorAll('input:checked')].map(i => i.value); settings.countries = chosen.length ? chosen : ['Brazil'];
    settings = await api.request('settings:set', settings); renderCountryPicker(); updateFlightLocation(); refreshFlights();
  }));
}
function updateFlightLocation() {
  const selected = selectedCountries(); const matching = flightData.filter(f => selected.includes(f.originCountry));
  const label = selected.map(c => countryNames[c] || c).join(', ');
  $('#monitoringCountries').textContent = `${matching.length} aeronaves com registro em: ${label}`;
  $('#trackedCount').textContent = matching.length.toLocaleString('pt-BR');
  $('#airborneCount').textContent = matching.filter(f => !f.onGround).length.toLocaleString('pt-BR');
  $('#groundCount').textContent = matching.filter(f => f.onGround).length.toLocaleString('pt-BR');
  renderFlights();
}
function renderFlights() {
  const term = $('#flightSearch').value.trim().toLowerCase(), filter = $('#flightFilter').value, selected = selectedCountries();
  const rows = flightData.filter(f => selected.includes(f.originCountry) && (`${f.callsign} ${f.icao24} ${f.originCountry}`).toLowerCase().includes(term) && (filter === 'all' || (filter === 'airborne' ? !f.onGround : f.onGround))).slice(0, 80);
  $('#flightRows').innerHTML = rows.length ? rows.map(f => `<tr><td><div class="flight-ident"><span class="plane-thumb ${f.onGround ? 'on-ground' : ''}"><i class="bi bi-airplane-fill"></i></span><span><b>${escapeHtml(f.callsign || 'Sem indicativo')}</b><small>${escapeHtml(f.icao24.toUpperCase())}</small></span></div></td><td><span class="country-cell"><span class="country-dot"></span>${escapeHtml(countryNames[f.originCountry] || f.originCountry)}</span></td><td>${f.altitudeM == null ? '—' : `${(f.altitudeM / 1000).toFixed(1)} km`}<small class="cell-sub">${f.altitudeM == null ? 'indisponível' : `${f.altitudeM.toLocaleString('pt-BR')} m`}</small></td><td>${f.velocityMs == null ? '—' : `${Math.round(f.velocityMs * 3.6)} km/h`}<small class="cell-sub">${f.heading == null ? 'proa —' : `proa ${String(f.heading).padStart(3, '0')}°`}</small></td><td><span class="model-na"><i class="bi bi-info-circle"></i> Não transmitido</span></td><td><span class="state-pill ${f.onGround ? 'state-ground' : 'state-airborne'}"><span></span>${f.onGround ? 'No solo' : 'Em voo'}</span></td></tr>`).join('') : '<tr><td colspan="6" class="table-empty">Nenhuma aeronave nos países escolhidos agora. Tente ampliar sua seleção.</td></tr>';
}
async function refreshFlights() {
  const icon = $('#refreshFlights i'); icon?.classList.add('spin');
  try {
    const result = await api.request('flights:live', { bounds: { lamin: -56, lomin: -82, lamax: 13, lomax: -34 } });
    flightData = result.states;
    const current = new Set(flightData.filter(f => f.callsign).map(f => f.icao24));
    const newFlights = flightData.filter(f => f.callsign && !previousFlights.has(f.icao24));
    if (previousFlights.size && newFlights.length && settings.notifications) addNotice({ type: 'flight', title: 'Novo voo detectado', message: `${newFlights[0].callsign} · ${countryNames[newFlights[0].originCountry] || newFlights[0].originCountry}` });
    previousFlights = current;
    $('#flightStatus').textContent = `${result.count.toLocaleString('pt-BR')} estados ADS-B · ${result.cached ? (result.stale ? 'cache anterior' : 'cache recente') : 'ao vivo'}${result.warning ? ` · ${result.warning}` : ''}`;
    $('#updatedAt').textContent = `Atualizado ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(result.fetchedAt))}`;
    updateFlightLocation();
    if (result.warning && !result.cached) toast(result.warning, 'warning');
  } catch (error) { $('#flightStatus').textContent = 'Fonte ADS-B temporariamente indisponível'; $('#flightRows').innerHTML = `<tr><td colspan="6" class="table-empty"><i class="bi bi-cloud-slash"></i> ${escapeHtml(error.message)}</td></tr>`; toast(error.message || 'Não foi possível buscar voos.', 'warning'); }
  finally { icon?.classList.remove('spin'); }
}
function addNotice(notice) { api.request('notice:create', notice).then(renderNotifications).catch(() => {}); }
function renderNotifications() {
  api.request('notifications:list').then(items => {
    $('#notificationCount').textContent = items.length > 99 ? '99+' : String(items.length);
    $('#notificationItems').innerHTML = items.length ? items.map(item => `<article class="notification-item"><span class="notice-symbol ${item.type === 'purchase' ? 'update-symbol' : item.type === 'flight' ? 'live-symbol' : 'system-symbol'}"><i class="bi ${item.type === 'purchase' ? 'bi-bag-check' : item.type === 'flight' ? 'bi-airplane' : 'bi-info-circle'}"></i></span><span><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.message)}</small><time>${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(new Date(item.createdAt))}</time></span></article>`).join('') : '<div class="notifications-empty"><i class="bi bi-bell-slash"></i><span>Sem notificações por enquanto.</span></div>';
    $('#notificationFoot').textContent = `${items.length} aviso${items.length === 1 ? '' : 's'} guardado${items.length === 1 ? '' : 's'}`;
  }).catch(() => {});
}
$('#flightSearch').addEventListener('input', renderFlights); $('#flightFilter').addEventListener('change', renderFlights); $('#refreshFlights').addEventListener('click', refreshFlights);
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => api.request('window:open', { name: button.dataset.open })));
document.querySelectorAll('[data-view="bookings"]').forEach(button => button.addEventListener('click', () => api.request('window:open', { name: 'bookings' })));
document.querySelectorAll('[data-view="schedule"]').forEach(button => button.addEventListener('click', () => api.request('window:open', { name: 'bookings' })));
document.querySelectorAll('[data-view="dashboard"]').forEach(button => button.addEventListener('click', () => location.reload()));
document.querySelector('[data-action="notifications"]').addEventListener('click', () => $('#notificationPopover').classList.toggle('show'));
$('#openNotifications').addEventListener('click', () => $('#notificationPopover').classList.toggle('show')); $('#closeNotifications').addEventListener('click', () => $('#notificationPopover').classList.remove('show'));
$('#clearNotifications').addEventListener('click', async () => { await api.request('notifications:clear'); renderNotifications(); toast('Notificações removidas.'); });
$('#notificationToggle').addEventListener('change', async event => { settings.notifications = event.target.checked; settings = await api.request('settings:set', settings); toast(`Avisos em tempo real ${settings.notifications ? 'ativados' : 'desativados'}.`); });
$('#fullscreenButton').addEventListener('click', () => api.request('window:toggle-fullscreen'));
document.addEventListener('click', event => { if (!event.target.closest('#notificationPopover') && !event.target.closest('#openNotifications') && !event.target.closest('[data-action="notifications"]')) $('#notificationPopover').classList.remove('show'); });
document.querySelector('[data-dismiss="updates"]').addEventListener('click', async () => { $('#updateBanner').classList.add('dismissed'); settings.updates = false; await api.request('settings:set', settings); });
api.request('settings:get').then(value => { settings = value; document.documentElement.dataset.theme = 'dark'; $('#notificationToggle').checked = settings.notifications; renderCountryPicker(); updateFlightLocation(); renderNotifications(); refreshFlights(); });
setInterval(() => { if (Math.random() < 0.18 && settings.notifications) addNotice({ type: 'system', title: 'Dica Grautam', message: ['Compare datas próximas para encontrar tarifas estimadas menores.', 'Salve sua viagem para consultar seu planejamento depois.', 'Confira os documentos exigidos antes de viajar.'][Math.floor(Math.random() * 3)] }); }, 180_000);
setInterval(refreshFlights, 60_000);
