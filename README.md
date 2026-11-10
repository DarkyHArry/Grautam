<div align="center">

# Grautam Viagens
### Sistema Comercial Desktop de Vendas de Passagens Aéreas & Telemetria em Tempo Real

[![Electron](https://img.shields.io/badge/Electron-39.8.10-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Theme](https://img.shields.io/badge/Theme-LATAM_Official_Dark-E6004C?style=for-the-badge&logo=latam-airlines&logoColor=white)](#identidade-visual-oficial-latam-airlines)
[![Tests](https://img.shields.io/badge/Tests-Passing_100%25-2FD080?style=for-the-badge&logo=checkmarx&logoColor=white)](#suite-de-testes)
[![OpenSky Network](https://img.shields.io/badge/API-OpenSky_ADS--B_Live-0078D2?style=for-the-badge&logo=radar&logoColor=white)](#radar-de-voos-em-tempo-real-api-publica-ads-b)
[![ExchangeRate API](https://img.shields.io/badge/API-ExchangeRate_Live-F59E0B?style=for-the-badge&logo=cashapp&logoColor=white)](#conversor-multimoedas-ao-vivo)
[![Platform](https://img.shields.io/badge/Platform-Windows_x64-0078D6?style=for-the-badge&logo=windows&logoColor=white)](#instalacao-e-execucao)

<p align="center">
  <b>Grautam Viagens</b> é uma aplicação desktop nativa de alta fidelidade desenvolvida em Electron para emissão, reserva, telemetria de tráfego aéreo e demonstração comercial de passagens aéreas. O software adota o <b>Modo Escuro com as cores oficiais da LATAM Airlines</b>, combinando tipografia editorial, controles frameless fluidos e integração com APIs públicas em tempo real.
</p>

</div>

---

## Sumário

- [Destaques da Versão](#destaques-da-versao)
- [Identidade Visual Oficial LATAM Airlines](#identidade-visual-oficial-latam-airlines)
- [Menu de Navegação Rápida no Topo](#menu-de-navegacao-rapida-no-topo)
- [Radar de Voos Ao Vivo (API Pública OpenSky)](#radar-de-voos-em-tempo-real-api-publica-ads-b)
- [Simulador Interativo de Pagamentos](#simulador-de-geracao-de-pagamentos-demonstrativos)
- [Conversor Multimoedas Ao Vivo](#conversor-multimoedas-ao-vivo)
- [Módulos e Funcionalidades do Sistema](#funcionalidades-completas)
- [Arquitetura e Estrutura de Diretórios](#arquitetura-do-projeto)
- [Instalação e Execução](#instalacao-e-execucao)
- [Suíte de Testes Automatizados](#suite-de-testes)
- [Otimizações de Memória e Energia](#otimizacoes-de-memoria-e-energia)

---

## Destaques da Versão

- **Radar ADS-B em Tempo Real via API Pública**: Consulta ao vivo de transponders de tráfego aéreo sobre o espaço aéreo via **OpenSky Network**, identificando aeronaves comerciais (**LATAM**, **GOL**, **Azul**, **TAP**), altitude em níveis de voo (FL) e metros, velocidade solo em km/h e bússola com rotação magnética.
- **Menu de Navegação Rápida Superior**: Barra de ações prioritárias no topo do container principal para acesso em um clique aos recursos essenciais da aplicação.
- **Simulador de Pagamentos com Demonstração Completa**:
  - **PIX Instantâneo**: QR Code vetorial dinâmico em SVG, chave EMV oficial do Banco Central, cronômetro regressivo de 15 minutos e botão **"Simular Pagamento Concluído"** que dispara aprovação instantânea com ID End-to-End no SPI e recibo fiscal.
  - **Cartão de Crédito 3D**: Cartão holográfico com chip EMV metálico, preenchimento de teste em 1 clique (LATAM Pass Visa Infinite ou Mastercard Black) e simulação de parcelas em até 12x sem juros.
  - **Boleto Bancário**: Linha digitável Febraban de 47 dígitos, código de barras visual e simulação de compensação bancária.
- **Cotação de Câmbio em Tempo Real**: Conexão com a ExchangeRate-API com conversão precisa entre Real (BRL), Dólar (USD) e Euro (EUR), eliminando o bug de contraste do Windows em elementos `<select>` e `<option>`.
- **Identidade LATAM Airlines Dark Mode**: Paleta completa inspirada na frota noturna da LATAM (Deep Midnight Indigo e Coral Red), eliminando completamente termos legados.
- **Economia de Energia e Memória**: `backgroundThrottling: true`, desativação de corretores redundantes (`spellcheck: false`), e suspensão automática de timers de radar quando a janela é minimizada via evento nativo `visibilitychange`.

---

## Identidade Visual Oficial LATAM Airlines

A interface adota a consagrada linguagem de design aeroespacial da LATAM:

| Elemento | Token CSS | Cor HEX | Finalidade |
| :--- | :--- | :--- | :--- |
| **Canvas Principal** | `--bg-canvas` | `#0e001c` | Fundo índigo meia-noite ultra-profundo |
| **Superfície dos Cards** | `--bg-surface` | `#160228` | Superfície elevada para cartões e formulários |
| **Superfície Elevada** | `--bg-surface-elevated` | `#1f0538` | Menus, popovers e modais |
| **Acento LATAM Coral** | `--latam-coral` | `#e6004c` | Vermelho coral icônico para CTAs e status |
| **Hover Coral** | `--latam-coral-hover` | `#ff1a66` | Feedback interativo iluminado |
| **Bordas Sutis** | `--border-subtle` | `#2d0b4e` | Delimitação sutil de blocos |
| **Bordas Médias** | `--border-medium` | `#411370` | Destaque e divisores |
| **Texto Primário** | `--text-primary` | `#fcfaff` | Branco com nuance lavanda para máximo contraste |
| **Texto Secundário** | `--text-secondary` | `#c2b4d8` | Lilás suave legível sem fadiga visual |
| **Sucesso / No Horário** | `--status-emerald` | `#2fd080` | Confirmações bancárias e voos pontuais |

---

## Menu de Navegação Rápida no Topo

Fixado no topo da área principal, logo abaixo do cabeçalho, permite navegação ágil para:

1. `Buscar Voos`: Abre a busca comercial de passagens e foca o campo de origem.
2. `Radar Ao Vivo (API)`: Alterna diretamente para o radar ADS-B de aeronaves.
3. `Simular Pagamento`: Abre o gerador de pagamentos demonstrativos com QR Code e Cartão 3D.
4. `Último Bilhete`: Abre o cartão de embarque digital com código de barras da última reserva.
5. `Ofertas Relâmpago`: Exibe as tarifas promocionais do dia com até 40% de desconto.
6. `Cotação Moedas`: Sincroniza as taxas de câmbio ao vivo e exibe toast com a cotação atual.
7. `Ajuda ANAC`: Exibe os direitos do passageiro e regras da Resolução 400 da ANAC.

---

## Radar de Voos em Tempo Real (API Pública ADS-B)

O módulo de radar conecta-se à API pública da **OpenSky Network**:

- **Filtros por Companhia**: LATAM Airlines, GOL, Azul, TAP Air Portugal ou Todos os Voos.
- **Busca por Prefixo / Callsign**: Filtro instantâneo por código de voo (ex: `TAM3012`, `GLO1420`).
- **Métricas do Espaço Aéreo**: Total de aeronaves no setor, quantidade de voos comerciais LATAM no ar e altitude média calculada.
- **Cards de Telemetria**: Indicador de voo em subida, cruzeiro ou aproximação, velocidade solo em km/h, altitude em pés/metros e bússola magnética com ângulo real.
- **Pesquisa Comercial Direta**: Botão "Pesquisar Tarifa" em qualquer aeronave para encontrar voos de passageiros correspondentes na mesma rota.
- **Atualização Automática**: Polling inteligente a cada 25 segundos com contagem regressiva visível e suspensão automática se o app for minimizado.

---

## Simulador de Geração de Pagamentos Demonstrativos

Criado especificamente para apresentações e validações de fluxo comercial:

### 1. PIX Instantâneo (Banco Central)
- Renderização dinâmica do **QR Code em vetor SVG** puro (sem dependência de APIs externas de imagem).
- Campo com **chave Copia e Cola EMV** oficial do BACEN com botão de cópia com um clique.
- Cronômetro regressivo de validade (15:00 min).
- Botão **"Simular Pagamento Concluído"**:
  - Simula o recebimento do webhook do Sistema de Pagamentos Instantâneos (SPI).
  - Exibe tela de confirmação verde com ID de Transação End-to-End (`E00416968...`), carimbo de data/hora e notificação nativa no sistema.

### 2. Cartão de Crédito 3D
- Visualização tridimensional interativa do cartão com textura metálica e chip EMV dourado.
- Botões de auto-preenchimento: **LATAM Pass Visa Infinite** e **Mastercard Black**.
- Simulador de parcelas sem juros (**1x até 12x**) calculado em tempo real sobre o valor selecionado.
- Botão **"Processar Transação de Teste"** com simulação de autenticação 3DS 2.0 e código de autorização `#AUT-948120`.

### 3. Boleto Bancário
- Linha digitável Febraban de 47 dígitos calculada sobre a tarifa.
- Código de barras visual renderizado.
- Botão para simulação de compensação bancária automática.

---

## Conversor Multimoedas Ao Vivo

- Conexão em tempo real com `https://open.er-api.com/v6/latest/BRL`.
- Suporte nativo e bidirecional a **Real (BRL - R$)**, **Dólar Americano (USD - US$)** e **Euro (EUR - €)**.
- Recalcula instantaneamente os preços em todas as telas: resultados de busca, ofertas do dia, taxas de bagagem, seleção de assentos e simulador de pagamentos.
- **Correção de Contraste no Modo Escuro**: Estilização explícita com `color-scheme: dark`, garantindo que os menus suspensos `<select>` e `<option>` tenham fundo escuro e tipografia com contraste nítido no Windows Chromium.

---

## Funcionalidades Completas

- **Busca de Passagens**: Rotas nacionais e internacionais (GRU, GIG, BSB, SDU, SSA, REC, FOR, LIS, MIA, etc.).
- **Mapa de Assentos**: Seleção interativa de poltronas padrão, janela, corredor ou espaço extra.
- **Reserva e Emissão**: Geração de código PNR (`GTM-XXXXX`) e bilhete eletrônico e-Ticket.
- **Cartão de Embarque (Boarding Pass)**: Impressão direta e exportação de arquivo de calendário `.ics` (iCalendar) para Google Calendar e Apple Calendar.
- **Recibo Fiscal**: Discriminação de tarifa aérea base, taxas de embarque ANAC e serviços adicionais.
- **Grautam Miles**: Programa de fidelidade com acúmulo de milhas e categorias Silver, Gold e Platinum.
- **Direitos do Passageiro (ANAC Resolução 400)**: Informações sobre assistência material, atrasos, extravios e reembolso integral em até 24 horas.

---

## Arquitetura do Projeto

```
Grautam/
├── assets/                          # Ícones e recursos gráficos da aplicação
│   └── grautam.ico
├── src/
│   ├── main.js                      # Processo principal Electron, IPC e Single-Instance
│   ├── preload.js                   # Ponte isolada contextBridge (Canais seguros)
│   ├── services/
│   │   ├── airports.js              # Base de aeroportos IATA e cálculo de distâncias
│   │   ├── analytics.js             # Estatísticas de gastos e destinos do passageiro
│   │   ├── baggage.js               # Cálculo de franquias e tarifas de bagagem
│   │   ├── calendar.js              # Gerador de arquivos iCalendar (.ics)
│   │   ├── currency.js              # Serviço de taxas de câmbio em tempo real (API)
│   │   ├── flights.js               # Motor de busca de rotas e ofertas
│   │   ├── i18n.js                  # Dicionários de internacionalização
│   │   ├── liveFlights.js           # Telemetria ADS-B pública OpenSky Network
│   │   ├── miles.js                 # Motor de pontuação do programa de fidelidade
│   │   ├── pricing.js               # Cálculo tarifário e taxas ANAC
│   │   ├── receipt.js               # Gerador de recibos fiscais com taxas discriminadas
│   │   ├── seats.js                 # Mapa de assentos das aeronaves (A320 / B787)
│   │   └── store.js                 # Persistência local (electron-store)
│   └── renderer/
│       ├── index.html               # SPA principal da aplicação
│       ├── styles.css               # Tema oficial LATAM Dark Mode e componentes
│       ├── app.js                   # Lógica da interface, radar, câmbio e pagamentos
│       ├── window-controls.js       # Controles frameless nativos (minimizar/fechar)
│       └── vendor/                  # Fontes e ícones Bootstrap empacotados
├── tests/
│   ├── run-tests.js                 # Test runner integrado
│   ├── flights.test.js              # Testes de busca e cálculo geodésico
│   ├── store.test.js                # Testes de CPF, milhas e bagagem
│   └── liveFlights.test.js          # Testes de identificação ADS-B e câmbio
├── package.json
└── README.md
```

---

## Instalação e Execução

### Pré-requisitos
- **Node.js** 20.x ou 22.x LTS instalado.
- Sistema Operacional **Windows 10/11** (x64).

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/DarkyHArry/Grautam.git
cd Grautam

# 2. Instalar as dependências do projeto
npm install

# 3. Executar os testes automatizados
npm test

# 4. Iniciar a aplicação em modo de desenvolvimento
npm start

# 5. Gerar o instalador executável para Windows (Setup NSIS)
npm run dist
```

O instalador autônomo será gerado no diretório `dist/Grautam.Setup.exe`.

---

## Suíte de Testes

O projeto conta com testes unitários cobrindo todos os serviços comerciais e integrações:

```bash
npm test
```

### Resultados da Suíte:
- `flights.test.js`:
  - Busca de voos com parâmetros dinâmicos.
  - Cálculo de distância geodésica IATA (ex: rota GRU-GIG).
  - Cálculo de tarifas de embarque domésticas e internacionais da ANAC.
  - Aplicação de desconto de 5% no PIX.
- `store.test.js`:
  - Validação documental de CPF do passageiro.
  - Cálculo de acúmulo de pontos no programa de milhas.
  - Franquia e tarifação de bagagem despachada.
  - Exportação e formatação de arquivos `.ics`.
- `liveFlights.test.js`:
  - Identificação de companhias aéreas pelo callsign ADS-B (LATAM, GOL, Azul, TAP).
  - Resiliência com fallback comercial em tempo real.
  - Conversão e precisão bidirecional multimoedas (BRL, USD, EUR).

---

## Otimizações de Memória e Energia

1. **Throttling em Segundo Plano**: `backgroundThrottling: true` habilitado nas preferências da janela web para reduzir o consumo de ciclos de CPU quando o aplicativo está oculto.
2. **Desativação de Spellcheck**: `spellcheck: false` configurado para economizar memória RAM associada ao corretor ortográfico nativo do Chromium.
3. **Pausamento Reativo de Polling**: O evento `visibilitychange` interrompe imediatamente as chamadas à API OpenSky e os cronômetros regressivos quando a janela é minimizada, retomando-os assim que o usuário retorna ao aplicativo.
4. **Debounce em Buscas**: Entradas de texto em filtros de radar e voos utilizam debounce para evitar re-renderizações e repaints desnecessários do DOM.

---

## Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

<div align="center">
  <b>Grautam Viagens</b> · Conectando você ao mundo com alta tecnologia e segurança.
</div>
