import type { NFT } from '@/lib/api'
import { addToCart, addFavorite, removeFavorite, getFavorites } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext'
import { ShoppingCart, Heart, Search } from 'lucide-react'

interface NFTCardProps {
  nft: NFT
  onAuthRequired?: () => void
  compact?: boolean
}

export function NFTCard({ nft, onAuthRequired, compact = false }: NFTCardProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  })

  const isFavorited = favData?.favorites?.includes(nft.id) ?? false

  // Mutação de Favorito com Atualização Otimista e Rollback imediato em caso de erro
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        return removeFavorite(nft.id)
      } else {
        return addFavorite(nft.id)
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const previousFavorites = queryClient.getQueryData<{ favorites: string[] }>(['favorites'])

      queryClient.setQueryData<{ favorites: string[] }>(['favorites'], (old) => {
        const currentList = old?.favorites || []
        const updated = isFavorited
          ? currentList.filter((id) => id !== nft.id)
          : [...currentList, nft.id]
        return { favorites: updated }
      })

      return { previousFavorites }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
      toast.error('Erro ao atualizar favorito. Rollback executado.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.info('Faça login para salvar seus NFTs favoritos.')
      if (onAuthRequired) onAuthRequired()
      return
    }

    favoriteMutation.mutate()
  }

  const cartMutation = useMutation({
    mutationFn: () => addToCart(nft.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success(`${nft.title} adicionado ao carrinho!`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao adicionar item ao carrinho.')
    },
  })

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (nft.available === 0 || cartMutation.isPending) return
    cartMutation.mutate()
  }

  return (
    <div className="group flex flex-col bg-[#1E1712] border border-transparent hover:border-primary/40 rounded-2xl p-3 sm:p-4 transition-all duration-200">
      {/* Container da Arte do NFT */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#14100D] mb-3">
        <Link to="/nft/$id" params={{ id: nft.id }} className="block w-full h-full">
          <img
            src={nft.image || '/nfts/ape-emerald.png'}
            alt={nft.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Selo RARO (Fiel a Início.png no Neon Vessel #552) */}
        {nft.badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground font-mono text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow">
            {nft.badge}
          </span>
        )}

        {/* Botão de Favorito Superior Direito (Fiel a MInício.png + Suporte Otimista) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isFavorited
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-[#14100D]/80 text-primary hover:bg-primary hover:text-primary-foreground'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Barra de Ações Rápidas no Hover (Fiel a Login.png: [🛒] [♡] [🔍]) */}
        {!compact && (
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={nft.available === 0 || cartMutation.isPending}
              title="Adicionar ao carrinho"
              className="w-8 h-8 rounded-md bg-[#1E1712]/95 border border-border hover:border-primary text-primary flex items-center justify-center shadow-lg cursor-pointer disabled:opacity-40"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="sr-only">{nft.available === 0 ? 'Esgotado' : 'Comprar'}</span>
            </button>
            <button
              type="button"
              onClick={handleFavoriteClick}
              title="Favoritar NFT"
              className="w-8 h-8 rounded-md bg-[#1E1712]/95 border border-border hover:border-primary text-foreground hover:text-primary flex items-center justify-center shadow-lg cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/nft/$id', params: { id: nft.id } })}
              title="Ver detalhes do NFT"
              className="w-8 h-8 rounded-md bg-[#1E1712]/95 border border-border hover:border-primary text-foreground hover:text-primary flex items-center justify-center shadow-lg cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Título e Preço */}
      <div className="flex flex-col gap-1.5">
        <Link to="/nft/$id" params={{ id: nft.id }} className="block">
          <h3 className="font-mono text-xs sm:text-[13px] font-normal text-foreground hover:text-primary transition-colors truncate">
            {nft.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs sm:text-sm font-bold text-primary">
              {nft.price} ETH
            </span>
            {nft.oldPrice && (
              <span className="font-mono text-[11px] text-muted-foreground line-through">
                {nft.oldPrice} ETH
              </span>
            )}
          </div>
          {nft.available === 0 && (
            <span className="font-mono text-[10px] font-bold text-destructive uppercase">
              Esgotado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
