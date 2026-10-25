import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, updateCartItem, removeFromCart, getCheckoutQuote, getNFTs } from '@/lib/api'
import { Button } from '@/components/button'
import { NFTCard } from '@/components/NFTCard'
import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  })

  const { data: quoteData, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['checkout-quote', appliedCoupon, cartData?.items],
    queryFn: () => getCheckoutQuote(appliedCoupon || undefined),
    enabled: !!cartData?.items && cartData.items.length > 0,
  })

  const { data: catalogData } = useQuery({
    queryKey: ['nfts-cart-related'],
    queryFn: () => getNFTs({ limit: 5 }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => updateCartItem(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao alterar quantidade.')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.info('Item removido do carrinho.')
    },
  })

  const handleQuantityChange = (nftId: string, currentQty: number, change: number, maxStock: number) => {
    const newQty = currentQty + change
    if (newQty <= 0) {
      removeMutation.mutate(nftId)
    } else if (newQty > maxStock) {
      toast.error(`Limite de estoque atingido (${maxStock} disponíveis)`)
    } else {
      updateMutation.mutate({ id: nftId, qty: newQty })
    }
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return

    const code = couponInput.trim().toUpperCase()
    if (code === 'KURIO10' || code === 'GREENMINT20') {
      setAppliedCoupon(code)
      toast.success(`Cupom ${code} aplicado com sucesso!`)
    } else {
      toast.error('Cupom inválido ou expirado. Tente KURIO10.')
    }
  }

  const items = cartData?.items || []
  const relatedNFTs = catalogData?.items.slice(0, 5) || []

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8 lg:py-10 space-y-14 font-mono">
      {/* Breadcrumb Fiel a Carrinho de NFTs.png */}
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Link to="/" className="text-foreground font-bold hover:text-primary transition-colors">
          Início
        </Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground transition-colors">
          Mercado
        </Link>
        <span>/</span>
        <span className="text-muted-foreground">Carrinho</span>
      </nav>

      {/* Grid Principal: Tabela de NFTs + Resumo da Carteira */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Tabela de Itens */}
        <div className="lg:col-span-8 space-y-4">
          <div className="hidden sm:grid grid-cols-12 border-b border-border pb-3 text-xs font-bold text-foreground px-4">
            <div className="col-span-6">NFTs</div>
            <div className="col-span-2">Preço</div>
            <div className="col-span-2">Edições</div>
            <div className="col-span-2">Total</div>
          </div>

          {isCartLoading ? (
            <div className="p-10 text-center text-xs text-muted-foreground bg-[#1E1712] rounded-xl">
              Carregando seu carrinho...
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center bg-[#1E1712] border border-border rounded-xl space-y-4">
              <p className="text-sm font-bold text-foreground">Seu carrinho de NFTs está vazio.</p>
              <p className="text-xs text-muted-foreground">
                Explore o catálogo da Kurio e adicione colecionáveis verificados.
              </p>
              <Button
                onClick={() => navigate({ to: '/' })}
                className="bg-primary text-primary-foreground rounded-md px-6 h-10 text-xs font-bold"
              >
                Explorar Mercado
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const available = item.nft?.available ?? 10
                const unitPrice = parseFloat(item.nft?.price || '0')
                const lineTotal = (unitPrice * item.quantity).toFixed(2)
                const tokenId = item.nft?.tokenId || item.nftId.padStart(4, '0')

                return (
                  <div
                    key={item.nftId}
                    className="bg-[#1E1712] border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 items-center gap-4"
                  >
                    {/* NFT Info */}
                    <div className="sm:col-span-6 flex items-center gap-4">
                      <Link
                        to="/nft/$id"
                        params={{ id: item.nftId }}
                        className="w-16 h-16 rounded-xl overflow-hidden bg-background shrink-0"
                      >
                        <img
                          src={item.nft?.image || '/nfts/ape-emerald.png'}
                          alt={item.nft?.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <Link
                          to="/nft/$id"
                          params={{ id: item.nftId }}
                          className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors block truncate"
                        >
                          {item.nft?.title}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          ID do token: #{tokenId}
                        </span>
                      </div>
                    </div>

                    {/* Preço Unitário */}
                    <div className="sm:col-span-2 text-xs text-muted-foreground">
                      <span className="sm:hidden font-bold text-foreground mr-2">Preço:</span>
                      {unitPrice.toFixed(2)} ETH
                    </div>

                    {/* Edições (Quantidade) */}
                    <div className="sm:col-span-2 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.nftId, item.quantity, -1, available)}
                        disabled={updateMutation.isPending || removeMutation.isPending}
                        aria-label="Diminuir quantidade"
                        className="w-4 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold text-xs text-foreground">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.nftId, item.quantity, 1, available)}
                        disabled={updateMutation.isPending || item.quantity >= available}
                        aria-label="Aumentar quantidade"
                        className="w-4 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Total + Lixeira */}
                    <div className="sm:col-span-2 flex items-center justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-primary">{lineTotal} ETH</span>
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(item.nftId)}
                        aria-label="Remover item"
                        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Resumo da carteira */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-bold text-foreground border-b border-border pb-3">
            Resumo da carteira
          </h2>

          <div className="space-y-2">
            <label className="text-xs text-foreground block">Código promocional</label>
            <form onSubmit={handleApplyCoupon} className="flex w-full">
              <input
                type="text"
                placeholder="Digite o código promocional..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={!!appliedCoupon}
                className="flex-1 min-w-0 bg-background border border-primary/70 rounded-l-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null)
                    setCouponInput('')
                  }}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-r-md text-xs font-bold cursor-pointer"
                >
                  Remover
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-r-md text-xs font-bold cursor-pointer"
                >
                  Aplicar
                </button>
              )}
            </form>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-foreground">{quoteData?.subtotal || '0.00'} ETH</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto do lançamento</span>
              <span className="text-foreground">
                {appliedCoupon && quoteData?.discount ? `(-) ${quoteData.discount} ETH` : '(-) 00.00'}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Taxa de rede</span>
              <div className="text-right">
                <span className="font-bold text-foreground block">{quoteData?.gasFee || '0.016'} ETH</span>
                <span className="text-[11px] text-primary">Taxa estimada</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center">
              <span className="font-bold text-sm text-foreground">Total</span>
              <span className="font-bold text-base text-primary">
                {isQuoteLoading ? 'Calculando...' : `${quoteData?.total || '0.000'} ETH`}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              disabled={items.length === 0}
              onClick={() => navigate({ to: '/pagamento' })}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-mono font-bold text-xs cursor-pointer"
            >
              Conectar e finalizar
            </Button>

            <Link
              to="/"
              className="block text-center text-xs text-primary hover:underline py-1"
            >
              Continuar explorando
            </Link>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Colecionadores também viram (Fiel a Carrinho de NFTs.png) */}
      {relatedNFTs.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-sm font-bold text-primary border-b border-border pb-2">
            Colecionadores também viram
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedNFTs.map((item) => (
              <NFTCard key={item.id} nft={item} compact />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-2.5 h-2.5 rounded-full border border-primary" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="w-2.5 h-2.5 rounded-full border border-primary" />
          </div>
        </section>
      )}
    </div>
  )
}
