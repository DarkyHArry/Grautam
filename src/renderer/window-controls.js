// Controles de Janela Customizados (Claude Code Aesthetic)
const winApi = window.grautam;

document.addEventListener('DOMContentLoaded', () => {
  const btnMin = document.getElementById('winMinimize');
  const btnMax = document.getElementById('winMaximize');
  const btnClose = document.getElementById('winClose');
  const maxIcon = document.getElementById('winMaximizeIcon');

  if (btnMin) {
    btnMin.addEventListener('click', () => {
      winApi?.request('window:minimize').catch(() => {});
    });
  }

  if (btnMax) {
    btnMax.addEventListener('click', async () => {
      try {
        const isMax = await winApi?.request('window:toggle-maximize');
        updateMaxIcon(isMax);
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      winApi?.request('window:close').catch(() => {});
    });
  }

  function updateMaxIcon(isMaximized) {
    if (!maxIcon) return;
    if (isMaximized) {
      maxIcon.classList.remove('bi-square');
      maxIcon.classList.add('bi-files');
      if (btnMax) btnMax.title = 'Restaurar';
    } else {
      maxIcon.classList.remove('bi-files');
      maxIcon.classList.add('bi-square');
      if (btnMax) btnMax.title = 'Maximizar';
    }
  }

  // Sincronização via IPC caso a janela seja maximizada por duplo clique ou snap
  winApi?.onMaximizedChange?.((isMaximized) => {
    updateMaxIcon(isMaximized);
  });

  winApi?.onFullscreen?.((isFullscreen) => {
    document.body.classList.toggle('is-fullscreen', isFullscreen);
  });

  // Checagem inicial
  winApi?.request('window:is-maximized').then(updateMaxIcon).catch(() => {});
});
