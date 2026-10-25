import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getNFTs } from '@/lib/api'
import { NFTCard } from '@/components/NFTCard'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { useState, useEffect } from 'react'
import { AuthModal } from '@/components/AuthModal'
import { toast } from 'sonner'
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react'

interface SearchParams {
  q?: string
  category?: string
  network?: string
  sort?: string
  page?: number
  minPrice?: number
  maxPrice?: number
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const parsedPage = search.page ? Math.max(1, Number(search.page)) : undefined
    const parsedMin = search.minPrice !== undefined ? Number(search.minPrice) : undefined
    const parsedMax = search.maxPrice !== undefined ? Number(search.maxPrice) : undefined
    return {
      q: typeof search.q === 'string' && search.q.trim() !== '' ? search.q : undefined,
      category: typeof search.category === 'string' && search.category.trim() !== '' ? search.category : undefined,
      network: typeof search.network === 'string' && search.network.trim() !== '' ? search.network : undefined,
      sort: typeof search.sort === 'string' && search.sort.trim() !== '' ? search.sort : undefined,
      page: parsedPage && parsedPage > 1 ? parsedPage : undefined,
      minPrice: parsedMin && !Number.isNaN(parsedMin) ? parsedMin : undefined,
      maxPrice: parsedMax && !Number.isNaN(parsedMax) ? parsedMax : undefined,
    }
  },
  component: Index,
})

const COLLECTIONS = [
  { name: 'Arte digital', count: 33 },
  { name: 'Fotografia', count: 12 },
  { name: 'Música', count: 65 },
  { name: 'Arte 3D', count: 39 },
  { name: 'Colecionáveis', count: 23 },
  { name: 'Generativa', count: 17 },
  { name: 'Jogos', count: 19 },
  { name: 'Assinaturas', count: 13 },
  { name: 'Utilidade', count: 18 },
] as const

const NETWORKS = [
  { name: 'Ethereum', count: 119 },
  { name: 'Polygon', count: 78 },
  { name: 'Solana', count: 86 },
] as const

function Index() {
  const { q = '', category = '', network = '', sort = 'recent', page = 1, minPrice, maxPrice } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [searchInput, setSearchInput] = useState(q)
  const [maxPriceDraft, setMaxPriceDraft] = useState<number>(maxPrice ?? 12.3)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    setMaxPriceDraft(maxPrice ?? 12.3)
  }, [maxPrice])

  const updateFilters = (newParams: Partial<SearchParams>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...newParams }
        if (!('page' in newParams)) {
          delete next.page
        } else if (next.page && next.page <= 1) {
          delete next.page
        }
        Object.keys(next).forEach((key) => {
          const k = key as keyof SearchParams
          if (next[k] === undefined || next[k] === '') {
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

  const handleApplyPriceFilter = () => {
    updateFilters({
      minPrice: 0.02,
      maxPrice: maxPriceDraft < 12.3 ? maxPriceDraft : undefined,
    })
    toast.success(`Filtro de preço aplicado: 0,02 - ${maxPriceDraft.toFixed(2).replace('.', ',')} ETH`)
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nfts', { q, category, network, sort, page, minPrice, maxPrice }],
    queryFn: () => getNFTs({ q, category, network, sort, page, limit: 9, minPrice, maxPrice }),
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-6 lg:py-8 flex flex-col gap-12 font-mono">
      {/* Barra de Busca + Filtro Mobile (Fiel a MInício.png) */}
      <div className="md:hidden flex items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Explorar coleções"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#1E1712] border border-border rounded-xl pl-10 pr-4 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </form>
        <button
          type="button"
          onClick={() => setShowMobileFilters((v) => !v)}
          aria-label="Filtrar coleções"
          className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Banner (Fiel a Início.png e MInício.png) */}
      <section className="bg-[#1E1712] border border-border rounded-3xl md:rounded-none p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex-1 space-y-2.5 md:space-y-4 max-w-xl">
            <span className="text-[10px] sm:text-xs text-foreground/90 tracking-wider block">
              Bem-vindo à Kurio
            </span>
            <h1 className="hidden md:block text-2xl sm:text-4xl lg:text-[44px] font-bold leading-[1.15] uppercase text-foreground tracking-tight">
              SEJA DONO DO FUTURO DA ARTE DIGITAL
            </h1>
            <h2 className="md:hidden text-base font-bold leading-snug uppercase text-foreground tracking-tight">
              SEJA DONO DA <span className="text-primary">CULTURA</span> DIGITAL
            </h2>
            <p className="text-muted-foreground text-[11px] sm:text-[13px] leading-relaxed">
              <span className="hidden md:inline">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie
                artistas e tenha uma parte da cultura da internet.
              </span>
              <span className="md:hidden">
                Descubra NFTs raros de artistas independentes e coleções selecionadas.
              </span>
            </p>
            <div className="pt-1 md:pt-2">
              <Button
                onClick={() => {
                  const el = document.getElementById('catalogo')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-7 py-2.5 h-10 font-mono font-bold text-xs uppercase cursor-pointer"
              >
                EXPLORAR
              </Button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalogo')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="md:hidden inline-flex items-center gap-1.5 text-primary font-mono font-bold text-xs uppercase cursor-pointer"
              >
                EXPLORAR <span>→</span>
              </button>
            </div>
          </div>

          {/* Arte Hero Direita */}
          <div className="relative w-32 sm:w-64 lg:w-80 aspect-square shrink-0">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[#14100D] shadow-2xl">
              <img
                src="/nfts/ape-emerald.png"
                alt="Emerald Ape #042"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Miniatura sobreposta visível no mobile (Fiel a MInício.png) */}
            <div className="md:hidden absolute -bottom-2 -left-5 w-16 h-16 rounded-2xl overflow-hidden border-2 border-background shadow-xl bg-[#14100D]">
              <img src="/nfts/ape-sage.png" alt="Sage Nomad #009" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Indicadores de Slide no Rodapé do Hero */}
        <div className="flex items-center justify-center gap-2 mt-5 md:mt-6">
          <span className="w-2 h-2 rounded-full bg-primary/30" />
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-2 h-2 rounded-full bg-primary/30" />
        </div>
      </section>

      {/* Seção Principal do Catálogo */}
      <div id="catalogo" className="flex flex-col lg:flex-row gap-8 scroll-mt-24">
        {/* Sidebar Esquerda (Coleções, Faixa de Preço, Rede e Card NFT em Destaque) */}
        <aside className={`w-full lg:w-64 shrink-0 flex flex-col gap-6 ${showMobileFilters ? 'block' : 'hidden lg:flex'}`}>
          <div className="bg-[#1E1712] border border-border p-5 space-y-7">
            {/* Busca Rápida Sincronizada com URL */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, artista..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-3 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary text-xs cursor-pointer"
              >
                🔍
              </button>
            </form>

            {/* Coleções */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-foreground">Coleções</h3>
                {category && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ category: undefined })}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <ul className="space-y-2.5 text-xs">
                {COLLECTIONS.map((col) => {
                  const isSelected = category.toLowerCase() === col.name.toLowerCase()
                  return (
                    <li
                      key={col.name}
                      onClick={() => updateFilters({ category: isSelected ? undefined : col.name })}
                      className={`flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'text-primary font-bold' : 'text-foreground/85 hover:text-primary'
                      }`}
                    >
                      <span>{col.name}</span>
                      <span className={isSelected ? 'text-primary font-bold' : 'text-muted-foreground'}>
                        ({col.count})
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Faixa de preço */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground">Faixa de preço</h3>
              <div className="px-1 pt-1">
                <input
                  type="range"
                  min={0.02}
                  max={12.3}
                  step={0.1}
                  value={maxPriceDraft}
                  onChange={(e) => setMaxPriceDraft(parseFloat(e.target.value))}
                  aria-label="Faixa de preço máxima"
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
              <p className="text-xs text-foreground/90">
                Preço:{' '}
                <span className="text-primary font-bold">
                  0,02 - {maxPriceDraft.toFixed(2).replace('.', ',')} ETH
                </span>
              </p>
              <Button
                type="button"
                onClick={handleApplyPriceFilter}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2 h-8 text-xs font-bold cursor-pointer"
              >
                Aplicar
              </Button>
            </div>

            {/* Rede */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-foreground">Rede</h3>
                {network && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ network: undefined })}
                    className="text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <ul className="space-y-2.5 text-xs">
                {NETWORKS.map((net) => {
                  const isSelected = network.toLowerCase() === net.name.toLowerCase()
                  return (
                    <li
                      key={net.name}
                      onClick={() => updateFilters({ network: isSelected ? undefined : net.name })}
                      className={`flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'text-primary font-bold' : 'text-foreground/85 hover:text-primary'
                      }`}
                    >
                      <span>{net.name}</span>
                      <span className="text-muted-foreground">({net.count})</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {(q || category || network || minPrice || maxPrice || sort !== 'recent') && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setMaxPriceDraft(12.3)
                  navigate({ search: {} })
                }}
                className="w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md cursor-pointer"
              >
                ✕ Limpar todos os filtros
              </button>
            )}
          </div>

          {/* Card Lateral Inferior: NFT EM DESTAQUE / OFERTA LIMITADA (Fiel a Início.png) */}
          <div className="bg-[#1E1712] border border-border p-5 text-center space-y-3 hidden lg:block">
            <p className="font-serif italic text-xl text-primary tracking-wide">NFT EM DESTAQUE</p>
            <p className="text-xs font-bold text-foreground uppercase tracking-widest">OFERTA LIMITADA</p>
            <div className="pt-2 rounded-2xl overflow-hidden bg-[#14100D] aspect-square">
              <img
                src="/nfts/ape-sage.png"
                alt="NFT em Destaque — Sage Nomad #009"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </aside>

        {/* Área Principal do Catálogo */}
        <main className="flex-1 flex flex-col gap-6">
          {/* Barra Superior: Tabs + Ordenar por */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex items-center gap-6 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => updateFilters({ sort: 'recent' })}
                className={`cursor-pointer pb-2 whitespace-nowrap border-b-2 transition-colors ${
                  sort === 'recent'
                    ? 'text-primary border-primary font-bold'
                    : 'text-foreground/80 border-transparent hover:text-foreground'
                }`}
              >
                Todos os NFTs
              </button>
              <button
                type="button"
                onClick={() => updateFilters({ sort: 'new' })}
                className={`cursor-pointer pb-2 whitespace-nowrap border-b-2 transition-colors ${
                  sort === 'new'
                    ? 'text-primary border-primary font-bold'
                    : 'text-foreground/80 border-transparent hover:text-foreground'
                }`}
              >
                Novos lançamentos
              </button>
              <button
                type="button"
                onClick={() => updateFilters({ sort: 'rating' })}
                className={`cursor-pointer pb-2 whitespace-nowrap border-b-2 transition-colors ${
                  sort === 'rating'
                    ? 'text-primary border-primary font-bold'
                    : 'text-foreground/80 border-transparent hover:text-foreground'
                }`}
              >
                Em alta
              </button>
              <button
                type="button"
                onClick={() => updateFilters({ sort: 'price_asc' })}
                className={`cursor-pointer pb-2 whitespace-nowrap border-b-2 transition-colors ${
                  sort === 'price_asc'
                    ? 'text-primary border-primary font-bold'
                    : 'text-foreground/80 border-transparent hover:text-foreground'
                }`}
              >
                Menor Preço
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="text-muted-foreground">Ordenar por:</span>
              <select
                aria-label="Ordenar por"
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="bg-transparent text-foreground font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value="recent" className="bg-[#1E1712]">
                  Listados recentemente
                </option>
                <option value="price_asc" className="bg-[#1E1712]">
                  Menor Preço
                </option>
                <option value="price_desc" className="bg-[#1E1712]">
                  Maior Preço
                </option>
                <option value="rating" className="bg-[#1E1712]">
                  Melhor Avaliados
                </option>
              </select>
            </div>
          </div>

          {/* Grid de 3 Colunas (9 NFTs) */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="bg-[#1E1712] rounded-2xl p-4 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center bg-[#1E1712] rounded-2xl border border-destructive/30">
              <p className="text-destructive text-sm mb-4">Falha ao carregar catálogo da API.</p>
              <Button onClick={() => refetch()} variant="outline" className="text-xs">
                Tentar novamente
              </Button>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="p-14 text-center bg-[#1E1712] rounded-2xl border border-border">
              <h3 className="font-bold text-base mb-2 text-foreground">Nenhum NFT encontrado</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-5">
                Não encontramos nenhum item correspondente aos filtros ou termos pesquisados.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('')
                  setMaxPriceDraft(12.3)
                  navigate({ search: {} })
                }}
                className="text-xs"
              >
                Limpar busca e filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data?.items.map((nft) => (
                <NFTCard key={nft.id} nft={nft} onAuthRequired={() => setIsAuthOpen(true)} />
              ))}
            </div>
          )}

          {/* Paginação Quadrada Inferior Direita: [1] [2] [3] [4] [>] (Fiel a Início.png) */}
          <div className="flex items-center justify-end gap-2 pt-4">
            {[1, 2, 3, 4].map((pNum) => {
              const isCurrent = pNum === page
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => updateFilters({ page: pNum })}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-transparent border border-border text-foreground hover:border-primary'
                  }`}
                >
                  {pNum}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => updateFilters({ page: Math.min(4, page + 1) })}
              aria-label="Próxima página"
              className="w-8 h-8 rounded border border-border flex items-center justify-center text-xs text-foreground hover:border-primary transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* Seção de 2 Cards Promocionais (Fiel a Início.png) */}
      <section id="criadores" className="pt-4 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-[#1E1712] border border-border p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-[#14100D] shrink-0">
              <img
                src="/nfts/ape-emerald.png"
                alt="Lançamentos gênesis de edição limitada"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-right space-y-3">
              <h3 className="font-bold text-sm text-foreground leading-snug">
                Lançamentos gênesis <br /> de edição limitada
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Colecione edições escassas diretamente dos criadores antes da revelação pública.
              </p>
              <div className="pt-1 flex justify-center sm:justify-end">
                <Button
                  onClick={() => {
                    const el = document.getElementById('catalogo')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2 h-9 text-xs font-bold cursor-pointer"
                >
                  Explorar →
                </Button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1E1712] border border-border p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-[#14100D] shrink-0">
              <img
                src="/nfts/ape-baron.png"
                alt="Arte digital selecionada e muito mais"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-right space-y-3">
              <h3 className="font-bold text-sm text-foreground leading-snug">
                Arte digital selecionada <br /> e muito mais
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.
              </p>
              <div className="pt-1 flex justify-center sm:justify-end">
                <Button
                  onClick={() => updateFilters({ category: 'Arte digital' })}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2 h-9 text-xs font-bold cursor-pointer"
                >
                  Explorar →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Diário da Cunhagem — 4 Colunas (Fiel a Início.png) */}
      <section id="aprenda" className="pt-4 pb-4 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Diário da Cunhagem</h2>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              image: '/nfts/ape-baron.png',
              meta: '12 de setembro | Leitura de 6 min',
              title: 'Como funciona a propriedade de NFTs',
              summary: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
            },
            {
              image: '/nfts/ape-emerald.png',
              meta: '13 de setembro | Leitura de 2 min',
              title: '10 artistas digitais para acompanhar',
              summary: 'Conheça criadores que moldam a cultura digital.',
            },
            {
              image: '/nfts/ape-sage.png',
              meta: '15 de setembro | Leitura de 3 min',
              title: 'Raridade, atributos e procedência',
              summary: 'Entenda raridade, procedência, direitos autorais e utilidade.',
            },
            {
              image: '/nfts/ape-golden.png',
              meta: '15 de setembro | Leitura de 2 min',
              title: 'Como proteger sua carteira',
              summary: 'Proteja sua carteira, seus ativos e sua identidade.',
            },
          ].map((post, idx) => (
            <article
              key={idx}
              className="bg-[#1E1712] border border-border rounded-2xl overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-square overflow-hidden bg-[#14100D]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[11px] text-primary font-medium">{post.meta}</p>
                  <h3 className="font-bold text-sm text-foreground leading-snug">{post.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{post.summary}</p>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button
                  type="button"
                  onClick={() => toast.info(`Lendo artigo: "${post.title}"`)}
                  className="text-xs font-bold text-primary hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                >
                  Ler mais <span>→</span>
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
