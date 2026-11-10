# Changelog — Grautam Viagens

Todas as alterações notáveis deste projeto estão documentadas neste arquivo.

## [1.2.0] — 2026-11-10

### Adicionado
- **Design System Claude Code**: Interface completa com paleta Warm Obsidian (`#181816`), acentos Terracota (`#d97736`), tipografia editorial serifada e fontes monoespaçadas para códigos técnicos.
- **Janela Frameless Redimensionável**: Barra de título com controles nativos customizados de Minimizar, Maximizar/Restaurar dinâmico e Fechar para bandeja.
- **Motor de Busca de Voos Comerciais**: Cálculo dinâmico de tarifas, rotas nacionais e internacionais (GRU, GIG, BSB, SSA, LIS, MIA, etc.) e filtros por companhia aérea e voos diretos.
- **Mapa de Assentos Interativo**: Seleção visual de poltronas (Janela, Meio, Corredor, Executiva e Espaço +).
- **Checkout com Formas de Pagamento**: Suporte a PIX com desconto automático de 5% e QR Code, Cartão de Crédito em até 12x sem juros e Boleto Bancário.
- **Emissão Instantânea com PNR**: Geração de código localizador único e número de e-ticket com armazenamento persistente em `electron-store`.
- **Cartão de Embarque Digital (Boarding Pass)**: Visualização em estilo autêntico de bilhete aéreo, portão, terminal, código de barras IATA e impressão integrada.
- **Exportação para Agenda (.ics)**: Download de arquivo padrão iCalendar RFC 5545 compatível com Google Calendar, Apple Calendar e Outlook.
- **Recibo Fiscal Detalhado**: Discriminação de tarifas base, taxas de embarque ANAC e serviços adicionais.
- **Programa de Fidelidade Grautam Miles**: Controle de saldo de pontos, categorias (Silver, Gold, Platinum, Black) e benefícios de bagagem e embarque prioritário.
- **Previsão do Tempo nos Destinos**: Condições meteorológicas e temperaturas exibidas nos cards de voos e destinos.
- **Conversor Monetário em Tempo Real**: Suporte para alternância entre BRL (R$), USD ($) e EUR (€).
- **Suporte Multilíngue (i18n)**: Dicionários estruturados para Português (pt-BR), Inglês (en-US) e Espanhol (es-ES).
- **Suíte de Testes Automatizados**: Testes unitários para tarifas, busca, geodésia, PNR e fidelidade integrados via `npm test`.

### Removido
- Pasta e ícones não relacionados de segurança policial.
- Telas legadas desconectadas (`partners.html`, `bookings.html`, `support.html`).
- Módulo OpenSky ADS-B de rastreamento militar/não comercial da tela inicial.
