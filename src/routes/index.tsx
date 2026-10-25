import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getNFTs } from '@/lib/api'
import { NFTCard } from '@/components/NFTCard'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { useState, useEffect } from 'react'
import { AuthModal } from '@/components/AuthModal'
import { toast } from 'sonner'

interface SearchParams {
  q?: string
  category?: string
  network?: string
  sort?: string
  page?: number
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const parsedPage = search.page ? Math.max(1, Number(search.page)) : undefined
    return {
      q: typeof search.q === 'string' && search.q.trim() !== '' ? search.q : undefined,
      category: typeof search.category === 'string' && search.category.trim() !== '' ? search.category : undefined,
      network: typeof search.network === 'string' && search.network.trim() !== '' ? search.network : undefined,
      sort: typeof search.sort === 'string' && search.sort.trim() !== '' ? search.sort : undefined,
      page: parsedPage && parsedPage > 1 ? parsedPage : undefined,
    }
  },
  component: Index,
})

const CATEGORIES = ['Arte digital', 'Fotografia', 'Música', 'Arte 3D'] as const
const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const

function Index() {
  const { q = '', category = '', network = '', sort = 'recent', page = 1 } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchInput, setSearchInput] = useState(q)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  // Atualização atômica de search params (sempre reiniciando a página para 1 em mudanças de filtro)
  const updateFilters = (newParams: Partial<SearchParams>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...newParams }
        // Se mudou qualquer filtro exceto a página, volta para a página 1
        if (!('page' in newParams)) {
          delete next.page
        } else if (next.page && next.page <= 1) {
          delete next.page
        }
        // Remove chaves vazias da URL para manter a query string limpa
        Object.keys(next).forEach((key) => {
          const k = key as keyof SearchParams
          if (!next[k]) {
            delete next[k]
          }
        })
        return next
      },
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ q: searchInput.trim() || undefined })
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nfts', { q, category, network, sort, page }],
    queryFn: () => getNFTs({ q, category, network, sort, page, limit: 8 }),
  })

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 flex flex-col gap-10">
      {/* Hero Banner (Frame Figma) */}
      <section className="flex flex-col md:flex-row gap-8 items-center justify-between bg-card rounded-[28px] p-8 lg:p-14 border border-border/70 shadow-xl overflow-hidden relative">
        <div className="flex-1 space-y-6 z-10">
          <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase bg-primary/10 px-3 py-1.5 rounded-full inline-block border border-primary/20">
            Bem-vindo à Kurio
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-[46px] font-black leading-tight uppercase text-foreground">
            Seja dono do futuro <br /> da arte digital
          </h1>
          <p className="text-muted-foreground font-mono text-sm sm:text-[15px] leading-relaxed max-w-lg">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas
            e tenha uma parte da cultura da internet na blockchain.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => {
                const el = document.getElementById('catalogo')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="rounded-full px-8 font-sans font-bold text-sm h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              EXPLORAR CATÁLOGO
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => updateFilters({ category: 'Arte digital' })}
              className="rounded-full px-8 font-mono text-sm h-12 border-border hover:bg-secondary transition-colors"
            >
              Ver Arte Digital
            </Button>
          </div>
        </div>

        <div className="w-full md:w-1/2 max-w-md aspect-square bg-secondary rounded-[24px] overflow-hidden border border-border/50 relative shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80"
            alt="Kurio Ape em Destaque"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 flex items-center justify-between">
            <div>
              <p className="font-sans font-bold text-sm text-foreground">Emerald Ape #042</p>
              <p className="font-mono text-xs text-primary">1.19 ETH</p>
            </div>
            <span className="font-mono text-[11px] bg-primary/20 text-primary px-2 py-1 rounded-md font-bold">
              Edição 1/1
            </span>
          </div>
        </div>
      </section>

      {/* Seção do Catálogo */}
      <div id="catalogo" className="flex flex-col lg:flex-row gap-10 pt-4 scroll-mt-24">
        {/* Barra Lateral de Filtros (Desktop) */}
        <aside className="w-full lg:w-64 flex flex-col gap-8 shrink-0">
          {/* Busca Textual */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar por nome, artista..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl pl-4 pr-10 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs cursor-pointer"
            >
              🔍
            </button>
          </form>

          {/* Filtro de Coleções / Categorias */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-base text-foreground">Categorias</h3>
              {category && (
                <button
                  onClick={() => updateFilters({ category: undefined })}
                  className="font-mono text-xs text-primary hover:underline cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
            <ul className="flex flex-col gap-2 font-mono text-xs">
              {CATEGORIES.map((cat) => {
                const isSelected = category.toLowerCase() === cat.toLowerCase()
                return (
                  <li
                    key={cat}
                    onClick={() => updateFilters({ category: isSelected ? undefined : cat })}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[11px]">{isSelected ? '✓' : ''}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Filtro de Rede Blockchain */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-base text-foreground">Rede</h3>
              {network && (
                <button
                  onClick={() => updateFilters({ network: undefined })}
                  className="font-mono text-xs text-primary hover:underline cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
            <ul className="flex flex-col gap-2 font-mono text-xs">
              {NETWORKS.map((net) => {
                const isSelected = network.toLowerCase() === net.toLowerCase()
                return (
                  <li
                    key={net}
                    onClick={() => updateFilters({ network: isSelected ? undefined : net })}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold border border-primary/30'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span>{net}</span>
                    <span className="text-[11px]">{isSelected ? '✓' : ''}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Botão de reset de todos os filtros */}
          {(q || category || network || sort !== 'recent') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchInput('')
                navigate({ search: {} })
              }}
              className="w-full font-mono text-xs rounded-xl border-dashed border-border text-muted-foreground hover:text-foreground"
            >
              ✕ Limpar todos os filtros
            </Button>
          )}
        </aside>

        {/* Conteúdo Principal do Catálogo */}
        <main className="flex-1 flex flex-col gap-8">
          {/* Barra Superior: Tabs de Ordenação e Seletor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
            <div className="flex items-center gap-6 font-mono text-xs sm:text-sm">
              <button
                onClick={() => updateFilters({ sort: 'recent' })}
                className={`cursor-pointer pb-2 transition-colors ${
                  sort === 'recent'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos os NFTs
              </button>
              <button
                onClick={() => updateFilters({ sort: 'rating' })}
                className={`cursor-pointer pb-2 transition-colors ${
                  sort === 'rating'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Melhor Avaliados
              </button>
              <button
                onClick={() => updateFilters({ sort: 'price_asc' })}
                className={`cursor-pointer pb-2 transition-colors ${
                  sort === 'price_asc'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Menor Preço
              </button>
              <button
                onClick={() => updateFilters({ sort: 'price_desc' })}
                className={`cursor-pointer pb-2 transition-colors ${
                  sort === 'price_desc'
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Maior Preço
              </button>
            </div>

            <div className="font-mono text-xs text-muted-foreground">
              Total: <span className="text-foreground font-bold">{data?.total || 0}</span> itens
            </div>
          </div>

          {/* Grelha de NFTs com Shimmer Skeletons Preservando Layout */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden p-4 space-y-4">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-destructive/30">
              <p className="text-destructive font-mono text-sm mb-4">Falha ao carregar catálogo da API.</p>
              <Button onClick={() => refetch()} variant="outline" className="font-mono text-xs">
                Tentar novamente
              </Button>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-card rounded-2xl border border-border">
              <span className="text-4xl mb-4">🔍</span>
              <h3 className="font-sans font-bold text-lg mb-2 text-foreground">Nenhum NFT encontrado</h3>
              <p className="text-muted-foreground font-mono text-xs max-w-sm mb-6">
                Não encontramos nenhum item correspondente aos filtros ou termos pesquisados.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('')
                  navigate({ search: {} })
                }}
                className="font-mono text-xs rounded-full"
              >
                Limpar busca e filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.items.map((nft) => (
                <NFTCard key={nft.id} nft={nft} onAuthRequired={() => setIsAuthOpen(true)} />
              ))}
            </div>
          )}

          {/* Paginação Sincronizada com URL */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: page - 1 })}
                className="font-mono text-xs rounded-xl"
              >
                ← Anterior
              </Button>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                {Array.from({ length: data.totalPages }).map((_, idx) => {
                  const pNum = idx + 1
                  const isCurrent = pNum === page
                  return (
                    <button
                      key={pNum}
                      onClick={() => updateFilters({ page: pNum })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {pNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => updateFilters({ page: page + 1 })}
                className="font-mono text-xs rounded-xl"
              >
                Próximo →
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Frame Figma: Promos (Crie sua coleção + Criadores em Destaque) */}
      <section id="criadores" className="pt-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Card Esquerdo: Crie sua própria coleção */}
          <div className="lg:col-span-7 bg-gradient-to-br from-[#1C1613] to-[#120E0C] border border-border/80 rounded-3xl p-8 lg:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] bg-primary/20 text-primary font-bold px-3 py-1 rounded-full border border-primary/30 uppercase tracking-widest">
                  Para Criadores & Artistas
                </span>
                <span className="font-mono text-xs text-muted-foreground">0% Taxa de Listagem</span>
              </div>

              <h2 className="font-sans text-2xl sm:text-3xl font-black text-foreground">
                Crie sua própria coleção de NFTs na Kurio
              </h2>

              <p className="font-mono text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
                Tem arte digital exclusiva? Publique seus colecionáveis com contratos inteligentes auditados, 
                royalties perpétuos definidos por você e alcance imediato a milhares de colecionadores Web3.
              </p>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-4 relative z-10">
              <Link to="/cadastro">
                <Button size="lg" className="rounded-full px-8 font-sans font-bold text-sm h-12 shadow-lg shadow-primary/20">
                  Começar a Criar
                </Button>
              </Link>
              <Link to="/carteiras">
                <Button variant="outline" size="lg" className="rounded-full px-6 font-mono text-xs h-12 border-border hover:bg-secondary">
                  Conectar Carteira
                </Button>
              </Link>
            </div>
          </div>

          {/* Card Direito: Criadores em Destaque da Semana */}
          <div className="lg:col-span-5 bg-card border border-border/80 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest block">
                    Em Alta
                  </span>
                  <h3 className="font-sans font-bold text-xl text-foreground">Top Criadores da Semana</h3>
                </div>
                <span className="text-xl">🏆</span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'Alex Nomad',
                    handle: '@alexnomad',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    sales: '42.8 ETH',
                    items: '18 itens',
                  },
                  {
                    name: 'Sara Nova',
                    handle: '@saranova',
                    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
                    sales: '38.2 ETH',
                    items: '24 itens',
                  },
                  {
                    name: 'Cyber Vortex',
                    handle: '@cybervortex',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                    sales: '29.5 ETH',
                    items: '12 itens',
                  },
                ].map((creator, i) => (
                  <div key={creator.handle} className="flex items-center justify-between p-3.5 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-muted-foreground w-4">
                        0{i + 1}
                      </span>
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div>
                        <h4 className="font-sans font-bold text-sm text-foreground flex items-center gap-1.5">
                          {creator.name}
                          <span className="text-[10px] text-primary" title="Verificado">✓</span>
                        </h4>
                        <p className="font-mono text-xs text-muted-foreground">{creator.handle}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-xs font-bold text-primary">{creator.sales}</p>
                      <button
                        onClick={() => toast.success(`Você começou a seguir ${creator.name}!`)}
                        className="font-mono text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Seguir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="font-mono text-[11px] text-muted-foreground text-center pt-4">
              Volume apurado nas últimas 24h na rede Ethereum.
            </p>
          </div>

        </div>
      </section>

      {/* Frame Figma: Blog & Guias da Comunidade */}
      <section id="aprenda" className="pt-8 pb-4 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full inline-block border border-primary/20">
              Aprenda & Conheça
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-black text-foreground">
              Artigos e Guias da Comunidade
            </h2>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-xl">
              Tudo o que você precisa entender sobre o ecossistema Web3, custódia descentralizada e curadoria de arte digital.
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Mais artigos em breve na documentação oficial da Kurio!')}
            className="font-mono text-xs rounded-full border-border hover:bg-secondary w-fit"
          >
            Ver Todos os Guias →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Como Avaliar a Raridade e Autenticidade de um NFT na Ethereum',
              summary: 'Entenda metadados IPFS, atributos ERC-721 e como verificar o histórico de transações na blockchain sem intermediários.',
              tag: 'Guia Prático',
              readTime: '5 min',
              image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
              date: '24 Out 2026',
            },
            {
              title: 'Segurança em Primeiro Lugar: Boas Práticas para Chaves e Carteiras',
              summary: 'Como manter seus ativos seguros, reconhecer assinaturas maliciosas de contratos e utilizar carteiras frias (cold wallets).',
              tag: 'Segurança Web3',
              readTime: '4 min',
              image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=600&auto=format&fit=crop&q=80',
              date: '20 Out 2026',
            },
            {
              title: 'O Impacto dos Royalties Perpétuos na Nova Economia Criativa',
              summary: 'Como contratos programáveis estão remodelando o mercado da arte e garantindo sustento contínuo a artistas digitais independentes.',
              tag: 'Economia Criativa',
              readTime: '6 min',
              image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
              date: '16 Out 2026',
            },
          ].map((post, index) => (
            <article
              key={index}
              className="bg-card border border-border/80 rounded-3xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1 shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-3 py-1 rounded-lg border border-border/60 font-mono text-[10px] text-primary font-bold">
                    {post.tag}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime} de leitura</span>
                  </div>

                  <h3 className="font-sans font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <button
                  type="button"
                  onClick={() => toast.info(`Lendo "${post.title}". O leitor completo será integrado em breve.`)}
                  className="font-mono text-xs text-primary font-bold group-hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  Ler Artigo Completo <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}
