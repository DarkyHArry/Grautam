# Grautam — Sistema de Vendas de Passagens Aéreas

Aplicativo desktop em Electron para pesquisa, venda e emissão de passagens aéreas nacionais e internacionais. A interface segue a identidade visual **Claude Code** (paleta obsidian aconchegante, acentos terracota, tipografia editorial e fontes monoespaçadas para códigos IATA, PNR e tarifas).

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

## Estrutura do Projeto

- `src/main.js`: processo principal Electron, ciclo de vida da aplicação, bandeja do sistema e validação segura de IPC.
- `src/preload.js`: ponte de comunicação segura e isolada entre processos.
- `src/services/store.js`: gerenciamento persistente local de reservas, passagens, notificações e preferências via `electron-store`.
- `src/services/flights.js`: motor comercial de rotas, tarifas dinâmicas, companhias aéreas e ofertas.
- `src/renderer/`: interface do usuário unificada (SPA), estilos Claude Code (`styles.css`), controle de janelas (`window-controls.js`) e lógica de interação (`app.js`).
- `assets/`: ícones e recursos visuais do Grautam.

## Execução e Empacotamento

Requer Node.js 22.

```bash
# Instalar dependências
npm install

# Iniciar em ambiente de desenvolvimento
npm start

# Gerar instalador executável para Windows (NSIS)
npm run dist
```
