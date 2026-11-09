const api = window.grautam; const $ = s => document.querySelector(s); const form = $('#supportForm');
form.elements.email.addEventListener('input', event => { localStorage.setItem('support-email', event.target.value.slice(0, 200)); });
form.elements.email.value = localStorage.getItem('support-email') || '';
form.elements.message.addEventListener('input', event => { $('#charCount').textContent = event.target.value.length; });
form.addEventListener('submit', async event => {
  event.preventDefault(); const payload = Object.fromEntries(new FormData(form));
  try { await api.request('support:send', payload); $('#toastHost').innerHTML = '<div class="toast show text-bg-success border-0"><div class="toast-body">Rascunho salvo. Seu aplicativo de e-mail foi aberto para concluir o envio.</div></div>'; }
  catch (error) { $('#toastHost').innerHTML = '<div class="toast show text-bg-danger border-0"><div class="toast-body"></div></div>'; $('#toastHost .toast-body').textContent = error.message; }
});
