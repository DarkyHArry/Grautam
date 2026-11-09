const { app, BrowserWindow, ipcMain, nativeTheme, Notification, Tray, Menu, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
if (!app.isPackaged) app.setPath('userData', path.join(__dirname, '..', '.dev-user-data'));
const data = require('./services/store');
const opensky = require('./services/opensky');

let mainWindow;
let tray;
let quitting = false;
let supportWindow;
let lastNotice = '';
const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets', 'grautam.ico')
  : path.join(__dirname, '..', 'assets', 'grautam.ico');
const dev = !app.isPackaged;

function windows() { return BrowserWindow.getAllWindows().filter(w => !w.isDestroyed()); }
function createWindow({ page = 'index.html', width = 1440, height = 960, minWidth = 1100, minHeight = 740, title = 'Grautam' } = {}) {
  const win = new BrowserWindow({ width, height, minWidth, minHeight, maxWidth: width, maxHeight: height, resizable: false, maximizable: false, fullscreenable: true, frame: false, show: false, title, icon: iconPath,
    backgroundColor: '#000000', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true }
  });
  win.setMenu(null);
  win.once('ready-to-show', () => win.show());
  win.on('enter-full-screen', () => win.webContents.send('window:fullscreen', true));
  win.on('leave-full-screen', () => win.webContents.send('window:fullscreen', false));
  win.on('close', event => { if (!quitting) { event.preventDefault(); win.hide(); if (mainWindow === win) showNotice('Grautam continua em execução na bandeja.'); } });
  win.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith('mailto:')) shell.openExternal(url); return { action: 'deny' }; });
  if (dev) win.loadFile(path.join(__dirname, 'renderer', page));
  else win.loadFile(path.join(__dirname, 'renderer', page));
  win.webContents.on('will-navigate', event => event.preventDefault());
  return win;
}
function showNotice(body, title = 'Grautam', force = false) {
  const settings = data.getSettings();
  if ((!settings.notifications && !force) || !Notification.isSupported()) return;
  const key = `${title}:${body}`;
  if (key === lastNotice) return;
  lastNotice = key;
  const notice = new Notification({ title, body, icon: iconPath, silent: true });
  notice.on('click', () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } });
  notice.show(); setTimeout(() => { if (lastNotice === key) lastNotice = ''; }, 6000);
}
function installTray() {
  tray = new Tray(iconPath);
  tray.setToolTip('Grautam — viagens aéreas');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Abrir Grautam', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { label: 'Central de suporte', click: () => openSupport() },
    { type: 'separator' },
    { label: 'Sair do Grautam', click: () => { quitting = true; app.quit(); } }
  ]));
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
  tray.on('click', () => { mainWindow.show(); mainWindow.focus(); });
}
function openSupport() {
  if (supportWindow && !supportWindow.isDestroyed()) { supportWindow.show(); supportWindow.focus(); return; }
  supportWindow = createWindow({ page: 'support.html', width: 820, height: 740, minWidth: 820, minHeight: 740, title: 'Grautam — Suporte' });
  supportWindow.on('closed', () => { supportWindow = null; });
}

const allowedChannels = new Set(['flights:live', 'trips:list', 'trips:save', 'trips:delete', 'settings:get', 'settings:set', 'notifications:list', 'notifications:clear', 'notice:create', 'booking:simulate', 'window:open', 'window:toggle-fullscreen', 'window:minimize', 'window:close', 'app:version', 'support:send', 'updates:check', 'notice:dismiss']);
ipcMain.handle('app:request', async (event, channel, payload) => {
  if (!allowedChannels.has(channel) || !windows().some(w => w.webContents.id === event.sender.id)) throw new Error('Solicitação não autorizada.');
  switch (channel) {
    case 'flights:live': return opensky.getStates(payload?.bounds || {});
    case 'trips:list': return data.listTrips();
    case 'trips:save': {
      const trip = data.saveTrip(payload);
      showNotice(`Planejamento ${trip.origin} → ${trip.destination} salvo na sua agenda.`, 'Viagem salva');
      return trip;
    }
    case 'trips:delete': return data.deleteTrip(payload?.id);
    case 'settings:get': return data.getSettings();
    case 'settings:set': return data.setSettings(payload);
    case 'notifications:list': return data.listNotifications();
    case 'notifications:clear': data.clearNotifications(); return true;
    case 'notice:create': {
      const notice = data.addNotification(payload);
      showNotice(notice.message, notice.title);
      return notice;
    }
    case 'booking:simulate': {
      const rawTrip = payload || {};
      const trip = {
        id: `booking_${randomUUID()}`,
        origin: String(rawTrip.origin || '').trim().slice(0, 80),
        destination: String(rawTrip.destination || '').trim().slice(0, 80),
        date: String(rawTrip.date || '').slice(0, 10),
        passengers: Number(rawTrip.passengers),
        createdAt: Date.now()
      };
      if (!trip.origin || !trip.destination || trip.origin === trip.destination || !/^\d{4}-\d{2}-\d{2}$/.test(trip.date) || !Number.isInteger(trip.passengers) || trip.passengers < 1 || trip.passengers > 9) throw new Error('Revise origem, destino, data e número de passageiros.');
      const payment = ['PIX', 'Cartão', 'Boleto'].includes(payload?.payment) ? payload.payment : 'PIX';
      const airlines = ['LATAM', 'Azul', 'GOL', 'Avianca', 'Copa Airlines', 'Iberia', 'Air France', 'Lufthansa'];
      const airline = airlines.includes(payload?.airline) ? payload.airline : 'LATAM';
      const total = Number(payload?.total);
      if (!Number.isFinite(total) || total < 50 || total > 100000) throw new Error('Valor estimado inválido.');
      const booking = { id: randomUUID(), ...trip, payment, airline, total: Math.round(total * 100) / 100, status: 'simulated', createdAt: Date.now() };
      data.store.set('bookings', [booking, ...data.store.get('bookings', [])].slice(0, 100));
      const notice = data.addNotification({ type: 'purchase', title: 'Compra simulada', message: `${airline}: viagem ${trip.origin} → ${trip.destination} · ${payment} · ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.total)}` });
      showNotice(notice.message, notice.title);
      return booking;
    }
    case 'window:open': if (payload?.name === 'support') openSupport(); else if (payload?.name === 'bookings') createWindow({ page: 'bookings.html', width: 1160, height: 820, minWidth: 1100, minHeight: 740, title: 'Grautam — Passagens' }); else if (payload?.name === 'partners') createWindow({ page: 'partners.html', width: 960, height: 760, minWidth: 920, minHeight: 700, title: 'Grautam — Segurança' }); return true;
    case 'window:toggle-fullscreen': { const win = BrowserWindow.fromWebContents(event.sender); if (win) win.setFullScreen(!win.isFullScreen()); return win?.isFullScreen() || false; }
    case 'window:minimize': BrowserWindow.fromWebContents(event.sender)?.minimize(); return true;
    case 'window:close': BrowserWindow.fromWebContents(event.sender)?.hide(); return true;
    case 'app:version': return app.getVersion();
    case 'updates:check': return { status: 'manual', message: 'Para atualizações, instale a versão mais recente distribuída pela sua empresa.' };
    case 'support:send': {
      const input = payload || {};
      const clean = value => String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 300);
      const email = clean(input.email), subject = clean(input.subject), message = String(input.message || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, 5000);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !subject || !message.trim()) throw new Error('Preencha e-mail, assunto e mensagem.');
      data.store.set('supportDrafts', [{ id: randomUUID(), email, subject, message: message.trim(), createdAt: Date.now() }, ...data.store.get('supportDrafts', [])].slice(0, 100));
      const query = new URLSearchParams({ subject: `[Grautam] ${subject}`, body: `${message.trim()}\n\nContato: ${email}` });
      await shell.openExternal(`mailto:suporte@grautam.com?${query.toString()}`);
      showNotice('Rascunho registrado. Conclua o envio no seu aplicativo de e-mail.', 'Suporte');
      return { saved: true };
    }
    case 'notice:dismiss': data.store.set('dismissed', [...new Set([...data.store.get('dismissed', []), String(payload?.id || '').slice(0, 120)])].slice(-200)); return true;
  }
});

function setupFirstRun() {
  const complete = path.join(app.getPath('userData'), 'setup-v1.json');
  if (fs.existsSync(complete)) return;
  const nodeModules = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(path.join(nodeModules, 'bootstrap', 'dist', 'css', 'bootstrap.min.css'))) {
    const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund'], { cwd: path.join(__dirname, '..'), stdio: 'inherit', timeout: 10 * 60 * 1000, windowsHide: true });
    if (result.error || result.status !== 0) { dialog.showErrorBox('Configuração do Grautam', 'Não foi possível instalar as dependências. Confirme a conexão e tente abrir o aplicativo novamente.'); throw result.error || new Error('npm install falhou'); }
  }
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(complete, JSON.stringify({ version: 1, completedAt: new Date().toISOString() }), { flag: 'w' });
}

app.whenReady().then(() => {
  try { setupFirstRun(); } catch (error) { require('electron').dialog.showErrorBox('Grautam', error.message); app.quit(); return; }
  const lock = app.requestSingleInstanceLock();
  if (!lock) { app.quit(); return; }
  mainWindow = createWindow();
  installTray();
  nativeTheme.themeSource = 'dark';
  app.on('activate', () => { if (mainWindow.isVisible()) mainWindow.focus(); else mainWindow.show(); });
});
app.on('before-quit', () => { quitting = true; });
app.on('window-all-closed', () => { /* A bandeja mantém o processo ativo. */ });
app.on('second-instance', () => { mainWindow?.show(); mainWindow?.focus(); });
