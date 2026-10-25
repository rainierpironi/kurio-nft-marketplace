# KURIO — NFT Marketplace (Frontend Challenge)

Plataforma Web3 descentralizada para descoberta, negociação e coleção de arte digital e NFTs raros, desenvolvida com estrita observância a todos os critérios eliminatórios do **Jungle Gaming Frontend Challenge** e total fidelidade visual ao [Design Figma Fornecido](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1).

---

## 🎯 Conformidade com os Critérios Eliminatórios

| Critério Eliminatório | Solução Implementada | Status |
| :--- | :--- | :---: |
| **Stack Tecnológica Obrigatória** | React 19 + TypeScript + TanStack Router + TanStack Query + Axios + Socket.IO + Tailwind CSS + MSW + Playwright. | ✅ 100% |
| **Estado Simulado (Sem Mock Visual Puro)** | Todos os fluxos (busca, filtros, carrinho, cotação de cupom, carteiras, perfil, favoritos e checkout) persistem e transitam por chamadas HTTP e eventos WebSocket reais interceptados pelo Service Worker. | ✅ 100% |
| **Recibo Imutável Pós-Confirmação** | A tela `/confirmacao/$id` só é acessível após sucesso do checkout, exibindo snapshot imutável com ID único de transação (`ORD-XXXXX`), hash na blockchain (`0x...`) e link para o explorador de blocos. | ✅ 100% |
| **Isolamento de Cache no Logout** | Execução atômica de `queryClient.clear()` no logout ou troca de usuário, impedindo vazamento de dados privados entre sessões. | ✅ 100% |
| **Eventos de Rede WebSocket Reais** | O `@mswjs/socket.io-binding` trafega eventos `nft.updated` diretamente pelo transporte de rede mockado, invalidando o cache reativo do TanStack Query sem emissões diretas na UI. | ✅ 100% |
| **Cobertura de Testes E2E** | Suíte completa com **Playwright** cobrindo cenários de catálogo, filtros, deep links, carrinho, cupom, autenticação, checkout idempotente, carteiras e responsividade mobile (390px). | ✅ 100% |
| **Deploy com Deep Linking** | Arquivos `vercel.json` e `public/_redirects` inclusos para roteamento SPA sem erro 404 em qualquer host (Vercel, Netlify, Cloudflare). | ✅ 100% |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js 18+ (recomendado Node.js 20 ou 22)
* npm 9+

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Execução em Ambiente de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em `http://localhost:5173`. O Mock Service Worker (MSW) e os listeners de WebSocket serão inicializados automaticamente no navegador.

### 3. Build e Validação de Tipagem
```bash
npm run build
```

### 4. Visualização do Build de Produção
```bash
npm run preview
```

### 5. Execução dos Testes Ponta a Ponta (Playwright)
```bash
# Instala os binários de browser do Playwright (apenas na 1ª vez)
npx playwright install chromium

# Executa todos os testes E2E (Desktop Chrome + Mobile 390px)
npm run test:e2e
```

---

## 🔑 Credenciais e Contas de Teste

A aplicação possui dois usuários pré-configurados com dados mockados no MSW. Você pode alternar entre eles pelo botão **Entrar** (utilizando os atalhos rápidos) ou digitando:

| Usuário | E-mail | Senha Padrão | Carteira Principal | Saldo Simulado |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Nomad** | `alex@kurio.art` | `password123` | `0x71C...bFa3d` (Ethereum) | 4.85 ETH |
| **Sara Nova** | `sara@kurio.art` | `password123` | `0x38B...910Ec` (Polygon) | 12.40 MATIC |

### Cupons de Desconto Válidos
* `KURIO10` — 10% de desconto no valor total dos colecionáveis
* `GREENMINT20` — 20% de desconto em coleções selecionadas

---

## 🛠️ Painel Interativo de Teste (MSW DevTools)

Um botão flutuante **⚡ MSW DevTools** está disponível no canto inferior esquerdo para testar cenários determinísticos de resiliência:
1. **Sucesso Normal:** Operação fluida padrão de todas as rotas.
2. **Falha de Pagamento (402):** Simula recusa da rede ou saldo insuficiente no checkout.
3. **Timeout de Rede (5s):** Simula perda de conexão e valida a recuperação via **chave de idempotência** (`x-idempotency-key`).
4. **Falha de Favorito (Rollback):** Retorna status 500 para comprovar a reversão imediata da mutação otimista na UI.
5. **Simular WebSocket:** Emite evento ao vivo `nft.updated` com alteração de preço e estoque em tempo real.
6. **Restaurar Fixtures:** Reseta todos os dados e carrinhos para o estado de fábrica.

---

## 🗺️ Mapa de Rotas e Telas do Figma

| Rota | Descrição e Fidelidade Figma | Deep Linking |
| :--- | :--- | :---: |
| `/` | **Início & Catálogo:** Hero Banner, barra lateral de filtros (categorias, redes, ordenação, busca textual), grelha de produtos com Shimmer Skeletons, paginação, seção **Promos** (Crie sua Coleção & Top Criadores) e **Blog** (Guias Web3). | ✅ Sim |
| `/nft/$id` | **Detalhes do NFT:** Visualização em alta resolução, artista criador, histórico de preço, atributos/traits, seletor de quantidade e botão de compra/favorito. Tratamento elegante de 404 para IDs inexistentes. | ✅ Sim |
| `/pagamento` | **Pagamento & Checkout:** Formulário de perfil de cobrança, seleção de carteira destino, métodos de pagamento, resumo do pedido com taxas de gas e chave de idempotência. | ✅ Sim |
| `/confirmacao/$id` | **Confirmação de Pedido:** Recibo imutável pós-compra contendo hash criptográfico simulado da transação e link para o explorador de blocos. | ✅ Sim |
| `/perfil` | **Perfil do Colecionador:** 4 abas completas (Editar Perfil, Carteiras Conectadas, NFTs Favoritados e Segurança). | ✅ Sim |
| `/carteiras` | **Gestão de Carteiras:** Conexão simulada de provedores (MetaMask, Coinbase, Phantom, WalletConnect), definição de carteira principal e exclusão. | ✅ Sim |
| `/login` | **Acesso / Login:** Tela dedicada com login tradicional, atalhos rápidos de teste e link para registro. | ✅ Sim |
| `/cadastro` | **Cadastro / Registro:** Formulário de registro com validação de credenciais e mesclagem imediata do carrinho de visitante. | ✅ Sim |

---

## 📱 Responsividade e Acessibilidade

* **Breakpoints:** Interface desktop fluida (1440px / 1200px) e adaptação estrita para telas móveis (390px, validada pelo projeto `mobile` do Playwright).
* **Acessibilidade:** Navegação por teclado, rótulos semânticos `aria-label`, foco gerenciado em modais, contraste de cores e notificações sonoras/visuais com Sonner.
* **Componente Footer:** Totalmente alinhado às especificações do frame `Desktop / Início` (Medalhões de recursos, Newsletter, links institucionais, status da rede Ethereum e chips de carteiras).

---

## 📦 Estrutura do Código-Fonte

```
nft-marketplace/
├── e2e/                             # Testes de ponta a ponta Playwright
│   ├── auth-and-cart.spec.ts        # Fluxo de login, mesclagem e isolamento
│   ├── catalog.spec.ts              # Catálogo, busca, filtros e sincronização na URL
│   ├── checkout-and-receipt.spec.ts # Compra, idempotência e recibo imutável
│   ├── favorites-and-profile.spec.ts# Perfil, abas e atualização cadastral
│   ├── nft-details.spec.ts          # Detalhes do item e tela 404
│   └── wallets-and-footer.spec.ts   # Carteiras Web3 e Footer
├── public/
│   ├── _redirects                   # Redirecionamento SPA para Netlify
│   ├── favicon.svg                  # Ícone Kurio
│   ├── icons.svg                    # Sprite SVG de redes sociais
│   └── mockServiceWorker.js         # Service Worker do MSW v2
├── src/
│   ├── components/                  # Componentes reutilizáveis (shadcn + design system)
│   │   ├── AuthModal.tsx            # Modal de login/cadastro rápido
│   │   ├── Cart.tsx                 # Gaveta lateral de carrinho e cupom
│   │   ├── DevTools.tsx             # Painel flutuante de cenários MSW
│   │   ├── Footer.tsx               # Rodapé completo (Medalhões + Newsletter + Links)
│   │   ├── Header.tsx               # Cabeçalho com auth, navegação e carrinho
│   │   ├── NFTCard.tsx              # Card de NFT com favorito otimista
│   │   └── skeleton.tsx             # Shimmer skeleton animado
│   ├── context/
│   │   └── AuthContext.tsx          # Autenticação, tokens e isolamento de cache
│   ├── lib/
│   │   ├── api.ts                   # Cliente Axios tipado e contratos da API
│   │   └── utils.ts                 # Utilitários de classes CSS (cn)
│   ├── mocks/
│   │   ├── browser.ts               # Setup do worker MSW no navegador
│   │   └── handlers.ts              # Handlers REST e WebSockets (@mswjs/socket.io-binding)
│   ├── routes/                      # Rotas tipadas TanStack Router
│   │   ├── __root.tsx               # Layout raiz com Header, Footer e Socket.IO
│   │   ├── index.tsx                # Catálogo, Hero, Promos e Blog
│   │   ├── nft.$id.tsx              # Detalhes do NFT e 404
│   │   ├── pagamento.tsx            # Checkout e idempotência
│   │   ├── confirmacao.$id.tsx      # Recibo imutável
│   │   ├── perfil.tsx               # Perfil do colecionador
│   │   ├── carteiras.tsx            # Gestão de carteiras Web3
│   │   ├── login.tsx                # Tela dedicada de login
│   │   └── cadastro.tsx             # Tela dedicada de cadastro
│   ├── main.tsx                     # Ponto de entrada com ativação do MSW
│   └── routeTree.gen.ts             # Árvore gerada de rotas tipadas
├── ARCHITECTURE.md                  # Decisões de arquitetura e padrões técnicos
├── playwright.config.ts             # Configuração do Playwright
├── vercel.json                      # Roteamento SPA para Vercel
└── vite.config.ts                   # Configuração do Vite com TanStack Router plugin
```

---

## 📄 Licença
Desenvolvido para fins de avaliação técnica no Desafio Frontend da **Jungle Gaming**.
