import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNFTById, addToCart, addFavorite, removeFavorite, getFavorites } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/AuthModal'

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

  const { data: nft, isLoading, isError } = useQuery({
    queryKey: ['nft', id],
    queryFn: () => getNFTById(id),
  })

  // Consulta de favoritos para botão na página de detalhes
  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  })

  const isFavorited = favData?.favorites?.includes(id) ?? false

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return removeFavorite(id)
      } else {
        return addFavorite(id)
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const prev = queryClient.getQueryData<{ favorites: string[] }>(['favorites'])
      queryClient.setQueryData<{ favorites: string[] }>(['favorites'], (old) => {
        const list = old?.favorites || []
        return {
          favorites: isFavorited ? list.filter((item) => item !== id) : [...list, id],
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
    mutationFn: () => addToCart(id, quantity),
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
      <div className="container mx-auto px-4 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
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

  // Tratamento de 404 (Item inexistente) - Requisito do Desafio
  if (isError || !nft) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-3xl mb-6">
          ⚠
        </div>
        <h1 className="font-sans text-3xl font-bold mb-3 text-foreground">NFT não encontrado</h1>
        <p className="font-mono text-sm text-muted-foreground max-w-md mb-8">
          O token com identificador <span className="text-foreground font-bold">#{id}</span> não existe no catálogo ou
          foi deslistado da plataforma.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-full px-8 h-11">
          Voltar para o catálogo
        </Button>
      </div>
    )
  }

  const currentEdition = selectedEdition || nft.editionType
  const isSoldOut = nft.available === 0

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-foreground transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link to="/" search={{ category: nft.category }} className="hover:text-foreground transition-colors">
          {nft.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold truncate max-w-xs">{nft.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        {/* Coluna da Imagem */}
        <div className="w-full lg:w-1/2 aspect-square bg-secondary rounded-[28px] overflow-hidden border border-border/70 relative shadow-2xl">
          <img
            src={nft.image || `https://placehold.co/800x800/e2e8f0/1e293b.png?text=${encodeURIComponent(nft.title)}`}
            alt={nft.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.info('Faça login para favoritar.')
                setIsAuthOpen(true)
                return
              }
              favoriteMutation.mutate()
            }}
            aria-label={isFavorited ? 'Remover favorito' : 'Favoritar'}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-background/70 backdrop-blur-md flex items-center justify-center border border-border hover:bg-background transition-colors cursor-pointer"
          >
            <span className="text-lg">{isFavorited ? '❤️' : '🤍'}</span>
          </button>
        </div>

        {/* Coluna de Detalhes */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div>
            {/* Informações do Criador */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={nft.creator.avatar}
                alt={nft.creator.name}
                className="w-9 h-9 rounded-full object-cover border border-primary/40"
              />
              <div>
                <span className="font-mono text-xs text-muted-foreground">Criado por</span>
                <p className="font-mono text-xs font-bold text-foreground flex items-center gap-1">
                  {nft.creator.name}
                  {nft.creator.verified && <span className="text-primary text-[10px]" title="Verificado">✓</span>}
                </p>
              </div>
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
              {nft.title}
            </h1>

            {/* Preço e Avaliação */}
            <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-border/80 pb-6">
              <div>
                <span className="font-mono text-xs text-muted-foreground block">Preço Atual</span>
                <span className="font-mono text-3xl font-extrabold text-primary">{nft.price} ETH</span>
              </div>

              <div className="flex items-center gap-1.5 text-primary text-xs font-mono bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
                <span>★ {nft.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({nft.reviewsCount} avaliações)</span>
              </div>

              <div className="font-mono text-xs">
                <span className="text-muted-foreground">Estoque: </span>
                <span className={isSoldOut ? 'text-destructive font-bold' : 'text-foreground font-bold'}>
                  {isSoldOut ? 'Esgotado' : `${nft.available} unidades disponíveis`}
                </span>
              </div>
            </div>

            {/* Descrição e Metadados */}
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-bold text-sm text-foreground mb-2">Sobre este colecionável:</h3>
                <p className="font-mono text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {nft.description}
                </p>
              </div>

              {/* Seletor de Edição */}
              <div>
                <h3 className="font-sans font-bold text-sm text-foreground mb-3">Edição:</h3>
                <div className="flex flex-wrap gap-2.5 font-mono text-xs">
                  {['1/1', '1/10', '1/50', 'ABERTA'].map((ed) => (
                    <button
                      key={ed}
                      onClick={() => setSelectedEdition(ed)}
                      className={`px-4 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        currentEdition === ed
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      {ed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Atributos / Traits */}
              <div>
                <h3 className="font-sans font-bold text-sm text-foreground mb-3">Atributos & Propriedades:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-secondary p-3 rounded-xl border border-border/60">
                    <span className="font-mono text-[11px] text-muted-foreground block">Rede</span>
                    <span className="font-mono text-xs font-bold text-foreground">{nft.network}</span>
                  </div>
                  <div className="bg-secondary p-3 rounded-xl border border-border/60">
                    <span className="font-mono text-[11px] text-muted-foreground block">Coleção</span>
                    <span className="font-mono text-xs font-bold text-foreground truncate block">{nft.collection}</span>
                  </div>
                  {nft.attributes.map((attr, idx) => (
                    <div key={idx} className="bg-secondary p-3 rounded-xl border border-border/60">
                      <span className="font-mono text-[11px] text-muted-foreground block">{attr.trait_type}</span>
                      <span className="font-mono text-xs font-bold text-foreground">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ações de Compra & Quantidade */}
          <div className="mt-10 pt-6 border-t border-border/80 flex flex-wrap items-center gap-6">
            {!isSoldOut && (
              <div className="flex items-center gap-3 bg-secondary rounded-full p-1 border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-background text-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-mono w-6 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(nft.available, quantity + 1))}
                  disabled={quantity >= nft.available}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-background text-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
                >
                  +
                </button>
              </div>
            )}

            <Button
              size="lg"
              disabled={isSoldOut || cartMutation.isPending}
              onClick={() => cartMutation.mutate()}
              className="flex-1 rounded-full font-bold font-sans text-sm h-12 text-primary-foreground shadow-lg shadow-primary/20"
            >
              {cartMutation.isPending
                ? 'Adicionando ao carrinho...'
                : isSoldOut
                ? 'Item Esgotado'
                : `Adicionar ao Carrinho (${(parseFloat(nft.price) * quantity).toFixed(2)} ETH)`}
            </Button>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}
