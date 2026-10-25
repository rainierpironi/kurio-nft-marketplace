# Arquitetura do Marketplace de NFTs — KURIO (Jungle Gaming Challenge)

Este documento detalha os contratos REST e eventos em tempo real, a política de sessão, o gerenciamento de estado do carrinho, a estratégia de cache e reconciliação entre REST e Socket.IO, bem como as decisões de UX, limitações e alinhamento com o Figma implementados na plataforma **KURIO**.

---

## 1. Visão Geral e Stack Tecnológica

| Camada | Tecnologia Adotada | Justificativa Técnica |
| :--- | :--- | :--- |
| **Interface & Tipagem** | React 19 + TypeScript (Strict) | Componentização declarativa, tipagem estática rigorosa de ponta a ponta e zero erros de compilação (`tsc -b`). |
| **Roteamento & URL State** | TanStack Router | Roteamento file-based com geração automática de árvore tipada (`routeTree.gen.ts`) e validação de search params via `validateSearch`. |
| **Estado Servidor & Cache** | TanStack Query v5 | Gerenciamento declarativo de cache, invalidação seletiva por chaves, mutações otimistas com rollback e limpeza atômica no logout. |
| **Cliente HTTP** | Axios | Instância única (`src/lib/api.ts`) com interceptor de requisição para injeção automática do cabeçalho `Authorization: Bearer`. |
| **Tempo Real** | Socket.IO Client + `@mswjs/socket.io-binding` | Interceptação real de pacotes WebSocket no navegador pelo Service Worker, permitindo eventos push (`nft.updated`, `order.updated`) desacoplados da UI. |
| **Mocking & Persistência** | Mock Service Worker (MSW) | Simulação realista de latência, erros HTTP (`400`, `401`, `402`, `404`, `409`, `500`), timeout de rede e persistência de estado em `localStorage` (`KURIO_MOCK_STATE_V2`) para suportar refresh (`F5`). |
| **Qualidade & Auditoria** | Playwright + Oxlint + Lighthouse CI | 14 testes E2E cobrindo fluxos críticos em Desktop e Mobile, linter estático rápido e configuração de auditoria em `lighthouserc.json`. |

---

## 2. Contratos REST e Eventos WebSocket (Socket.IO)

Todos os contratos abaixo são implementados em `src/mocks/handlers.ts` e consumidos exclusivamente via `src/lib/api.ts`.

### 2.1. Endpoints REST (`/api/*`)

| Método | Rota | Parâmetros / Payload | Resposta de Sucesso | Códigos de Erro Simulados |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/nfts` | Query: `q`, `category`, `network`, `sort`, `minPrice`, `maxPrice`, `page`, `limit` | `200 OK` `{ items: NFT[], total, page, limit, totalPages }` | `500` (quando cenário de erro ativo) |
| `GET` | `/api/nfts/:id` | Param: `id` (aceita `id` ou `tokenId`) | `200 OK` `NFT` | `404 Not Found` (item inexistente) |
| `POST` | `/api/auth/login` | Body: `{ email, password }` | `200 OK` `{ token, user }` | `401 Unauthorized` (credenciais inválidas) |
| `POST` | `/api/auth/register` | Body: `{ name, username, email, password }` | `201 Created` `{ token, user }` | `400 Bad Request` (e-mail já cadastrado) |
| `GET` | `/api/auth/me` | Header: `Authorization: Bearer <token>` | `200 OK` `{ user }` | `401 Unauthorized` |
| `GET` | `/api/cart` | Header opcional `Authorization` | `200 OK` `{ items: Array<{ nftId, quantity, nft }> }` | — |
| `POST` | `/api/cart` | Body: `{ nftId, quantity }` | `200 OK` `{ items }` | `400` (estoque insuficiente), `404` |
| `PATCH` | `/api/cart/:nftId` | Body: `{ quantity }` | `200 OK` `{ items }` | `400` (excede disponibilidade) |
| `DELETE` | `/api/cart/:nftId` | Param: `nftId` (`all` limpa o carrinho) | `200 OK` `{ items }` | — |
| `POST` | `/api/cart/merge` | Header: `Authorization: Bearer <token>` | `200 OK` `{ items, merged: true }` | `401 Unauthorized` |
| `GET` | `/api/checkout/quote` | Query opcional: `coupon` (`KURIO10`, `GREENMINT20`) | `200 OK` `{ subtotal, discount, gasFee: "0.016", total, validCoupon }` | — |
| `POST` | `/api/orders` | Header: `x-idempotency-key` + Body do checkout | `201 Created` `{ success: true, order }` ou `200 OK` `{ recovered: true, order }` | `400` (carrinho vazio), `402` (`payment_failed`), `409` (payload divergente para mesma chave), Network Error (`timeout`) |
| `GET` | `/api/orders/:id` | Param: `id` (`ORD-XXXXX`) | `200 OK` `{ order: ProcessedOrder }` | `404 Not Found` |
| `GET` | `/api/favorites` | Header: `Authorization` | `200 OK` `{ favorites: string[] }` | `401 Unauthorized` |
| `POST` | `/api/favorites` | Body: `{ nftId }` | `200 OK` `{ favorites: string[] }` | `401`, `500` (`favorites_fail` para testar rollback) |
| `DELETE` | `/api/favorites/:nftId` | Param: `nftId` | `200 OK` `{ favorites: string[] }` | `401`, `500` (`favorites_fail` para testar rollback) |
| `GET` | `/api/profile` | Header: `Authorization` | `200 OK` `{ user }` | `401 Unauthorized` |
| `PUT` | `/api/profile` | Body: `{ name, lastName, username, email, bio }` | `200 OK` `{ user }` | `401 Unauthorized` |
| `POST` | `/api/profile/password` | Body: `{ currentPassword, newPassword }` | `200 OK` `{ success: true, message }` | `400` (senha atual incorreta), `401` |
| `POST` | `/api/wallets` | Body: `{ address, network, label, walletType, isPrimary }` | `201 Created` `{ wallets: Wallet[] }` | `400` (endereço duplicado), `401` |
| `PATCH` | `/api/wallets/:id/primary` | Param: `id` | `200 OK` `{ wallets: Wallet[] }` | `401`, `404` |
| `DELETE` | `/api/wallets/:id` | Param: `id` | `200 OK` `{ wallets: Wallet[] }` | `400` (proibido remover única carteira principal), `401` |
| `POST` | `/api/simulation/reset` | Sem body | `200 OK` `{ success: true }` (restaura estado inicial de fábrica) | — |

### 2.2. Eventos WebSocket (`Socket.IO`)

A conexão é estabelecida em `src/routes/__root.tsx` forçando `transports: ['websocket']` para garantir a interceptação pelo `@mswjs/socket.io-binding`:

| Evento | Direção | Payload | Efeito na Aplicação |
| :--- | :--- | :--- | :--- |
| `admin.simulate_update` | Cliente → Servidor | *(vazio)* | Solicita ao MSW a mutação em tempo real de preço e disponibilidade de um NFT do catálogo. |
| `nft.updated` | Servidor → Cliente | `NFT` atualizado (`id`, `title`, `price`, `available`, ...) | Dispara toast informativo, invalida as queries `['nfts']`, `['cart']`, `['checkout-quote']`, `['nft', id]` e emite o evento de domínio `KURIO_NFT_UPDATED` para bloquear cotações defasadas em `/pagamento`. |
| `order.updated` | Servidor → Cliente | `{ orderId: string, status: 'confirmed' \| 'pending' \| 'rejected' }` | Notifica mudança de status da transação na blockchain e invalida `['orders']`. |

---

## 3. Política de Sessão e Isolamento de Dados

1. **Armazenamento de Token:** O token de sessão (`mock-token-usr-1`, `mock-token-usr-2`, etc.) é mantido em `localStorage['auth_token']` e injetado pelo interceptor do Axios em cada requisição.
2. **Hidratação Inicial:** Na montagem do `AuthProvider` (`src/context/AuthContext.tsx`), a aplicação valida o token via `GET /api/auth/me`.
3. **Isolamento Atômico no Logout e Troca de Conta:**
   - Ao executar `logout()` (pelo Header ou pela opção `Sair` na sidebar de `/perfil` e `/carteiras`), o token é removido do `localStorage`, o estado `user` é definido como `null` e **`queryClient.clear()` é invocado sincronamente**.
   - Isso garante que dados sensíveis da sessão anterior (favoritos, carteiras, perfil e carrinho autenticado) sejam imediatamente purgados da memória antes de qualquer nova renderização.

---

## 4. Estado do Carrinho (Visitante, Autenticado e Mesclagem)

1. **Separação no Backend Mockado:** O MSW mantém uma estrutura `visitorCart` (para usuários anônimos) e um dicionário `userCarts[userId]` (para colecionadores autenticados), ambos sincronizados em `localStorage['KURIO_MOCK_STATE_V2']` para resistir a recarregamentos de página (`F5`).
2. **Mesclagem Automática no Login/Cadastro (`POST /api/cart/merge`):**
   - Quando um visitante adiciona NFTs ao carrinho e em seguida faz login ou cria uma conta (via `AuthModal`, `/login` ou `/cadastro`), o `AuthContext` chama `await mergeCart()` antes de invalidar a query `['cart']`.
   - O MSW soma as quantidades dos itens do `visitorCart` ao `userCarts[user.id]`, respeitando o limite máximo de estoque disponível (`nft.available`), e limpa o `visitorCart`.
3. **Validação de Estoque e Conflitos:** Tanto no Drawer (`Cart.tsx`), quanto na página `/carrinho` e no checkout `/pagamento`, a quantidade solicitada é confrontada com `item.nft.available`. Caso uma atualização em tempo real reduza o estoque abaixo da quantidade no carrinho, um alerta destaca o item conflitante e oferece um botão de ajuste rápido de 1 clique.

---

## 5. Estratégia de Cache e Reconciliação entre REST e Socket.IO

- **Configuração do `QueryClient` (`src/main.tsx`):** `staleTime` de 5 minutos para leituras de catálogo, evitando refetches redundantes durante a navegação rápida entre páginas, combinado com invalidação cirúrgica após mutações e eventos WebSocket.
- **Chaves de Cache Padronizadas:**
  - `['nfts', { q, category, network, sort, page, minPrice, maxPrice }]`: listagem paginada e filtrada do catálogo.
  - `['nft', id]`: detalhes individuais do token.
  - `['cart']`: estado atual do carrinho (visitante ou autenticado).
  - `['checkout-quote', appliedCoupon, cartItems]`: cotação financeira (`subtotal`, `discount`, `gasFee`, `total`).
  - `['favorites']`: lista de IDs favoritados pelo usuário autenticado (com **mutação otimista** em `onMutate` e **rollback automático** em `onError`).
  - `['order', id]`: snapshot imutável do recibo de confirmação.
- **Reconciliação REST + Socket.IO:**
  - Quando o Socket.IO recebe `nft.updated`, o listener raiz em `src/routes/__root.tsx` invalida simultaneamente `['nfts']`, `['cart']`, `['checkout-quote']` e `['nft', updatedNft.id]`.
  - Se o usuário estiver na rota `/pagamento` e o NFT atualizado fizer parte do seu carrinho, o estado `quoteStale` é ativado imediatamente. O botão de pagamento é substituído por **Confirmar Nova Cotação**, regenerando uma nova `Idempotency-Key` somente após o aceite explícito do novo valor pelo comprador.

---

## 6. Limitações, Decisões de UX e Desvios Intencionais do Figma

1. **Persistência Local de Simulação (`KURIO_MOCK_STATE_V2`):**
   - *Limitação:* Por operar 100% no navegador via Service Worker sem banco de dados remoto, o estado persiste por navegador/dispositivo (`localStorage`).
   - *Decisão:* Adicionamos sincronização automática em `localStorage` dentro do `handlers.ts` para garantir que qualquer recarregamento (`F5`) ou acesso direto via URL preserve os pedidos criados, os itens no carrinho e as carteiras salvas.
2. **Painel Flutuante `⚡ MSW DevTools`:**
   - *Desvio Intencional do Figma:* Os 15 mockups do Figma não preveem uma interface de injeção de falhas de rede. Para atender ao requisito de avaliação de cenários de erro (`402`, `500`, `401`, `Timeout`) e disparo manual de eventos WebSocket sem exigir que o avaliador edite código ou execute comandos no console, incluímos uma pílula discreta (`⚡ MSW DevTools`) no canto inferior esquerdo.
3. **Banners de Conflito de Cotação e Estoque em `/pagamento`:**
   - *Decisão de UX:* Os mockups estáticos de `Pagamento.png` e `MPagamento.png` retratam apenas o caminho feliz. Quando um evento em tempo real altera o preço ou reduz a disponibilidade de um item no carrinho, um banner contextual âmbar/vermelho é exibido no topo do checkout para guiar o usuário na confirmação da nova cotação ou no ajuste de quantidade.
4. **Acessibilidade e Navegação Híbrida (Modal + Rotas Dedicadas):**
   - *Decisão de UX:* No Figma, o Carrinho e o Login/Cadastro aparecem tanto como sobreposições (Drawer/Modal sobre a Home) quanto como telas dedicadas no Mobile. Implementamos **ambos os formatos** (o Drawer `Cart.tsx` e o `AuthModal.tsx` para acesso rápido no Header, além das rotas completas `/carrinho`, `/login` e `/cadastro` para *deep linking*).
