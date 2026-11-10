const { app, BrowserWindow, ipcMain, nativeTheme, Notification, Tray, Menu, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');

// Tratamento global de exceções para máxima estabilidade
process.on('uncaughtException', error => {
  console.error('[Grautam Error] Uncaught Exception:', error);
});

process.on('unhandledRejection', reason => {
  console.error('[Grautam Error] Unhandled Rejection:', reason);
});

// App User Model ID para notificações nativas no Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.grautam.desktop');
}

if (!app.isPackaged) {
  app.setPath('userData', path.join(__dirname, '..', '.dev-user-data'));
}

const data = require('./services/store');
const flights = require('./services/flights');
const currency = require('./services/currency');
const analytics = require('./services/analytics');
const calendar = require('./services/calendar');
const receipt = require('./services/receipt');

let mainWindow;
let tray;
let quitting = false;
let lastNotice = '';

function getAppIcon() {
  const candidates = [
    path.join(process.resourcesPath, 'assets', 'grautam.ico'),
    path.join(__dirname, '..', 'assets', 'grautam.ico'),
    path.join(__dirname, 'renderer', 'assets', 'grautam.ico')
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch (_) {}
  }
  return undefined;
}

const iconPath = getAppIcon();

function showNotice(body, title = 'Grautam Viagens') {
  try {
    const settings = data.getSettings();
    if (!settings.notifications || !Notification.isSupported()) return;
    const key = `${title}:${body}`;
    if (key === lastNotice) return;
    lastNotice = key;
    const options = { title, body, silent: false };
    if (iconPath) options.icon = iconPath;
    const notice = new Notification(options);
    notice.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });
    notice.show();
    setTimeout(() => { if (lastNotice === key) lastNotice = ''; }, 6000);
  } catch (err) {
    console.error('Falha ao exibir notificação:', err);
  }
}

function createWindow() {
  const windowOptions = {
    width: 1320,
    height: 860,
    minWidth: 1040,
    minHeight: 680,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    center: true,
    frame: false,
    show: false,
    title: 'Grautam — Vendas de Passagens Aéreas',
    backgroundColor: '#181816',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  };

  if (iconPath) {
    windowOptions.icon = iconPath;
  }

  const win = new BrowserWindow(windowOptions);
  win.setMenu(null);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('maximize', () => {
    win.webContents.send('window:maximized-change', true);
  });

  win.on('unmaximize', () => {
    win.webContents.send('window:maximized-change', false);
  });

  win.on('enter-full-screen', () => {
    win.webContents.send('window:fullscreen', true);
  });

  win.on('leave-full-screen', () => {
    win.webContents.send('window:fullscreen', false);
  });

  win.on('close', event => {
    if (!quitting) {
      event.preventDefault();
      win.hide();
      showNotice('Grautam continua em execução na bandeja do sistema.');
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('mailto:') || url.startsWith('https://')) {
      shell.openExternal(url).catch(err => console.error('Erro ao abrir link externo:', err));
    }
    return { action: 'deny' };
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  return win;
}

function installTray() {
  if (tray || !iconPath) return;
  try {
    tray = new Tray(iconPath);
    tray.setToolTip('Grautam — Passagens e Viagens');
    tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Abrir Grautam Viagens',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Encerrar Grautam',
        click: () => {
          quitting = true;
          app.quit();
        }
      }
    ]));

    tray.on('double-click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    tray.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.error('Falha ao instalar bandeja:', err);
  }
}

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

ipcMain.handle('app:request', async (event, channel, payload) => {
  if (!ALLOWED_CHANNELS.has(channel)) {
    throw new Error('Solicitação não autorizada.');
  }

  const senderWin = BrowserWindow.fromWebContents(event.sender);

  switch (channel) {
    case 'flights:search':
      return flights.searchFlights(payload || {});

    case 'flights:deals':
      return flights.getDeals();

    case 'flights:status':
      return flights.getFlightStatus(payload?.query);

    case 'flights:airports':
      return flights.getAirports();

    case 'currency:list':
      return currency.getAvailableCurrencies();

    case 'currency:convert':
      return {
        converted: currency.convertCurrency(payload?.amount || 0, payload?.target || 'BRL'),
        formatted: currency.formatPrice(payload?.amount || 0, payload?.target || 'BRL')
      };

    case 'analytics:get':
      return analytics.calculateTravelAnalytics(data.listBookings());

    case 'calendar:export':
      return calendar.generateIcsCalendar(payload || {});

    case 'receipt:html':
      return receipt.generateReceiptHtml(payload || {});

    case 'bookings:list':
      return data.listBookings();

    case 'bookings:create': {
      const booking = data.saveBooking(payload);
      data.addNotification({
        type: 'purchase',
        title: 'Bilhete Aéreo Emitido',
        message: `${booking.airline} (${booking.flightNumber}) · ${booking.originCode} → ${booking.destinationCode} · Localizador: ${booking.pnr}`
      });
      showNotice(
        `Localizador ${booking.pnr} · Voo ${booking.flightNumber} (${booking.originCode} → ${booking.destinationCode}) emitido com sucesso!`,
        'Passagem Confirmada'
      );
      return booking;
    }

    case 'bookings:cancel': {
      const canceled = data.cancelBooking(payload?.id);
      data.addNotification({
        type: 'flight',
        title: 'Reserva Cancelada',
        message: `Localizador ${canceled.pnr} cancelado. Estorno processado.`
      });
      showNotice(`A reserva ${canceled.pnr} foi cancelada com sucesso.`, 'Cancelamento de Reserva');
      return canceled;
    }

    case 'trips:list':
      return data.listTrips();

    case 'trips:save': {
      const trip = data.saveTrip(payload);
      data.addNotification({
        type: 'system',
        title: 'Viagem Salva na Agenda',
        message: `${trip.origin} → ${trip.destination} (${trip.date})`
      });
      return trip;
    }

    case 'trips:delete':
      data.deleteTrip(payload?.id);
      return true;

    case 'settings:get':
      return data.getSettings();

    case 'settings:set':
      return data.setSettings(payload);

    case 'notifications:list':
      return data.listNotifications();

    case 'notifications:clear':
      data.clearNotifications();
      return true;

    case 'notice:create':
      return data.addNotification(payload);

    case 'window:minimize':
      senderWin?.minimize();
      return true;

    case 'window:maximize':
      senderWin?.maximize();
      return true;

    case 'window:toggle-maximize': {
      if (!senderWin) return false;
      if (senderWin.isMaximized()) {
        senderWin.unmaximize();
        return false;
      } else {
        senderWin.maximize();
        return true;
      }
    }

    case 'window:is-maximized':
      return senderWin?.isMaximized() || false;

    case 'window:toggle-fullscreen': {
      if (!senderWin) return false;
      const next = !senderWin.isFullScreen();
      senderWin.setFullScreen(next);
      return next;
    }

    case 'window:close':
      senderWin?.hide();
      return true;

    case 'app:version':
      return app.getVersion();

    case 'support:send': {
      const email = String(payload?.email || '').trim();
      const subject = String(payload?.subject || '').trim();
      const message = String(payload?.message || '').trim();
      if (!email || !subject || !message) {
        throw new Error('Preencha e-mail, assunto e a mensagem.');
      }
      data.addNotification({
        type: 'system',
        title: 'Chamado de Suporte Registrado',
        message: `Assunto: ${subject}`
      });
      const query = new URLSearchParams({
        subject: `[Grautam Viagens] ${subject}`,
        body: `${message}\n\nContato: ${email}`
      });
      await shell.openExternal(`mailto:suporte@grautam.com?${query.toString()}`);
      showNotice('Chamado registrado. Seu e-mail foi aberto para envio.', 'Central de Atendimento');
      return { success: true };
    }

    default:
      throw new Error(`Canal não suportado: ${channel}`);
  }
});

// Single instance lock verificado antes do ready
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    mainWindow = createWindow();
    installTray();
    nativeTheme.themeSource = 'dark';

    app.on('activate', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isVisible()) {
          mainWindow.focus();
        } else {
          mainWindow.show();
        }
      } else {
        mainWindow = createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && quitting) {
    app.quit();
  }
});

app.on('before-quit', () => {
  quitting = true;
});
