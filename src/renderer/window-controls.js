const windowApi = window.grautam;
document.querySelectorAll('[data-window]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.window;
  if (action === 'minimize') windowApi.request('window:minimize');
  if (action === 'close') windowApi.request('window:close');
  if (action === 'fullscreen') windowApi.request('window:toggle-fullscreen');
}));
windowApi.onFullscreen?.(isFullscreen => { document.body.classList.toggle('is-fullscreen', isFullscreen); });
