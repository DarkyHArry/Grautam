# Arquitetura do Sistema Grautam Viagens

Este documento descreve a organização técnica, padrões de design e comunicação entre processos do aplicativo desktop **Grautam Viagens**.

---

## 1. Visão Geral da Arquitetura

O Grautam foi construído sobre o ecossistema **Electron**, utilizando arquitetura de processo duplo desacoplado:

- **Processo Principal (Main Process)**: Responsável pelo ciclo de vida da aplicação nativa, gerenciamento da janela frameless, atalhos de sistema, bandeja (tray), notificações nativas do sistema operacional e acesso ao armazenamento de dados via `electron-store`.
- **Preload Script (`src/preload.js`)**: Ponte segura e estritamente tipada utilizando `contextBridge` e `ipcRenderer`, sem expor módulos internos do Node.js ao navegador (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).
- **Processo de Renderização (Renderer Process)**: Interface do usuário SPA (Single Page Application) responsiva, desenvolvida em HTML5, CSS3 com design system inspirado no **Claude Code** da Anthropic e JavaScript ES6+ moderno.

---

## 2. Padrão Visual Claude Code

A interface adota a estética minimalista e acolhedora do Claude Code:
- **Canvas Base**: `#181816` (Warm Obsidian)
- **Barra Lateral & Título**: `#131211`
- **Superfícies Elevadas**: `#1e1e1b` com bordas sutis em `#2b2a26`
- **Acento Terracota/Argila**: `#d97736` e `#e68847`
- **Tipografia**:
  - *Display*: Serif editorial elegante (`Tipperary`, `Copernicus`, `Charter`, `Georgia`)
  - *Interface*: Sans-serif contemporânea de alta legibilidade
  - *Dados Técnicos*: Fontes monoespaçadas (`Geist Mono`, `JetBrains Mono`) para códigos IATA, PNR, assentos e valores monetários.

---

## 3. Serviços Modulares (`src/services/`)

- `flights.js`: Motor de busca de voos, cálculo de tarifas dinâmicas, rotas e ofertas.
- `airports.js`: Catálogo global com IATA, ICAO, coordenadas geodésicas e cálculo de distâncias em km.
- `store.js`: Camada de persistência local para reservas, bilhetes, preferências e histórico de notificações.
- `currency.js`: Conversão monetária em tempo real (BRL, USD, EUR) e formatação internacional.
- `miles.js`: Programa de fidelidade Grautam Miles com categorias (Silver, Gold, Platinum, Black).
- `baggage.js`: Calculadora de franquia de bagagem e excesso de peso conforme normas regulatórias.
- `pricing.js`: Yield management e cálculo de taxas de embarque aeroportuárias (ANAC/INFRAERO).
- `seats.js`: Mapa de assentos da aeronave com categorias (Executiva, Espaço +, Padrão).
- `receipt.js`: Gerador de comprovante fiscal de compra e discriminação de tarifas.
- `weather.js`: Previsão meteorológica para os aeroportos de destino.
- `insurance.js`: Apólices de seguro viagem e certificados de assistência 24h.
- `checkin.js`: Regras de elegibilidade para check-in antecipado (48h a 1h antes).
- `barcode.js`: Gerador de código de barras vetorial SVG no padrão IATA BCBP (Res. 792).
- `calendar.js`: Exportador de eventos de voo no padrão RFC 5545 iCalendar (`.ics`).

---

## 4. Especificação de Canais IPC (`app:request`)

| Canal IPC | Parâmetros | Descrição |
| :--- | :--- | :--- |
| `flights:search` | `{ origin, destination, date, passengers, cabinClass, directOnly, airline }` | Retorna voos comerciais disponíveis com tarifas dinâmicas |
| `flights:deals` | — | Retorna catálogo de ofertas promocionais do dia |
| `flights:status` | `{ query }` | Retorna status de partidas e chegadas de voos |
| `bookings:list` | — | Lista todas as reservas e bilhetes emitidos |
| `bookings:create` | `bookingPayload` | Emite bilhete eletrônico, gera PNR e armazena localmente |
| `bookings:cancel` | `{ id }` | Cancela reserva e processa estorno simulado |
| `currency:convert`| `{ amount, target }` | Converte valor monetário para a moeda especificada |
| `calendar:export` | `booking` | Gera string no formato iCalendar (.ics) para exportação |
| `receipt:html` | `booking` | Gera documento HTML formatado do comprovante fiscal |
| `window:minimize` | — | Minimiza a janela para a barra de tarefas |
| `window:toggle-maximize` | — | Alterna entre maximizado e tamanho restaurado |
| `window:close` | — | Oculta janela para a bandeja do sistema |

