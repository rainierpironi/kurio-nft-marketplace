# KURIO — NFT Marketplace (Frontend Challenge)

Plataforma Web3 descentralizada para descoberta, negociação e coleção de arte digital e NFTs raros, desenvolvida com estrita observância a todos os critérios eliminatórios do **Jungle Gaming Frontend Challenge** e **100% de fidelidade visual** aos 15 mockups exatos do [Design Figma Fornecido](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1) (9 Desktop + 6 Mobile).

- **🌐 Deploy Público (Live Demo):** [https://kurio-nft-marketplace-rainierpironi.vercel.app/](https://kurio-nft-marketplace-rainierpironi.vercel.app/)
- **📦 Repositório GitHub:** [https://github.com/rainierpironi/kurio-nft-marketplace](https://github.com/rainierpironi/kurio-nft-marketplace)
- **📐 Documentação de Arquitetura:** [ARCHITECTURE.md](./ARCHITECTURE.md)

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
| **Cobertura de Testes E2E & Auditoria** | Suíte completa com **Playwright** (`e2e/`) e configuração de auditoria **Lighthouse CI** (`lighthouserc.json`). | ✅ 100% |
| **Deploy com Deep Linking** | Arquivos `vercel.json`, `netlify.toml` e `public/_redirects` inclusos para roteamento SPA sem erro 404 em acesso direto ou refresh (`F5`). | ✅ 100% |

---

## 🚀 Setup e Comandos de Execução

A aplicação foi projetada para executar imediatamente a partir de um checkout limpo, sem depender de serviços privados ou backend externo.

### Pré-requisitos
- **Node.js:** 18+ (recomendado Node.js 20 ou 22 LTS)
- **npm:** 9+

### 1. Instalação Limpa
```bash
git clone https://github.com/rainierpironi/kurio-nft-marketplace.git
cd kurio-nft-marketplace
npm install
```

### 2. Tabela de Comandos Disponíveis (`package.json`)

| Comando | Finalidade |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite com MSW (HTTP + WebSocket) ativo em `http://localhost:5173`. |
| `npm run build` | Executa a verificação estrita de tipos (`tsc -b`) e empacota a aplicação de produção em `dist/`. |
| `npm run preview` | Serve o build de produção localmente (`vite preview`) com MSW e suporte a rotas SPA. |
| `npm run typecheck` | Executa exclusivamente a verificação estática de tipos do TypeScript (`tsc -b`). |
| `npm run lint` | Executa a análise estática de código e hooks React via `oxlint`. |
| `npm run test:e2e` | Executa a suíte completa de 14 testes ponta a ponta do Playwright (`e2e/`). |
| `npm run lighthouse` | Executa a auditoria automatizada de Performance, Acessibilidade, Boas Práticas e SEO com Lighthouse CI (`lighthouserc.json`). |

---

## ⚙️ Variáveis de Ambiente

A aplicação funciona **sem necessidade de criar arquivo `.env`** em checkout limpo, pois já possui valores padrão seguros embutidos para o Mock Service Worker. Caso deseje customizar o comportamento local, copie o arquivo `.env.example`:

```bash
cp .env.example .env
```

| Variável | Valor Padrão | Descrição |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Prefixo base das rotas HTTP interceptadas pelo Axios / MSW. |
| `VITE_ENABLE_MSW` | `true` | Mantém o Service Worker de mocks HTTP e WebSocket ativo em dev, preview e produção. |

---

## 🔑 Credenciais Fictícias e Cupons de Teste

A aplicação conta com dois perfis de colecionadores pré-carregados nas fixtures do MSW. Você pode autenticar-se clicando em **Entrar** no topo da página (usando os botões de preenchimento rápido **Demo: Alex Nomad** / **Demo: Sara Nova** ou digitando manualmente):

| Colecionador | E-mail | Senha | Carteira Principal | Carteira Secundária | Favoritos Iniciais |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alex Nomad** | `alex@kurio.art` | `password123` | `0xA91F...E82C` (Ethereum) | `nova.kurio.eth` (Polygon) | `#1`, `#3` |
| **Sara Nova** | `sara@kurio.art` | `password123` | `0x38B9...10EC` (Polygon) | `0x99C4...A1B2` (Solana) | `#2`, `#5` |

### Cupons Promocionais Válidos (Carrinho e Pagamento)
- `KURIO10` — Concede **10% de desconto** sobre o subtotal dos NFTs.
- `GREENMINT20` — Concede **20% de desconto** sobre o subtotal dos NFTs.

---

## 🛠️ Seleção, Reset de Cenários e Reprodução dos Fluxos de Falha

No canto inferior esquerdo de qualquer página está disponível o botão flutuante **⚡ MSW DevTools**. Ao clicar nele, você pode alternar em tempo real os cenários de resposta do servidor mockado (`localStorage['MSW_SCENARIO']`), disparar eventos WebSocket e resetar o banco de dados em memória.

### Como Resetar Cenários e Fixtures
1. Abra o painel **⚡ MSW DevTools** no canto inferior esquerdo.
2. Clique em **↺ Restaurar Fixtures** (`POST /api/simulation/reset`).
3. Todos os estoques dos 9 NFTs, carrinhos, pedidos, carteiras e o cenário ativo voltam imediatamente ao estado original de fábrica (`Sucesso Normal`), limpando também o cache do TanStack Query.

### Passo a Passo para Reproduzir Cada Fluxo de Falha e Resiliência

1. **Falha de Pagamento (HTTP 402 — Recusa da Carteira/Rede):**
   - Adicione um NFT ao carrinho e acesse `/pagamento`.
   - Abra o **⚡ MSW DevTools** e selecione **Falha Pagamento (402)**.
   - Preencha os campos obrigatórios e clique em **Confirmar compra**.
   - **Resultado esperado:** O servidor retorna status `402`, um toast de erro informa a recusa, os itens permanecem intactos no carrinho e o botão exibe **Tentar Novamente (Recuperar Pedido)**. Ao voltar o seletor para **Sucesso Normal** e clicar novamente, o pedido é concluído.

2. **Timeout de Rede e Recuperação por Idempotência (`Idempotency-Key`):**
   - Com itens no carrinho em `/pagamento`, selecione **Timeout de Rede** no **⚡ MSW DevTools**.
   - Clique em **Confirmar compra**. O MSW processa a ordem internamente, mas simula queda da conexão após 4 segundos.
   - Volte o seletor para **Sucesso Normal** e clique em **Tentar Novamente (Recuperar Pedido)**.
   - **Resultado esperado:** O frontend reenvia a **mesma chave `x-idempotency-key`**; o MSW detecta a ordem já processada, evita cobrança/baixa de estoque duplicada, retorna `{ recovered: true }` e redireciona para o recibo imutável `/confirmacao/$id`.

3. **Revalidação de Cotação em Tempo Real via WebSocket (`nft.updated`):**
   - Adicione o item **Emerald Ape #042** ao carrinho e permaneça na tela `/pagamento`.
   - Abra o **⚡ MSW DevTools** e clique no botão **📡 WebSocket Alteração**.
   - **Resultado esperado:** O servidor emite o evento Socket.IO `nft.updated` alterando o preço e o estoque do item. Na tela `/pagamento`, surge imediatamente o banner de alerta **"Atualização de Preço ou Disponibilidade Detectada!"** bloqueando a finalização com a cotação antiga até que o usuário clique em **Confirmar Nova Cotação**.

4. **Falha ao Favoritar com Rollback Otimista (HTTP 500):**
   - Faça login (`alex@kurio.art`), abra o **⚡ MSW DevTools** e selecione **Falha Favorito (Rollback)**.
   - Clique no ícone de coração (`♡`) em qualquer card de NFT.
   - **Resultado esperado:** O coração muda de estado instantaneamente (atualização otimista no `onMutate`) e, após a resposta `500` do MSW, reverte automaticamente para o estado anterior (`onError`) exibindo a notificação de rollback.

5. **Sessão Expirada (HTTP 401):**
   - No **⚡ MSW DevTools**, selecione **Sessão Expirada (401)** e tente acessar `/perfil` ou salvar alterações cadastrais.
   - **Resultado esperado:** O MSW responde `401 Unauthorized`, invalidando a operação protegida até que a sessão seja restabelecida.

---

## 🗺️ Mapa de Rotas e Fidelidade aos 15 Mockups do Figma

| Rota | Mockups Correspondentes (Desktop & Mobile) | Deep Linking / Refresh (`F5`) |
| :--- | :--- | :---: |
| `/` | **`Início.png` & `MInício.png`:** Hero Banner, sidebar com 9 `Coleções`, `Faixa de preço`, `Rede` e card `NFT EM DESTAQUE / OFERTA LIMITADA`, grelha de 9 NFTs Kurio Apes, 2 cards promocionais e blog `Diário da Cunhagem` (4 colunas). | ✅ Sim |
| `/nft/$id` | **`Detalhes do NFT.png` & `MDetalhes do NFT.png`:** Galeria com 4 miniaturas verticais + zoom, seletor de edição (`1/1`, `1/10`, `1/50`, `ABERTA`), controle de quantidade, abas `Detalhes do NFT` / `Avaliações de colecionadores (19)`, seção `Mais desta coleção` e tratamento 404 para IDs inexistentes. | ✅ Sim |
| `/carrinho` | **`Carrinho de NFTs.png` & `MCarrinho de NFTs.png`:** Tabela `Resumo dos NFTs` (`NFTs`, `Preço`, `Edições`, `Total`), painel `Resumo da compra` com cupom, taxa de rede `0.016 ETH` e carrossel `Você também pode gostar`, além do Drawer lateral. | ✅ Sim |
| `/pagamento` | **`Pagamento.png` & `MPagamento.png`:** Formulário `Perfil do colecionador` em 2 colunas (Desktop) e seletor `Carteira conectada` (`Reserva` / `Principal`) no Mobile, resumo `Seus NFTs`, seleção de `Carteira e rede`, revalidação WebSocket e idempotência. | ✅ Sim |
| `/confirmacao/$id` | **`Confirmação de Pedido.png`:** Card pós-compra com selo `THANK YOU`, `Seus NFTs agora estão na sua carteira`, faixa de 4 colunas (`ID da transação`, `Data`, `Total`, `Carteira`), `Detalhes da transação` e botão `Ver no Etherscan`. | ✅ Sim |
| `/perfil` | **`Perfil do Colecionador.png`:** Sidebar `Meu perfil` (`Dados do perfil`, `Carteiras`, `Atividade`, `Lista de interesse`, `Ofertas`, `Arquivos baixados`, `Suporte`, `Sair`), formulário em 2 colunas com Avatar e seção `Alterar senha`. | ✅ Sim |
| `/carteiras` | **`Carteiras.png`:** Sidebar `Meu perfil` com `Carteiras` ativo, formulário `Carteira principal`, botão `Salvar carteira`, listagem de carteiras vinculadas e seção `Carteira secundária`. | ✅ Sim |
| `/login` | **`Login.png` & `MLogin.png`:** Abas `Entrar \| Criar conta`, campos com alternância de visibilidade de senha, `Ou continue com` (`Google` / `Facebook`) e atalhos de demonstração. | ✅ Sim |
| `/cadastro` | **`Cadastro.png` & `MCadastro.png`:** Registro completo de colecionador com mesclagem automática do carrinho de visitante. | ✅ Sim |

---

## 📄 Licença
Desenvolvido para fins de avaliação técnica no Desafio Frontend da **Jungle Gaming**.
