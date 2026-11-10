const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_CHANNELS = new Set([
  'flights:search',
  'flights:deals',
  'flights:status',
  'flights:airports',
  'currency:convert',
  'currency:list',
  'analytics:get',
  'calendar:export',
  'receipt:html',
  'bookings:list',
  'bookings:create',
  'bookings:cancel',
  'trips:list',
  'trips:save',
  'trips:delete',
  'settings:get',
  'settings:set',
  'notifications:list',
  'notifications:clear',
  'notice:create',
  'window:minimize',
  'window:maximize',
  'window:toggle-maximize',
  'window:is-maximized',
  'window:toggle-fullscreen',
  'window:close',
  'app:version',
  'support:send'
]);

contextBridge.exposeInMainWorld('grautam', Object.freeze({
  request(channel, payload) {
    if (!ALLOWED_CHANNELS.has(channel)) {
      return Promise.reject(new Error(`Canal não autorizado: ${channel}`));
    }
    return ipcRenderer.invoke('app:request', channel, payload);
  },
  onMaximizedChange(callback) {
    if (typeof callback === 'function') {
      ipcRenderer.on('window:maximized-change', (_event, isMaximized) => callback(isMaximized));
    }
  },
  onFullscreen(callback) {
    if (typeof callback === 'function') {
      ipcRenderer.on('window:fullscreen', (_event, isFullscreen) => callback(isFullscreen));
    }
  }
}));
