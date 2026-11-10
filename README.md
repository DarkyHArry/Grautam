# Grautam Viagens — Sistema Comercial de Vendas de Passagens Aéreas

Aplicativo desktop profissional em Electron para pesquisa, venda, telemetria e emissão de passagens aéreas nacionais e internacionais. A interface utiliza o **Modo Escuro com paleta oficial da LATAM Airlines** (Deep Midnight Indigo `#0e001c`, `#160228` com LATAM Coral Red `#e6004c`), combinando estética editorial de alta precisão com recursos avançados de tempo real.

---

## Novidades da Versão 1.2.2

- **Radar de Voos Ao Vivo em Tempo Real (API Pública ADS-B)**: Integração com a rede global pública **OpenSky Network**, rastreando em tempo real aeronaves comerciais no espaço aéreo com identificação automática de voos (LATAM, GOL, Azul, TAP), exibindo altitude em pés (FL) e metros, velocidade de solo (km/h), proa magnética com rotação dinâmica e status de voo (cruzeiro, subida, descida ou táxi).
- **Menu de Navegação Rápida no Topo**: Barra horizontal de alta prioridade posicionada no topo da interface para acesso instantâneo a ações críticas (`Buscar Voos`, `Radar Ao Vivo`, `Simular Pagamento`, `Último Bilhete`, `Ofertas Relâmpago`, `Cotação de Moedas` e `Ajuda ANAC`).
- **Simulador Interativo de Pagamentos**: Módulo dedicado para demonstrações comerciais:
  - **PIX Instantâneo**: Geração visual de QR Code em vetor SVG, chave copia-e-cola no padrão EMV Banco Central, contagem regressiva de 15 minutos e botão **"Simular Pagamento Concluído"** que dispara aprovação instantânea com ID End-to-End no SPI do Banco Central e emissão de recibo.
  - **Cartão de Crédito 3D**: Pré-visualização dinâmica tridimensional do cartão (chip metálico EMV, bandeira LATAM Pass Visa Infinite ou Mastercard Black), preenchimento automático para testes e simulador de parcelas de 1x até 12x sem juros.
  - **Boleto Bancário**: Linha digitável Febraban de 47 dígitos, código de barras visual e simulação de compensação bancária.
- **Conversão Multimoedas em Tempo Real**: Integração pública com a ExchangeRate-API com atualização de cotações entre Real (BRL), Dólar (USD) e Euro (EUR), com recálculo automático de tarifas e resolução do bug de contraste do Windows em elementos `<select>` e `<option>`.
- **Otimização de Memória e Energia**: Ativação de `backgroundThrottling: true`, desativação de `spellcheck`, e suspensão de temporizadores e polling ADS-B quando a janela é minimizada ou perde visibilidade via `visibilitychange`.
- **Regulamentação e Direitos do Passageiro ANAC**: Central de consulta da Resolução nº 400 da ANAC integrada à interface.

---

## Funcionalidades Principais

- **Pesquisa e Venda de Passagens**: busca rápida por cidades e códigos IATA (GRU, GIG, BSB, SSA, LIS, MIA, etc.), opções de ida/volta e só ida, classes Econômica, Premium e Executiva, além de filtros por companhia aérea e voos diretos.
- **Mapa de Assentos Interativo**: escolha visual de assentos em aeronaves (janela, meio e corredor) com indicação de assentos disponíveis e ocupados.
- **Checkout & Emissão Instantânea**: suporte a PIX com desconto automático de 5% e chave copia-e-cola/QR Code, Cartão de Crédito com parcelamento em até 12x sem juros e Boleto Bancário.
- **Minhas Reservas & Bilhetes**: controle de bilhetes emitidos, códigos localizadores PNR (`GTM-XXXXX`), status da reserva e cancelamento com estorno.
- **Cartão de Embarque Digital (Boarding Pass)**: visualização e impressão de cartão de embarque completo com dados do passageiro, voo, portão, terminal, assento e código de barras / QR Code.
- **Ofertas do Dia & Destinos em Alta**: vitrine de tarifas promocionais com preenchimento e busca imediata com um clique.
- **Rastreador de Voos Comerciais**: consulta de status em tempo real, horários previstos e portões de embarque.
- **Central de Atendimento ao Passageiro**: FAQ sobre franquia de bagagem (normas ANAC), cancelamentos e envio de chamados.
- **Janela e Controles Customizados**: barra de título frameless moderna, redimensionável, com controles nativos de minimizar, maximizar/restaurar e integração com a bandeja do sistema (tray).

---

## Estrutura do Projeto

- `src/main.js`: processo principal Electron, ciclo de vida da aplicação, bandeja do sistema, economia de energia e validação segura de IPC.
- `src/preload.js`: ponte de comunicação segura e isolada entre processos (`contextBridge`).
- `src/services/store.js`: gerenciamento persistente local de reservas, passagens, notificações e preferências via `electron-store`.
- `src/services/flights.js`: motor comercial de rotas, tarifas dinâmicas, companhias aéreas e ofertas.
- `src/services/liveFlights.js`: serviço de telemetria de voos em tempo real conectado à API pública OpenSky Network.
- `src/services/currency.js`: conversor de moedas conectado à ExchangeRate-API com cache e suporte a BRL, USD e EUR.
- `src/services/receipt.js`: gerador de recibos fiscais com discriminação de tarifas ANAC e serviços.
- `src/renderer/`: interface do usuário unificada (SPA), estilos oficiais LATAM Dark Mode (`styles.css`), controle de janelas (`window-controls.js`) e lógica de interação (`app.js`).
- `assets/`: ícones e recursos visuais do Grautam.
- `tests/`: suíte de testes unitários automatizados para busca de voos, validação documental de CPF, bagagem, milhas e telemetria.

---

## Execução e Testes

Requer Node.js 20+ ou 22+.

```bash
# Instalar dependências
npm install

# Executar suíte de testes unitários
npm test

# Iniciar em ambiente de desenvolvimento
npm start

# Gerar instalador executável para Windows (NSIS)
npm run dist
```
