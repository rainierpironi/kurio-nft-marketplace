# Arquitetura do Marketplace de NFTs — KURIO (Jungle Gaming Challenge)

Este documento descreve detalhadamente as decisões de engenharia, arquitetura de software, padrões de estado, resiliência de rede e fidelidade visual implementados na SPA do marketplace de NFTs **KURIO**.

---

## 1. Visão Geral e Stack Tecnológica

A aplicação foi desenvolvida em conformidade estrita com todos os requisitos eliminatórios e recomendações do desafio:

| Camada | Tecnologia Adotada | Justificativa Técnica |
| :--- | :--- | :--- |
| **Interface** | React 19 + TypeScript (Strict) | Componentização declarativa, tipagem estática rigorosa e compatibilidade com React 19. |
| **Roteamento & Deep Linking** | TanStack Router | Roteamento com tipagem estrita de rotas (`routeTree.gen.ts`) e sincronização bidirecional de parâmetros na URL (`q`, `category`, `network`, `sort`, `page`, `minPrice`, `maxPrice`). |
| **Estado Remoto & Cache** | TanStack Query v5 | Cache determinístico, mutações otimistas com rollback garantido, invalidação reativa e limpeza total (`queryClient.clear()`) no logout. |
| **Camada HTTP** | Axios | Instância centralizada com interceptor para injeção automática de token Bearer extraído do `localStorage`. |
| **Tempo Real (WebSockets)** | Socket.IO Client + `@mswjs/socket.io-binding` | Eventos de WebSocket (`nft.updated` e `order.updated`) trafegando na camada de rede (MSW) para atualização reativa de preços e estoques sem acoplamento direto com a UI. |
| **Estilização & Design System** | Tailwind CSS + shadcn/ui | Design System fiel aos mockups Figma da KURIO: fundo Dark Espresso (`#14100D`), superfícies (`#1E1712`), acento Warm Amber (`#C88246`) e tipografia `Space Mono`. |
| **Mocking de Rede** | Mock Service Worker (MSW) v2 | Intercepção estrita no nível de transporte HTTP e WebSocket via Service Worker no navegador. Ativo tanto em ambiente de desenvolvimento como em deploy público. |
| **Testes Ponta a Ponta** | Playwright | Suíte de testes automatizados cobrindo fluxos críticos de ponta a ponta em Desktop (Chrome) e Mobile (390px). |

---

## 2. Decisões Arquiteturais e Padrões de Projeto

### 2.1. Sincronização de Estado na URL (URL as Source of Truth)
O catálogo de NFTs utiliza a URL para persistir o estado de busca e navegação através do `validateSearch` do TanStack Router:
* **Parâmetros sincronizados:** `q` (busca textual), `category` (coleções), `network` (blockchain), `sort` (ordenação), `minPrice`/`maxPrice` (faixa de preço) e `page` (paginação).
* **Reset de Página Atômico:** A alteração de qualquer critério de busca ou filtragem redefine atomicamente `page: 1` para garantir que o usuário não permaneça em páginas inexistentes.
* **Histórico Nativo do Navegador:** O suporte a *Back* e *Forward* do navegador restaura o estado exato dos filtros sem provocar flashes ou re-renderizações desnecessárias.

### 2.2. Autenticação, Isolamento de Dados e Mesclagem de Carrinho
* **Sessão:** Tokens simulados (`mock-token-{userId}`) persistem a autenticação no `localStorage`.
* **Isolamento Estrito de Cache:** No evento de logout ou troca de usuário, o método `queryClient.clear()` é executado imediatamente para evitar que dados privados (carteiras vinculadas, favoritos ou recibos) vazem entre usuários distintos (critério eliminatório).
* **Mesclagem de Visitante (Guest to User Merge):** Itens adicionados ao carrinho antes do login são persistidos em um carrinho de visitante e mesclados no backend mockado (`POST /api/cart/merge`) assim que o colecionador efetua login ou registro.

### 2.3. Mutações Otimistas com Rollback Garantido
Para a ação de favoritar colecionáveis no card de NFT e na página de detalhes:
1. `onMutate`: O cancelamento de queries pendentes e a atualização imediata da UI garantem latência percebida zero para o usuário.
2. `onError`: Caso a simulação falhe (como no cenário `favorites_fail` do MSW DevTools), o snapshot anterior é restaurado no cache (`setQueryData`) e uma notificação de erro é disparada pelo Sonner.
3. `onSettled`: Invalidação e sincronização final com o servidor mockado.

### 2.4. Resiliência de Checkout: Idempotência, Revalidação de Cotação e Recibo Imutável
* **Chave de Idempotência:** Cada tentativa de checkout gera uma chave única (`Idempotency-Key` / `x-idempotency-key`) preservada durante a sessão da página de pagamento.
* **Proteção contra Mudança de Cotação em Tempo Real:** Caso um evento WebSocket (`nft.updated`) altere o preço de um item presente no carrinho enquanto o usuário está em `/pagamento`, o checkout bloqueia o envio automático e exibe um alerta exigindo a confirmação explícita da nova cotação antes de prosseguir.
* **Prevenção de Pedidos Duplicados:** Se ocorrer duplo clique ou re-tentativa após timeout de rede, o MSW detecta a chave no cache de pedidos processados e devolve o snapshot existente com status HTTP 200 (`recovered: true`).
* **Recibo Imutável (`/confirmacao/$id`):** O pedido confirmado gera um snapshot imutável com ID único (`ORD-XXXXX`), data, hash simulado de transação (`0x...`) e link para explorador de blocos (`Ver no Etherscan`).

---

## 3. Conformidade com os 15 Mockups do Figma

O projeto implementa com precisão visual todos os 9 frames Desktop e 6 frames Mobile:
1. **`Início.png` & `MInício.png` (`/`):**
   * **Header & Mobile Bottom Bar:** Logotipo `KURIO`, links `Início | Mercado | Criadores | Aprenda`, busca, carrinho com badge âmbar, botão sólido `↪ Entrar` e barra inferior fixa no mobile com botão central elevado âmbar.
   * **Hero Banner:** `Bem-vindo à Kurio`, `SEJA DONO DO FUTURO DA ARTE DIGITAL`, botão `EXPLORAR` e ilustração `Emerald Ape #042`.
   * **Catálogo:** Sidebar com 9 `Coleções` e contadores, slider `Faixa de preço`, `Rede` (`Ethereum`, `Polygon`, `Solana`), card `NFT EM DESTAQUE / OFERTA LIMITADA`, grelha de 3 colunas com os 9 NFTs Kurio Apes e paginação `[1] [2] [3] [4] [>]`.
   * **Promos & Blog:** 2 cards horizontais (`Lançamentos gênesis de edição limitada` e `Arte digital selecionada e muito mais`) e seção `Diário da Cunhagem` com 4 artigos.
   * **Footer:** 3 medalhões circulares âmbar (`W`, `C`, `D`), newsletter `Antecipe-se ao próximo lançamento`, faixa institucional `KURIO`, 4 colunas de links, ícones sociais e selo `METAMASK • WALLETCONNECT • COINBASE`.
2. **`Detalhes do NFT.png` & `MDetalhes do NFT.png` (`/nft/$id`):** 4 miniaturas verticais + imagem principal com zoom, seletor de edição, botões ovais `-`/`+`, `COMPRAR`, `Favoritar`, abas `Detalhes do NFT | Avaliações de colecionadores (19)` e grelha `Mais desta coleção`.
3. **`Carrinho de NFTs.png` & `MCarrinho de NFTs.png` (`/carrinho` e Drawer):** Tabela de itens com controle de edições, `Resumo da carteira` com cupom e seção `Colecionadores também viram`.
4. **`Pagamento.png` & `MPagamento.png` (`/pagamento`):** Formulário `Perfil do colecionador`, resumo `Seus NFTs`, opções de `Carteira e rede` e botão `Confirmar compra`.
5. **`Confirmação de Pedido.png` (`/confirmacao/$id`):** Card centralizado com selo `THANK YOU`, `Seus NFTs agora estão na sua carteira`, faixa de 4 colunas, `Detalhes da transação` e `Ver no Etherscan`.
6. **`Perfil do Colecionador.png` (`/perfil`) & `Carteiras.png` (`/carteiras`):** Sidebar compartilhada `Meu perfil` com 8 itens e formulários dedicados.
7. **`Login.png`, `Cadastro.png`, `MLogin.png`, `MCadastro.png` (`/login`, `/cadastro` e `AuthModal`):** Abas `Entrar | Criar conta`, login social e contas rápidas de demonstração.
