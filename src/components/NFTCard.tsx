import { Card, CardContent, CardFooter, CardHeader } from '@/components/card'
import { Button } from '@/components/button'
import type { NFT } from '@/lib/api'
import { addToCart, addFavorite, removeFavorite, getFavorites } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext'

interface NFTCardProps {
  nft: NFT
  onAuthRequired?: () => void
}

export function NFTCard({ nft, onAuthRequired }: NFTCardProps) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  // Consulta de favoritos do usuário logado
  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  })

  const isFavorited = favData?.favorites?.includes(nft.id) ?? false

  // Mutação de Favorito com Atualização Otimista e Rollback em caso de falha (Exigência Eliminatória do Desafio)
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
      // ROLLBACK IMEDIATO DO ESTADO OTIMISTA
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

  // Mutação para adicionar ao carrinho
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

  return (
    <Card className="flex flex-col overflow-hidden bg-card border border-border/70 rounded-2xl hover:border-primary/50 transition-all duration-300 group">
      {/* Imagem Clicável */}
      <Link
        to="/nft/$id"
        params={{ id: nft.id }}
        className="relative aspect-square w-full bg-secondary overflow-hidden group cursor-pointer block"
      >
        <img
          src={nft.image || `https://placehold.co/400x400/e2e8f0/1e293b.png?text=${encodeURIComponent(nft.title)}`}
          alt={nft.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-background/80 backdrop-blur-md font-mono text-[11px] px-2.5 py-1 rounded-full text-foreground border border-border/50">
            {nft.network}
          </span>
          <span className="bg-primary/20 backdrop-blur-md text-primary font-mono text-[11px] px-2.5 py-1 rounded-full font-bold">
            {nft.editionType}
          </span>
        </div>

        {/* Botão de Favorito (Otimista) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md ${
            isFavorited
              ? 'bg-red-500/20 text-red-500 border border-red-500/40'
              : 'bg-background/60 text-muted-foreground hover:text-foreground border border-border/50'
          }`}
        >
          <span className="text-sm">{isFavorited ? '❤️' : '🤍'}</span>
        </button>
      </Link>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-1">
          <span>{nft.collection}</span>
          <span>★ {nft.rating.toFixed(1)}</span>
        </div>

        {/* Título Clicável */}
        <Link to="/nft/$id" params={{ id: nft.id }} className="block">
          <h3 className="text-[16px] font-sans font-bold tracking-tight text-card-foreground hover:text-primary transition-colors cursor-pointer truncate">
            {nft.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="flex-1 px-4 py-0">
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-muted-foreground">Preço</span>
            <span className="font-mono text-base font-bold text-primary">{nft.price} ETH</span>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs text-muted-foreground">Disponível</span>
            <p className="font-mono text-xs font-medium text-foreground">
              {nft.available > 0 ? `${nft.available} em estoque` : <span className="text-destructive font-bold">Esgotado</span>}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-4 flex justify-between items-center border-t border-border/60 mt-3">
        <Link
          to="/nft/$id"
          params={{ id: nft.id }}
          className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver detalhes →
        </Link>

        <Button
          variant="default"
          size="sm"
          className="font-mono text-xs font-bold rounded-full px-5 text-primary-foreground"
          disabled={nft.available === 0 || cartMutation.isPending}
          onClick={() => cartMutation.mutate()}
        >
          {cartMutation.isPending ? 'Adicionando...' : nft.available === 0 ? 'Esgotado' : 'Comprar'}
        </Button>
      </CardFooter>
    </Card>
  )
}
