const api = window.grautam;
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => api.request('window:open', { name: button.dataset.open })));
