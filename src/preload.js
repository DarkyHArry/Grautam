const { contextBridge, ipcRenderer } = require('electron');
const channels = new Set(['flights:live', 'trips:list', 'trips:save', 'trips:delete', 'settings:get', 'settings:set', 'notifications:list', 'notifications:clear', 'notice:create', 'booking:simulate', 'window:open', 'window:toggle-fullscreen', 'window:minimize', 'window:close', 'app:version', 'support:send', 'updates:check', 'notice:dismiss', 'profile:get', 'profile:save', 'profile:clear']);
contextBridge.exposeInMainWorld('grautam', Object.freeze({ request(channel, payload) {
  if (!channels.has(channel)) return Promise.reject(new Error('Operação indisponível.'));
  return ipcRenderer.invoke('app:request', channel, payload);
}, onFullscreen(callback) { if (typeof callback === 'function') ipcRenderer.on('window:fullscreen', (_event, value) => callback(value)); } }));
