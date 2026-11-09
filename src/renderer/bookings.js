const api = window.grautam; const $ = s => document.querySelector(s); const form = $('#bookingForm');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const formatBRL = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
let currentTrip = null, totalEstimate = 0, searchFactor = 1, settings = {};
function toast(message, type = 'success') { const item = document.createElement('div'); item.className = `toast show text-bg-${type} border-0`; item.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button class="btn-close btn-close-white me-2 m-auto"></button></div>'; item.querySelector('.toast-body').textContent = message; item.querySelector('button').onclick = () => item.remove(); $('#toastHost').append(item); setTimeout(() => item.remove(), 4500); }
function calculateEstimate() {
  const airline = $('#airlineFilter').value; settings.airline = airline;
  const base = { LATAM: 820, Azul: 730, GOL: 690, Avianca: 760, 'Copa Airlines': 1150, Iberia: 1760, 'Air France': 2050, Lufthansa: 1920 }[airline] || 820;
  const date = new Date(`${currentTrip.date}T12:00:00`); const days = Math.max(0, Math.ceil((date - new Date()) / 86400000));
  const factor = Math.max(0.76, 1.25 - Math.min(days, 120) * 0.004) * searchFactor;
  const perPassenger = Math.round(base * factor / 10) * 10; totalEstimate = perPassenger * currentTrip.passengers;
  $('#estimateHeading').textContent = `${currentTrip.origin} → ${currentTrip.destination}`;
  $('#pricePerPassenger').textContent = formatBRL(perPassenger); $('#priceTotal').textContent = formatBRL(totalEstimate);
  $('#priceDate').textContent = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date);
  updateBudget();
}
function updateBudget() {
  const input = Number($('#budgetInput').value || $('#budgetRange').value); const date = new Date(`${currentTrip.date}T12:00:00`);
  const months = Math.max(1, Math.ceil((date - new Date()) / (86400000 * 30.44)));
  $('#monthlySaving').textContent = formatBRL(input / months);
  const difference = input - totalEstimate; $('#budgetDifference').textContent = difference >= 0 ? `${formatBRL(difference)} sobrariam` : `${formatBRL(Math.abs(difference))} acima do orçamento`;
  $('#budgetDifference').className = difference >= 0 ? 'budget-positive' : 'budget-negative';
}
async function loadTrips() {
  const trips = await api.request('trips:list'); $('#savedCount').textContent = `${trips.length} ${trips.length === 1 ? 'viagem' : 'viagens'}`;
  const container = $('#savedTrips');
  if (!trips.length) { container.innerHTML = '<div class="empty-state"><i class="bi bi-suitcase-lg"></i><b>Nenhuma viagem salva</b><span>Compare uma estimativa para começar a planejar.</span></div>'; return; }
  container.innerHTML = trips.map(t => `<article class="saved-trip glass-panel"><div class="saved-trip-icon"><i class="bi bi-airplane"></i></div><div class="saved-route"><b>${escapeHtml(t.origin)} <i class="bi bi-arrow-right"></i> ${escapeHtml(t.destination)}</b><small>${t.date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${t.date}T00:00:00Z`)) : 'Data flexível'} · ${t.passengers} passageiro${t.passengers > 1 ? 's' : ''}</small></div><span class="planning-badge">SALVA</span><button class="icon-button delete-trip" data-id="${escapeHtml(t.id)}" aria-label="Excluir viagem"><i class="bi bi-trash3"></i></button></article>`).join('');
  container.querySelectorAll('.delete-trip').forEach(button => button.onclick = async () => { await api.request('trips:delete', { id: button.dataset.id }); toast('Viagem removida.'); loadTrips(); });
}
form.elements.date.min = new Date().toISOString().slice(0, 10);
form.addEventListener('submit', event => {
  event.preventDefault(); const data = Object.fromEntries(new FormData(form)); data.passengers = Number(data.passengers);
  const airline = $('#airlineFilter').value; currentTrip = { ...data, id: `plan_${Date.now()}`, createdAt: Date.now() };
  searchFactor = 0.88 + Math.random() * 0.25;
  $('#estimateSection').hidden = false; calculateEstimate(); loadTrips();
  api.request('settings:get').then(value => { settings = { ...value, airline }; return api.request('settings:set', settings); });
  api.request('trips:save', currentTrip).then(() => toast('Estimativa pronta. Os valores são ilustrativos.')).catch(error => toast(error.message, 'danger'));
});
$('.swap-button').addEventListener('click', () => { const a = form.elements.origin, b = form.elements.destination; [a.value, b.value] = [b.value, a.value]; });
$('#airlineFilter').addEventListener('change', calculateEstimate);
$('#budgetInput').addEventListener('input', () => { const v = Math.max(500, Math.min(10000, Number($('#budgetInput').value) || 500)); $('#budgetRange').value = v; updateBudget(); });
$('#budgetRange').addEventListener('input', () => { $('#budgetInput').value = $('#budgetRange').value; updateBudget(); });
$('#simulatePurchase').addEventListener('click', async () => {
  if (!currentTrip) return;
  const payment = document.querySelector('[name="payment"]:checked').value;
  try {
    const booking = await api.request('booking:simulate', { ...currentTrip, total: totalEstimate, payment, airline: $('#airlineFilter').value });
    toast(`Compra simulada: ${booking.airline} · ${formatBRL(booking.total)} via ${payment}. Nenhuma cobrança realizada.`, 'success');
    await loadTrips();
  } catch (error) { toast(error.message || 'Não foi possível simular.', 'danger'); }
});
document.querySelectorAll('[data-open]').forEach(button => button.onclick = () => api.request('window:open', { name: button.dataset.open }));
api.request('settings:get').then(value => { settings = value; $('#airlineFilter').value = value.airline || 'LATAM'; });
loadTrips();
