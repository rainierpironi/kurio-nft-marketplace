# Arquitetura do Marketplace de NFTs — KURIO (Jungle Gaming Challenge)

Este documento descreve as decisões de engenharia, arquitetura de software, padrões de estado e alinhamento visual implementados na SPA do marketplace de NFTs **KURIO**.

---

## 1. Visão Geral e Stack Tecnológica

A aplicação foi desenvolvida em conformidade estrita com os requisitos eliminatórios do desafio:

| Camada | Tecnologia Adotada | Justificativa |
| :--- | :--- | :--- |
| **Interface** | React 19 + TypeScript | Componentização declarativa, tipagem estática rigorosa e compatibilidade com React 19. |
| **Roteamento** | TanStack Router | Roteamento com tipagem estrita de rotas e sincronização de search params na URL (`q`, `category`, `network`, `sort`, `page`). |
| **Estado Remoto & Cache** | TanStack Query v5 | Cache determinístico, mutações otimistas com rollback, invalidação reativa e limpeza no logout. |
| **Camada HTTP** | Axios | Instância centralizada com interceptor para injeção automática de token Bearer. |
| **Tempo Real** | Socket.IO Client + `@mswjs/socket.io-binding` | Eventos de WebSocket trafegando na camada de rede para atualização reativa de preços e estoques. |
| **Estilização** | Tailwind CSS + shadcn/ui | Design System customizado para o tema Dark e detalhes neon da KURIO. |
| **Mocking** | Mock Service Worker (MSW) v2 | Intercepção estrita no nível de transporte HTTP e WebSocket (Service Worker no navegador). |

---

## 2. Decisões Arquiteturais e Padrões de Projeto

### 2.1. Sincronização de Estado na URL (URL as Source of Truth)
O catálogo de NFTs utiliza a URL para persistir o estado de busca e navegação através do `validateSearch` do TanStack Router:
* **Parâmetros sincronizados:** `q` (busca), `category` (coleções), `network` (blockchain), `sort` (ordenação) e `page` (paginação).
* **Reset de Página:** A alteração de qualquer critério de filtragem redefine atopicamente `page: 1` para garantir que o usuário não permaneça em páginas vazias.
* **Histórico Nativo:** Navegações pelos botões *Back* e *Forward* do navegador restauram integralmente os resultados sem re-renderizações desnecessárias.

### 2.2. Autenticação, Isolamento de Dados e Mesclagem de Carrinho
* **Sessão:** Tokens simulados (`mock-token-{userId}`) persistem a autenticação no `localStorage`.
* **Isolamento de Cache:** No evento de logout ou troca de usuário, o método `queryClient.clear()` é executado imediatamente para evitar que dados privados (carteiras, favoritos ou pedidos) vazem entre usuários distintos.
* **Mesclagem de Visitante:** Itens adicionados ao carrinho antes do login são persistidos em um carrinho de visitante e mesclados no backend mockado (`POST /api/cart/merge`) assim que o colecionador efetua login ou registro.

### 2.3. Mutações Otimistas com Rollback Garantido
Para a ação de favoritar NFTs:
1. `onMutate`: O cancelamento de queries pendentes e a atualização imediata da UI garantem latência percebida zero para o usuário.
2. `onError`: Caso a simulação falhe (como no cenário `favorites_fail` do MSW), o snapshot anterior é restaurado no cache (`setQueryData`) e uma notificação de erro é exibida.
3. `onSettled`: Invalidação e sincronização final com a API.

### 2.4. Resiliência de Checkout: Idempotência e Recuperação de Falhas
* **Chave de Idempotência:** Cada tentativa de checkout gera uma chave única (`x-idempotency-key`) preservada durante a sessão da página de pagamento.
* **Prevenção de Duplicidade:** Se ocorrer duplo clique ou re-tentativa após timeout de rede, o MSW detecta a chave no cache de pedidos processados e devolve o snapshot existente com status HTTP 200 (`recovered: true`).
* **Recibo Imutável (`/confirmacao/$id`):** O pedido confirmado gera um snapshot imutável com ID único, data/hora, hash simulado de transação e link para explorador de blocos.

### 2.5. Tempo Real e WebSocket Reativo
O MSW intercepta o link de WebSocket via `@mswjs/socket.io-binding`. O evento `admin.simulate_update` aciona a difusão de `nft.updated` com versão e payload de novos valores. O cliente escuta o evento no componente raiz (`RootContent`), disparando notificações globais com Sonner e invalidando os caches das queries relevantes (`nfts`, `cart`, `nft`).

---

## 3. Conformidade com o Figma e Adaptação Responsiva

* **Cores e Identidade Visual:** Aplicação estrita da paleta KURIO com fundo ultra-escuro (`#0F0C0A`), superfícies em `#1A1512` e destaques primários em dourado/neon.
* **Tipografia:** Fonte monoespaçada para valores, hashes, redes e metadados, combinada com títulos sans-serif marcantes.
* **Adaptação Mobile:** As telas de **Confirmação de Pedido**, **Perfil do Colecionador** e **Gestão de Carteiras** — que não continham frames dedicados no Figma — foram desenhadas com adaptação responsiva completa para 390px, mantendo a consistência do design system.

---

## 4. Cenários Determinísticos de Teste (MSW DevTools)

O painel flutuante `MSW DevTools` (canto inferior esquerdo) permite selecionar os seguintes cenários de simulação:
1. **Sucesso Normal:** Operação padrão de todas as rotas e compras.
2. **Falha Pagamento (402):** Simula recusa da operadora ou rede da carteira.
3. **Timeout de Rede (5s):** Simula queda de conexão pós-processamento, testando o retry idempotente.
4. **Falha Favorito (Rollback):** Retorna status 500 na mutação de favoritos para validar o rollback otimista.
5. **WebSocket Alteração:** Emite alteração de preço e redução de estoque ao vivo para testar reatividade da interface.
6. **Restaurar Fixtures:** Redefine os dados de NFTs, usuários e carrinhos para o estado inicial.
