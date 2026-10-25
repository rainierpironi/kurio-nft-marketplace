# KURIO — NFT Marketplace (Frontend Challenge)

Plataforma Web3 descentralizada para descoberta, negociação e coleção de arte digital e NFTs raros, desenvolvida com estrita observância a todos os critérios eliminatórios do **Jungle Gaming Frontend Challenge** e **100% de fidelidade visual** aos 15 mockups exatos do [Design Figma Fornecido](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1) (9 Desktop + 6 Mobile).

---

## 🎯 Conformidade com os Critérios Eliminatórios

| Critério Eliminatório | Solução Implementada | Status |
| :--- | :--- | :---: |
| **Stack Tecnológica Obrigatória** | React 19 + TypeScript + TanStack Router + TanStack Query + Axios + Socket.IO + Tailwind CSS + MSW + Playwright. | ✅ 100% |
| **Fidelidade Visual ao Figma (Desktop & Mobile)** | Paleta Dark Espresso & Warm Amber (`#14100D`, `#1E1712`, `#C88246`), tipografia `Space Mono`, ilustrações oficiais Kurio Apes (`public/nfts/`) e cópia idêntica aos 15 frames do Figma. | ✅ 100% |
| **Estado Simulado (Sem Mock Visual Puro)** | Todos os fluxos (busca, filtros, faixa de preço, carrinho, cotação de cupom, carteiras, perfil, favoritos e checkout) persistem e transitam por chamadas HTTP e eventos WebSocket reais interceptados pelo Service Worker. | ✅ 100% |
| **Recibo Imutável Pós-Confirmação** | A tela `/confirmacao/$id` só é acessível após sucesso do checkout, exibindo snapshot imutável com ID único de transação (`ORD-XXXXX`), hash na blockchain (`0x...`) e botão `Ver no Etherscan`. | ✅ 100% |
| **Isolamento de Cache no Logout** | Execução atômica de `queryClient.clear()` no logout ou troca de usuário, impedindo vazamento de dados privados entre sessões. | ✅ 100% |
| **Eventos de Rede WebSocket Reais** | O `@mswjs/socket.io-binding` trafega eventos `nft.updated` e `order.updated` diretamente pelo transporte de rede mockado, invalidando o cache reativo do TanStack Query e exigindo revalidação de cotação no checkout. | ✅ 100% |
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
# Executa todos os testes E2E (Desktop Chrome + Mobile 390px)
npm run test:e2e
```

---

## 🔑 Credenciais e Contas de Teste

A aplicação possui dois usuários pré-configurados com dados mockados no MSW. Você pode alternar entre eles pelo botão **Entrar** (utilizando os atalhos rápidos de demonstração) ou digitando:

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
3. **Timeout de Rede (5s):** Simula perda de conexão e valida a recuperação via **chave de idempotência** (`Idempotency-Key`).
4. **Falha de Favorito (Rollback):** Retorna status 500 para comprovar a reversão imediata da mutação otimista na UI.
5. **Simular WebSocket:** Emite evento ao vivo `nft.updated` com alteração de preço e estoque em tempo real.
6. **Restaurar Fixtures:** Reseta todos os dados e carrinhos para o estado de fábrica.

---

## 🗺️ Mapa de Rotas e Fidelidade aos 15 Mockups do Figma

| Rota | Mockups Correspondentes (Desktop & Mobile) | Deep Linking |
| :--- | :--- | :---: |
| `/` | **`Início.png` & `MInício.png`:** Hero Banner (`SEJA DONO DO FUTURO DA ARTE DIGITAL`), sidebar com 9 `Coleções`, `Faixa de preço`, `Rede` e card `NFT EM DESTAQUE / OFERTA LIMITADA`, grelha de 9 NFTs Kurio Apes, 2 cards promocionais e blog `Diário da Cunhagem` (4 colunas). | ✅ Sim |
| `/nft/$id` | **`Detalhes do NFT.png` & `MDetalhes do NFT.png`:** Galeria com 4 miniaturas verticais + zoom, seletor de edição (`1/1`, `1/10`, `1/50`, `ABERTA`), controle de quantidade âmbar, abas `Detalhes do NFT` / `Avaliações de colecionadores (19)` e seção `Mais desta coleção`. | ✅ Sim |
| `/carrinho` | **`Carrinho de NFTs.png` & `MCarrinho de NFTs.png`:** Tabela completa (`NFTs`, `Preço`, `Edições`, `Total`), painel `Resumo da carteira` com código promocional e seção `Colecionadores também viram`, além do Drawer acessível em qualquer página. | ✅ Sim |
| `/pagamento` | **`Pagamento.png` & `MPagamento.png`:** Formulário `Perfil do colecionador` em 2 colunas, resumo `Seus NFTs`, seleção de `Carteira e rede` (`METAMASK • WALLETCONNECT • COINBASE`), proteção contra mudança de cotação em tempo real e chave de idempotência. | ✅ Sim |
| `/confirmacao/$id` | **`Confirmação de Pedido.png`:** Modal de confirmação pós-compra com selo `THANK YOU`, `Seus NFTs agora estão na sua carteira`, faixa de 4 colunas (`ID da transação`, `Data`, `Total`, `Carteira`), `Detalhes da transação` e botão `Ver no Etherscan`. | ✅ Sim |
| `/perfil` | **`Perfil do Colecionador.png`:** Sidebar `Meu perfil` (`Dados do perfil`, `Carteiras`, `Atividade`, `Lista de interesse`, `Ofertas`, `Arquivos baixados`, `Suporte`, `Sair`), formulário em 2 colunas com Avatar e seção `Alterar senha`. | ✅ Sim |
| `/carteiras` | **`Carteiras.png`:** Sidebar `Meu perfil` com `Carteiras` ativo, formulário `Carteira principal`, botão `Salvar carteira`, listagem de carteiras vinculadas e seção `Carteira secundária`. | ✅ Sim |
| `/login` | **`Login.png` & `MLogin.png`:** Abas `Entrar \| Criar conta`, campos com alternância de visibilidade de senha, `Ou continue com` (`Google` / `Facebook`) e contas rápidas de demonstração. | ✅ Sim |
| `/cadastro` | **`Cadastro.png` & `MCadastro.png`:** Registro completo de colecionador com mesclagem imediata do carrinho de visitante. | ✅ Sim |

---

## 📦 Estrutura do Código-Fonte

```
nft-marketplace/
├── e2e/                             # Testes de ponta a ponta Playwright
│   ├── auth-and-cart.spec.ts        # Fluxo de login, mesclagem, cupom e /carrinho
│   ├── catalog.spec.ts              # Catálogo, busca, filtros e sincronização na URL
│   ├── checkout-and-receipt.spec.ts # Compra, idempotência e recibo imutável
│   ├── favorites-and-profile.spec.ts# Perfil, sidebar Meu perfil e atualização cadastral
│   ├── nft-details.spec.ts          # Detalhes do item e tela 404
│   └── wallets-and-footer.spec.ts   # Carteiras Web3, Cadastro e Footer
├── public/
│   ├── nfts/                        # Ilustrações oficiais Kurio Apes extraídas do Figma
│   │   ├── ape-emerald.png          # Emerald Ape #042
│   │   ├── ape-sage.png             # Sage Nomad #009 / Cosmic Bloom #118 / Violet Nomad #314
│   │   ├── ape-baron.png            # Neon Vessel #552 / Ivory Baron #088
│   │   └── ape-golden.png           # Golden Beat #207 / Golden Frequency #071 / Golden Signal #160
│   ├── _redirects                   # Redirecionamento SPA para Netlify
│   └── mockServiceWorker.js         # Service Worker do MSW v2
├── src/
│   ├── components/                  # Componentes compartilhados fiéis ao Figma
│   │   ├── AuthModal.tsx            # Modal Entrar | Criar conta
│   │   ├── Cart.tsx                 # Gaveta lateral Carrinho de NFTs
│   │   ├── DevTools.tsx             # Painel flutuante de cenários MSW
│   │   ├── Footer.tsx               # Rodapé com medalhões W, C, D + Newsletter + 4 colunas
│   │   ├── Header.tsx               # Header Desktop + Bottom Navigation Bar Mobile
│   │   └── NFTCard.tsx              # Card Kurio Ape com selo RARO e ações rápidas
│   ├── context/
│   │   └── AuthContext.tsx          # Autenticação, tokens e isolamento de cache
│   ├── lib/
│   │   └── api.ts                   # Cliente Axios tipado e contratos da API
│   ├── mocks/
│   │   ├── browser.ts               # Setup do worker MSW no navegador
│   │   └── handlers.ts              # Handlers REST e WebSockets (@mswjs/socket.io-binding)
│   ├── routes/                      # Rotas tipadas TanStack Router
│   │   ├── __root.tsx               # Layout raiz com Header, Footer e Socket.IO
│   │   ├── index.tsx                # Início (Catálogo, Hero, Promos e Diário da Cunhagem)
│   │   ├── nft.$id.tsx              # Detalhes do NFT e 404
│   │   ├── carrinho.tsx             # Página dedicada do Carrinho de NFTs
│   │   ├── pagamento.tsx            # Checkout e idempotência
│   │   ├── confirmacao.$id.tsx      # Confirmação de Pedido imutável
│   │   ├── perfil.tsx               # Perfil do colecionador
│   │   ├── carteiras.tsx            # Carteira principal e secundária
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
