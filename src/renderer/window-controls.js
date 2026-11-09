const windowApi = window.grautam;

document.querySelectorAll('[data-window]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.window;
  if (action === 'minimize') windowApi.request('window:minimize');
  if (action === 'close') windowApi.request('window:close');
  if (action === 'fullscreen') windowApi.request('window:toggle-fullscreen');
}));

document.querySelectorAll('[data-navigate]').forEach(button => button.addEventListener('click', event => {
  event.preventDefault();
  windowApi.request('window:open', { name: button.dataset.navigate });
}));

windowApi.onFullscreen?.(isFullscreen => {
  document.body.classList.toggle('is-fullscreen', isFullscreen);
  const button = document.querySelector('[data-window="fullscreen"], #fullscreenButton');
  const icon = button?.querySelector('i');
  if (icon) {
    icon.classList.toggle('bi-fullscreen', !isFullscreen);
    icon.classList.toggle('bi-fullscreen-exit', isFullscreen);
  }
  button?.setAttribute('aria-label', isFullscreen ? 'Sair da tela cheia' : 'Tela cheia');
});
