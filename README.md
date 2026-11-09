# Grautam

Aplicativo desktop em Electron para acompanhar tráfego aéreo, planejar viagens e simular reservas. A interface usa Bootstrap e mantém os dados pessoais e preferências no dispositivo.

## Funcionalidades

- Painel de tráfego ADS-B, agenda, passagens, notificações, parceiros e suporte.
- Simulação local de pesquisa, compra e formas de pagamento; reservas demonstrativas não são transações reais.
- Tema escuro e notificações que podem ser gerenciadas pelo usuário.
- Armazenamento local validado, janelas auxiliares e opção para continuar na bandeja ao fechar a janela.
- Cliente OpenSky isolado no processo principal, com cache e intervalo de consulta conservador.

## Organização

- `src/main.js`: janelas, ciclo de vida, bandeja e validação de IPC.
- `src/preload.js`: ponte IPC mínima e isolada.
- `src/services/`: armazenamento validado e cliente OpenSky.
- `src/renderer/`: interface Bootstrap, estilos e lógica das telas.
- `assets/`: recursos visuais usados no aplicativo.

## Dados e segurança

OpenSky fornece posições e estados ADS-B; não fornece confirmação comercial de horários, cancelamentos, assentos, reservas ou modelos de aeronave. A interface identifica informações demonstrativas. Reservas e pagamentos são simulações locais: para vender passagens, é necessário integrar um provedor autorizado e um backend de reservas/pagamentos. Não coloque segredos de API no renderer.

## Desenvolvimento local

Requer Node.js 22. `npm ci` instala as dependências e `npm start` abre o aplicativo. `npm run dist` gera o instalador NSIS para Windows, `dist/Grautam Setup.exe`.

## Download pelo GitHub

O workflow **Build Grautam for Windows** compila o instalador em pushes para `main` e pode ser iniciado manualmente em **Actions**. O `.exe` fica disponível como artefato da execução por 30 dias. Para publicar um download permanente, crie e envie uma tag no formato `v1.0.1`; o workflow cria uma GitHub Release com o instalador anexado.

## Projeto SQL de aeroportos

Os arquivos `Airport.session.sql` e `schema.sql` existentes neste repositório documentam o projeto relacional de aeroportos, aeronaves, voos, clientes e reservas.
