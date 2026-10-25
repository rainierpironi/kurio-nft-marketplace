# Arquitetura do Marketplace de NFTs — KURIO (Jungle Gaming Challenge)

Este documento descreve detalhadamente as decisões de engenharia, arquitetura de software, padrões de estado, resiliência de rede e alinhamento visual implementados na SPA do marketplace de NFTs **KURIO**.

---

## 1. Visão Geral e Stack Tecnológica

A aplicação foi desenvolvida em conformidade estrita com todos os requisitos eliminatórios e recomendações do desafio:

| Camada | Tecnologia Adotada | Justificativa Técnica |
| :--- | :--- | :--- |
| **Interface** | React 19 + TypeScript (Strict) | Componentização declarativa, tipagem estática rigorosa e compatibilidade com React 19. |
| **Roteamento & Deep Linking** | TanStack Router | Roteamento com tipagem estrita de rotas, árvore estática (`routeTree.gen.ts`) e sincronização bidirecional de parâmetros na URL (`q`, `category`, `network`, `sort`, `page`). |
| **Estado Remoto & Cache** | TanStack Query v5 | Cache determinístico com `staleTime`, mutações otimistas com rollback garantido, invalidação reativa e limpeza total no logout. |
| **Camada HTTP** | Axios | Instância centralizada com interceptor para injeção automática de token Bearer extraído do `localStorage`. |
| **Tempo Real (WebSockets)** | Socket.IO Client + `@mswjs/socket.io-binding` | Eventos de WebSocket trafegando na camada de rede (MSW) para atualização reativa de preços e estoques sem acoplamento direto com a UI. |
| **Estilização & Design System** | Tailwind CSS + shadcn/ui | Design System customizado para a paleta Dark e destaques da KURIO (`#0F0C0A`, `#1A1512`, `#D98A53`). |
| **Mocking de Rede** | Mock Service Worker (MSW) v2 | Intercepção estrita no nível de transporte HTTP e WebSocket via Service Worker no navegador. Ativo tanto em ambiente de desenvolvimento como em deploy público. |
| **Testes Ponta a Ponta** | Playwright | Suíte de testes automatizados cobrindo fluxos críticos de ponta a ponta em Desktop (Chrome) e Mobile (390px). |

---

## 2. Decisões Arquiteturais e Padrões de Projeto

### 2.1. Sincronização de Estado na URL (URL as Source of Truth)
O catálogo de NFTs utiliza a URL para persistir o estado de busca e navegação através do `validateSearch` do TanStack Router:
* **Parâmetros sincronizados:** `q` (busca textual), `category` (coleções), `network` (blockchain), `sort` (ordenação por preço/recente/avaliação) e `page` (paginação).
* **Reset de Página Atômico:** A alteração de qualquer critério de busca ou filtragem redefine atopicamente `page: 1` para garantir que o usuário não permaneça em páginas inexistentes.
* **Histórico Nativo do Navegador:** O suporte a *Back* e *Forward* do navegador restaura o estado exato dos filtros sem provocar flashes ou re-renderizações desnecessárias.

### 2.2. Autenticação, Isolamento de Dados e Mesclagem de Carrinho
* **Sessão:** Tokens simulados (`mock-token-{userId}`) persistem a autenticação no `localStorage`.
* **Isolamento Estrito de Cache:** No evento de logout ou troca de usuário, o método `queryClient.clear()` é executado imediatamente para evitar que dados privados (carteiras vinculadas, favoritos ou recibos) vazem entre usuários distintos (critério eliminatório).
* **Mesclagem de Visitante (Guest to User Merge):** Itens adicionados ao carrinho antes do login são persistidos em um carrinho de visitante e mesclados no backend mockado (`POST /api/cart/merge`) assim que o colecionador efetua login ou registro.

### 2.3. Mutações Otimistas com Rollback Garantido
Para a ação de favoritar colecionáveis no card de NFT:
1. `onMutate`: O cancelamento de queries pendentes e a atualização imediata da UI garantem latência percebida zero para o usuário.
2. `onError`: Caso a simulação falhe (como no cenário `favorites_fail` do MSW DevTools), o snapshot anterior é restaurado no cache (`setQueryData`) e uma notificação de erro é disparada pelo Sonner.
3. `onSettled`: Invalidação e sincronização final com o servidor mockado.

### 2.4. Resiliência de Checkout: Idempotência e Recuperação de Falhas
* **Chave de Idempotência:** Cada tentativa de checkout gera uma chave única (`x-idempotency-key`) preservada durante a sessão da página de pagamento.
* **Prevenção de Pedidos Duplicados:** Se ocorrer duplo clique ou re-tentativa após timeout de rede, o MSW detecta a chave no cache de pedidos processados e devolve o snapshot existente com status HTTP 200 (`recovered: true`).
* **Recibo Imutável (`/confirmacao/$id`):** O pedido confirmado gera um snapshot imutável com ID único (`ORD-XXXXX`), data/hora, hash simulado de transação (`0x...`) e link para explorador de blocos.

### 2.5. Tempo Real e WebSocket Reativo
O MSW intercepta o link de WebSocket via `@mswjs/socket.io-binding`. O evento `admin.simulate_update` aciona a difusão de `nft.updated` com versão e payload de novos valores. O cliente escuta o evento no componente raiz (`RootContent`), disparando notificações globais com Sonner e invalidando os caches das queries relevantes (`nfts`, `cart`, `nft`).

---

## 3. Conformidade com o Figma e Estrutura de Telas

O projeto implementa com rigor todos os frames do Figma:
1. **Desktop / Início (`/`):**
   * **Top:** Cabeçalho transparente com efeito blur, logotipo KURIO, navegação central, drawer de carrinho e autenticação.
   * **Hero Banner:** Chamada com tipografia marcante, arte em destaque com tag de preço e botões de chamada para ação.
   * **Products:** Barra lateral de filtros com contagem dinâmica, barra superior com ordenação, grelha com Shimmer Skeletons e paginação numerada.
   * **Promos:** Cartão com gradiente "Crie sua própria coleção" (0% taxa) e ranking "Top Criadores da Semana" com avatares e vendas apuradas.
   * **Blog:** Seção "Artigos e Guias da Comunidade" com 3 guias Web3 (tags, data e tempo de leitura).
   * **Footer:** Três medalhões de destaque, newsletter interativa, faixa institucional, 4 colunas de links, redes sociais e chips de carteiras aceitas.
2. **Desktop / Detalhes do NFT (`/nft/$id`):** Breadcrumb, imagem ampliada, artista verificado, histórico de ofertas, traits e compra direta.
3. **Desktop / Pagamento (`/pagamento`):** Checkout estruturado com formulário de cobrança, resumo dinâmico, taxas de rede (gas) e idempotência.
4. **Desktop / Confirmação de Pedido (`/confirmacao/$id`):** Tela de confirmação pós-compra imutável com hash criptográfico.
5. **Desktop / Perfil do Colecionador (`/perfil`):** 4 abas organizadas (Editar Perfil, Carteiras, Favoritos e Segurança).
6. **Desktop / Carteiras (`/carteiras`):** Gestão dedicada de carteiras Web3 (MetaMask, Coinbase, Phantom, WalletConnect) e indicação de carteira principal.
7. **Desktop / Login (`/login`) & Cadastro (`/cadastro`):** Rotas dedicadas com suporte a deep linking e atalhos rápidos de teste.

---

## 4. Cenários Determinísticos de Teste (MSW DevTools)

O painel flutuante `MSW DevTools` (canto inferior esquerdo) permite selecionar os seguintes cenários de simulação:
1. **Sucesso Normal:** Operação padrão de todas as rotas e compras.
2. **Falha Pagamento (402):** Simula recusa da operadora ou rede da carteira.
3. **Timeout de Rede (5s):** Simula queda de conexão pós-processamento, testando o retry idempotente.
4. **Falha Favorito (Rollback):** Retorna status 500 na mutação de favoritos para validar o rollback otimista.
5. **WebSocket Alteração:** Emite alteração de preço e redução de estoque ao vivo para testar reatividade da interface.
6. **Restaurar Fixtures:** Redefine os dados de NFTs, usuários e carrinhos para o estado inicial.

---

## 5. Preparação para Deploy Contínuo (Vercel & Netlify)

* **Netlify / Cloudflare Pages:** Configurado via `public/_redirects` com regra `/* /index.html 200`.
* **Vercel:** Configurado via `vercel.json` com regra de rewrite para `/index.html`.
* **Mock Service Worker em Produção:** Ativação automática do Service Worker em builds de produção para que avaliadores possam testar todos os fluxos ao vivo sem necessidade de infraestrutura de backend externa.
