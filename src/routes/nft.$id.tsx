import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNFTById, getNFTs, addToCart, addFavorite, removeFavorite, getFavorites } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { NFTCard } from '@/components/NFTCard'
import { toast } from 'sonner'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/AuthModal'
import { Search, Heart, ShoppingCart } from 'lucide-react'

export const Route = createFileRoute('/nft/$id')({
  component: NFTDetails,
})

function NFTDetails() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [selectedEdition, setSelectedEdition] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details')
  const [activeThumb, setActiveThumb] = useState<number>(0)

  const { data: nft, isLoading, isError } = useQuery({
    queryKey: ['nft', id],
    queryFn: () => getNFTById(id),
  })

  const { data: catalogData } = useQuery({
    queryKey: ['nfts-related', nft?.category],
    queryFn: () => getNFTs({ limit: 9 }),
    enabled: !!nft,
  })

  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  })

  const nftActualId = nft?.id || id
  const isFavorited = favData?.favorites?.includes(nftActualId) ?? false

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return removeFavorite(nftActualId)
      } else {
        return addFavorite(nftActualId)
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const prev = queryClient.getQueryData<{ favorites: string[] }>(['favorites'])
      queryClient.setQueryData<{ favorites: string[] }>(['favorites'], (old) => {
        const list = old?.favorites || []
        return {
          favorites: isFavorited ? list.filter((item) => item !== nftActualId) : [...list, nftActualId],
        }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['favorites'], ctx.prev)
      toast.error('Erro ao atualizar favorito.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const cartMutation = useMutation({
    mutationFn: () => addToCart(nftActualId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success(`${quantity}x ${nft?.title} adicionado ao carrinho!`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao adicionar item.')
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-1/2 aspect-square">
          <Skeleton className="w-full h-full rounded-3xl" />
        </div>
        <div className="w-full lg:w-1/2 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-48 rounded-full" />
        </div>
      </div>
    )
  }

  // Tratamento de 404 (Item inexistente)
  if (isError || !nft) {
    return (
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-20 text-center flex flex-col items-center font-mono">
        <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-3xl mb-6">
          ⚠
        </div>
        <h1 className="text-2xl font-bold mb-3 text-foreground">NFT não encontrado</h1>
        <p className="text-xs text-muted-foreground max-w-md mb-8">
          O token com identificador <span className="text-foreground font-bold">#{id}</span> não existe no catálogo ou
          foi deslistado da plataforma.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-md px-8 h-11">
          Voltar para o catálogo
        </Button>
      </div>
    )
  }

  const currentEdition = selectedEdition || nft.editionType
  const isSoldOut = nft.available === 0
  const relatedNFTs = catalogData?.items.filter((item) => item.id !== nft.id).slice(0, 5) || []
  const tokenIdFormatted = nft.tokenId || nft.id.padStart(4, '0')
  const attributesText = nft.attributes?.map((a) => a.value).join(', ') || 'Óculos, Esmeralda, Raro'

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.info('Faça login para favoritar.')
      setIsAuthOpen(true)
      return
    }
    favoriteMutation.mutate()
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8 lg:py-10 space-y-14 font-mono">
      <div>
        {/* Breadcrumb Fiel a Detalhes do NFT.png */}
        <nav aria-label="Breadcrumb" className="hidden md:flex text-xs text-muted-foreground mb-6 items-center gap-1.5">
          <Link to="/" className="text-foreground font-bold hover:text-primary transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link to="/" className="hover:text-foreground transition-colors">
            Mercado
          </Link>
        </nav>

        {/* Topo: Galeria de Imagens (4 Thumbs + Principal) + Especificações do NFT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Coluna Esquerda: 4 Miniaturas Verticais + Imagem Principal */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            {/* 4 Miniaturas (Desktop / Tablet) */}
            <div className="hidden sm:flex sm:flex-col gap-3 shrink-0 justify-center sm:justify-start">
              {[0, 1, 2, 3].map((thumbIdx) => (
                <button
                  key={thumbIdx}
                  type="button"
                  onClick={() => setActiveThumb(thumbIdx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#1E1712] p-1.5 border transition-colors cursor-pointer ${
                    activeThumb === thumbIdx ? 'border-primary' : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={nft.image || '/nfts/ape-emerald.png'}
                    alt={`${nft.title} miniatura ${thumbIdx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>

            {/* Imagem Principal */}
            <div className="flex-1 aspect-square bg-[#1E1712] rounded-2xl p-3 sm:p-6 relative flex items-center justify-center border border-border">
              {/* Botões superiores Mobile (< Voltar e ♡ Favoritar) fieis a MDetalhes do NFT.png */}
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                aria-label="Voltar"
                className="md:hidden absolute top-5 left-5 w-9 h-9 rounded-full bg-[#1E1712]/90 border border-border text-foreground flex items-center justify-center shadow-lg z-10 cursor-pointer"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label="Favoritar NFT"
                className="md:hidden absolute top-5 right-5 w-9 h-9 rounded-full bg-[#1E1712]/90 border border-border text-primary flex items-center justify-center shadow-lg z-10 cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              <img
                src={nft.image || '/nfts/ape-emerald.png'}
                alt={nft.title}
                className="w-full h-full object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={() => toast.info('Visualização em alta resolução ativada.')}
                aria-label="Ampliar imagem"
                className="hidden md:flex absolute top-6 right-6 w-8 h-8 rounded-full bg-background/90 border border-border text-foreground hover:text-primary items-center justify-center cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Indicadores Mobile abaixo da imagem principal */}
              <div className="md:hidden absolute bottom-5 inset-x-0 flex items-center justify-center gap-1.5">
                <span className="w-5 h-1.5 rounded-full bg-primary" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </div>
            </div>
          </div>

          {/* Coluna Direita: Informações de Compra (Card arredondado no Mobile fiel a MDetalhes do NFT.png) */}
          <div className="lg:col-span-6 space-y-5 bg-[#1E1712] md:bg-transparent border border-border md:border-none rounded-3xl md:rounded-none p-5 md:p-0">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">{nft.title}</h1>
                <span className="md:hidden inline-flex items-center gap-1 bg-primary text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0">
                  ★ 4.8 ({nft.reviewsCount})
                </span>
              </div>

              <div className="hidden md:flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
                <span className="text-lg font-bold text-primary">{nft.price} ETH</span>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-primary tracking-widest">★★★★☆</span>
                  <span className="text-foreground/90">{nft.reviewsCount} avaliações de colecionadores</span>
                </div>
              </div>
            </div>

            {/* Sobre este NFT */}
            <div className="space-y-1.5">
              <h3 className="font-bold text-xs text-foreground">Sobre este NFT:</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{nft.description}</p>
            </div>

            {/* Edição */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-foreground">Edição:</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {['1/1', '1/10', '1/50', 'ABERTA'].map((ed) => (
                  <button
                    key={ed}
                    type="button"
                    onClick={() => setSelectedEdition(ed)}
                    className={`px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                      currentEdition === ed
                        ? 'border-primary text-primary font-bold bg-primary/10'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {ed}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantidade + COMPRAR + Favoritar (Fiel a Detalhes do NFT.png no Desktop) */}
            <div className="hidden md:flex flex-wrap items-center gap-3 pt-1">
              {!isSoldOut && (
                <div className="flex items-center gap-2.5 mr-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Diminuir quantidade"
                    className="w-5 h-9 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-sm text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(nft.available, quantity + 1))}
                    disabled={quantity >= nft.available}
                    aria-label="Aumentar quantidade"
                    className="w-5 h-9 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              )}

              <Button
                disabled={isSoldOut || cartMutation.isPending}
                onClick={() => cartMutation.mutate()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 h-10 font-mono font-bold text-xs uppercase cursor-pointer"
              >
                {cartMutation.isPending
                  ? 'Adicionando...'
                  : isSoldOut
                  ? 'Item Esgotado'
                  : 'COMPRAR'}
              </Button>

              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label={isFavorited ? 'Remover favorito' : 'Favoritar'}
                className={`h-10 px-5 rounded-md border font-mono font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                  isFavorited
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                <span>Favoritar</span>
              </button>
            </div>

            {/* Metadados do Token e Compartilhamento */}
            <div className="space-y-1.5 pt-2 text-xs text-muted-foreground">
              <p>
                ID do token: <span className="text-foreground">#{tokenIdFormatted}</span>
              </p>
              <p>
                Coleção: <span className="text-foreground">{nft.collection}</span>
              </p>
              <p>
                Atributos: <span className="text-foreground">{attributesText}</span>
              </p>
              <div className="flex items-center gap-3 pt-1 text-foreground">
                <span className="font-bold">Compartilhar este NFT:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href)
                    toast.success('Link copiado para a área de transferência!')
                  }}
                  className="hover:text-primary transition-colors cursor-pointer font-bold"
                >
                  in
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Compartilhamento por e-mail aberto.')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  ✉
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Compartilhando no X/Twitter.')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  🐦
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Intermediária: Abas Detalhes do NFT | Avaliações de colecionadores (19) */}
      <section className="space-y-6">
        <div className="flex items-center gap-8 border-b border-border text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-foreground/80 hover:text-foreground'
            }`}
          >
            Detalhes do NFT
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-foreground/80 hover:text-foreground'
            }`}
          >
            Avaliações de colecionadores ({nft.reviewsCount})
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-5 text-xs text-muted-foreground leading-relaxed">
            <p>
              Cada NFT da coleção Kurio Apes é registrado na blockchain com histórico completo de procedência,
              metadados verificáveis e autenticidade pública. Ao adquirir esta obra digital, você passa a ter controle
              direto sobre o ativo em sua carteira compatível, podendo mantê-lo em sua coleção privada, exibi-lo em
              galerias virtuais ou negociá-lo no mercado secundário a qualquer momento.
            </p>
            <p>
              Os atributos visuais foram desenvolvidos em edição limitada, combinando paleta esmeralda, iluminação de
              estúdio e elementos raros da série inicial.
            </p>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground">Rede:</h4>
              <p>
                Compatível com carteiras {nft.network}, transferência imediata após confirmação na rede e histórico
                público de transações.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground">Contrato:</h4>
              <p>
                Token padrão ERC-721 com verificação de propriedade, endereço auditável e suporte aos principais
                exploradores de blocos.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground">Direitos autorais:</h4>
              <p>
                Inclui licença para exibição pessoal e participação nos benefícios exclusivos destinados aos detentores
                da coleção.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                author: 'Alex Nomad (@alexnomad)',
                date: 'Há 2 dias',
                text: 'Acabamento impecável e verificação instantânea no contrato ERC-721. Um dos melhores drops da temporada.',
              },
              {
                author: 'Sara Nova (@saranova)',
                date: 'Há 5 dias',
                text: 'Os atributos raros e a paleta esmeralda destacam muito na galeria da minha carteira.',
              },
            ].map((rev, i) => (
              <div key={i} className="bg-[#1E1712] border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{rev.author}</span>
                  <span className="text-primary">★★★★★</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{rev.text}</p>
                <span className="text-[10px] text-muted-foreground block">{rev.date}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Seção Inferior: Mais desta coleção (5 Colunas + 3 pontos de paginação) */}
      {relatedNFTs.length > 0 && (
        <section className="space-y-6 pt-4">
          <h2 className="text-sm font-bold text-primary border-b border-border pb-2">Mais desta coleção</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedNFTs.map((item) => (
              <NFTCard key={item.id} nft={item} compact onAuthRequired={() => setIsAuthOpen(true)} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-2.5 h-2.5 rounded-full border border-primary" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="w-2.5 h-2.5 rounded-full border border-primary" />
          </div>
        </section>
      )}

      {/* Barra de Ação Mobile Fiel a MDetalhes do NFT.png */}
      <div className="md:hidden bg-[#1E1712] border border-border rounded-3xl p-4 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Qtd.</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground"
            >
              -
            </button>
            <span className="font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(nft.available, quantity + 1))}
              className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
          <div>
            <span className="text-primary font-bold text-sm">{(parseFloat(nft.price) * quantity).toFixed(2)} ETH</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            disabled={isSoldOut || cartMutation.isPending}
            onClick={() => cartMutation.mutate()}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl h-11 font-bold text-xs"
          >
            Comprar NFT
          </Button>
          <button
            type="button"
            onClick={() => navigate({ to: '/carrinho' })}
            aria-label="Ir para o carrinho"
            className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}
