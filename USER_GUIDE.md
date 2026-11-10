# Guia do Usuário — Grautam Viagens

Manual de utilização do sistema de pesquisa, reserva, telemetria e emissão de passagens aéreas **Grautam Viagens**.

---

## 1. Menu de Navegação Rápida no Topo

Localizado logo abaixo da barra superior da janela, este menu permite acionar imediatamente os recursos mais importantes do sistema com um único clique:

- **⚡ Buscar Voos**: Redireciona para o formulário de pesquisa e foca no campo de origem.
- **📡 Radar Ao Vivo (API)**: Abre o radar ADS-B conectado à rede pública OpenSky Network.
- **💳 Simular Pagamento**: Abre o simulador interativo de pagamentos PIX, Cartão 3D e Boleto.
- **🎫 Último Bilhete**: Abre instantaneamente o cartão de embarque digital da reserva mais recente.
- **🔥 Ofertas Relâmpago**: Leva diretamente às promoções do dia com descontos de até 40%.
- **💱 Cotação Moedas**: Atualiza em tempo real as taxas de câmbio (USD/EUR para BRL).
- **🆘 Ajuda ANAC**: Apresenta os direitos do passageiro conforme a Resolução nº 400 da ANAC.

---

## 2. Pesquisa e Comparação de Voos

1. Acesse a aba **Buscar Passagens** na barra lateral ou clique no botão rápido **Buscar Voos**.
2. Selecione o tipo de itinerário: **Ida e Volta** ou **Somente Ida**.
3. Escolha a **Origem** e o **Destino** (digite o nome da cidade ou o código IATA, ex: `GRU`, `GIG`, `LIS`, `MIA`).
4. Utilize o botão **⇄** para inverter rapidamente os aeroportos se desejar.
5. Selecione a **Data de Partida**, a quantidade de passageiros e a **Classe de Cabine** (Econômica, Premium Economy ou Executiva).
6. Clique em **Buscar Voos**.
7. Utilize os filtros superiores para refinar por companhia aérea específica (LATAM, GOL, Azul, TAP) ou apenas voos diretos.
8. Alterne entre as moedas **BRL (R$)**, **USD (US$)** ou **EUR (€)** a qualquer momento no seletor da barra superior.

---

## 3. Radar de Voos em Tempo Real (ADS-B OpenSky Network)

1. Clique na aba **Radar Ao Vivo** na barra lateral ou no botão de navegação rápida.
2. Veja as estatísticas do espaço aéreo em tempo real:
   - Total de aeronaves rastreadas.
   - Voos comerciais LATAM identificados no ar.
   - Altitude média de cruzeiro (em níveis de voo FL e metros).
   - Provedor e latência da telemetria ADS-B.
3. Utilize os chips de filtro para exibir **Apenas LATAM Airlines**, **GOL**, **Azul** ou **Voos Internacionais**.
4. Pesquise diretamente pelo prefixo ou callsign (ex: `TAM3012`, `GLO1420`).
5. Acompanhe a bússola giratória de proa magnética, altitude e velocidade solo.
6. Clique em **Pesquisar Tarifa** em qualquer voo do radar para encontrar passagens comerciais equivalentes na mesma rota.
7. O radar atualiza automaticamente a cada 25 segundos (com indicador regressivo). O polling é suspenso automaticamente se a janela for minimizada para poupar bateria e memória.

---

## 4. Simulador Interativo de Pagamentos Demonstrativos

O simulador permite testar e demonstrar o fluxo de cobrança e liquidação bancária de três formas:

### A. PIX Instantâneo (Banco Central do Brasil)
- Exibe o QR Code dinâmico em vetor SVG.
- Gera a chave copia-e-cola no padrão EMV oficial do Banco Central.
- Contagem regressiva de validade de 15 minutos.
- Clique em **Simular Pagamento Concluído (Aprovação Instantânea)**:
  - O sistema simula a confirmação do webhook do SPI (Sistema de Pagamentos Instantâneos).
  - Emite o ID de transação End-to-End (`E00416968...`).
  - Atualiza o status para liquidado e gera notificação no aplicativo.

### B. Cartão de Crédito 3D
- Cartão tridimensional interativo que reflete o número, titular e validade em tempo real.
- Botões de preenchimento automático para testes: **LATAM Pass Visa Infinite** ou **Mastercard Black**.
- Simulador de parcelamento sem juros de **1x até 12x** calculado na hora.
- Clique em **Processar Transação de Teste** para simular autenticação 3DS 2.0 e autorização adquirente.

### C. Boleto Bancário
- Linha digitável Febraban de 47 dígitos com botão de cópia.
- Código de barras visual renderizado.
- Botão para simular a compensação bancária em tempo real.

---

## 5. Escolha de Assento e Emissão (Checkout)

1. No card do voo desejado, clique em **Selecionar Voo**.
2. No mapa interativo de assentos, clique na poltrona de sua preferência (Janela, Corredor ou Meio).
3. Verifique ou preencha os dados do passageiro titular (Nome, CPF/Passaporte, E-mail e Telefone).
4. Opcionalmente, selecione bagagem despachada adicional (23kg) ou seguro viagem com proteção médica.
5. Selecione a forma de pagamento (PIX com 5% de desconto, Cartão em até 12x ou Boleto).
6. Clique em **Emitir Bilhete Eletrônico**.

---

## 6. Gestão de Reservas e Cartão de Embarque (Boarding Pass)

1. Acesse a aba **Minhas Reservas** ou use o botão **Último Bilhete** na barra rápida.
2. Clique em **Cartão de Embarque** para abrir o bilhete digital com portão, terminal, horário de apresentação e código de barras IATA.
3. Clique em **Imprimir Bilhete** para gerar o documento físico ou em **Salvar na Agenda (.ics)** para sincronizar automaticamente com o Google Calendar / Apple Calendar.
4. Para consultar o comprovante detalhado discriminado com taxas da ANAC, clique no botão **Recibo**.
5. Em caso de imprevistos, utilize o botão de **Cancelar Reserva** para solicitar o cancelamento e estorno imediato.

---

## 7. Regulamentação e Direitos do Passageiro (ANAC Resolução 400)

Clique no botão **Ajuda ANAC** na navegação rápida para consultar as regras vigentes sobre:
- **Atrasos superiores a 1h**: facilidades de comunicação.
- **Atrasos superiores a 2h**: alimentação adequada (vouchers).
- **Atrasos superiores a 4h**: hospedagem e reacomodação no próximo voo disponível.
- **Direito de Desistência**: cancelamento com 100% de reembolso sem multas em até 24h após a compra.
- **Extravio de Bagagem**: registro de RIB e prazos máximos de indenização.
