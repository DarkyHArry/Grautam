# Grautam

Aplicativo desktop em Electron para acompanhar tráfego aéreo, planejar viagens e simular reservas. A interface usa Bootstrap e mantém os dados pessoais e preferências no dispositivo.

## Funcionalidades

- Painel de tráfego ADS-B, agenda, passagens, notificações, parceiros e suporte.
- Simulação local de pesquisa, compra e formas de pagamento; reservas demonstrativas não são transações reais.
- Tema escuro e notificações que podem ser gerenciadas pelo usuário.
- Perfil local de passageiro com nome, contato, nascimento, nacionalidade e CPF/passaporte validados; dados e foto PNG/JPG são protegidos pela criptografia nativa do sistema operacional.
- Avatar otimizado no dispositivo (limite de 1,5 MB) e nome/foto exibidos no painel principal; o perfil pode ser atualizado ou excluído localmente.
- Transições sutis entre telas, respeito à preferência por movimento reduzido e pausa das consultas/dicas quando a janela fica oculta para reduzir atividade em segundo plano.
- Armazenamento local validado, janelas auxiliares e opção para continuar na bandeja ao fechar a janela.
- Cliente OpenSky isolado no processo principal, com cache e intervalo de consulta conservador.

## Organização

- `src/main.js`: janelas, ciclo de vida, bandeja e validação de IPC.
- `src/preload.js`: ponte IPC mínima e isolada.
- `src/services/`: armazenamento validado e criptografado para perfil local, mais cliente OpenSky.
- `src/renderer/`: interface Bootstrap, estilos e lógica das telas.
- `assets/`: recursos visuais usados no aplicativo.

## Dados e segurança

OpenSky fornece posições e estados ADS-B; não fornece confirmação comercial de horários, cancelamentos, assentos, reservas ou modelos de aeronave. A interface identifica informações demonstrativas. Reservas e pagamentos são simulações locais: para vender passagens, é necessário integrar um provedor autorizado e um backend de reservas/pagamentos. Não coloque segredos de API no renderer.

Dados de perfil e foto são mantidos neste computador com `safeStorage` do Electron. O aplicativo recusa salvar dados pessoais se o sistema não disponibilizar uma camada de criptografia segura. O perfil local não representa autenticação de servidor.

## Desenvolvimento local

Requer Node.js 22. `npm ci` instala as dependências e `npm start` abre o aplicativo. `npm run dist` gera o instalador NSIS para Windows, `dist/Grautam Setup.exe`.

## Download pelo GitHub

O workflow **Build Grautam for Windows** compila o instalador em pushes para `main` e pode ser iniciado manualmente em **Actions**. O `.exe` fica disponível como artefato da execução por 30 dias. Para publicar um download permanente, crie e envie uma tag no formato `v1.0.1`. O workflow agora não publica automaticamente releases; o instalador fica disponível no Actions como artefato.

## Projeto SQL de aeroportos

Os arquivos `Airport.session.sql` e `schema.sql` existentes neste repositório documentam o projeto relacional de aeroportos, aeronaves, voos, clientes e reservas.
