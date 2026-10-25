import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, updateCartItem, removeFromCart, getCheckoutQuote } from '@/lib/api'
import { Button } from '@/components/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet'
import { ScrollArea } from '@/components/scroll-area'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { ShoppingCart, Trash2 } from 'lucide-react'

export function Cart() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  })

  const { data: quoteData, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['checkout-quote', appliedCoupon, cartData?.items],
    queryFn: () => getCheckoutQuote(appliedCoupon || undefined),
    enabled: !!cartData?.items && cartData.items.length > 0,
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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    toast.info('Cupom removido.')
  }

  const handleCheckout = () => {
    setIsOpen(false)
    navigate({ to: '/pagamento' })
  }

  const cartItemsCount = cartData?.items.reduce((total, item) => total + item.quantity, 0) || 0

  const hasStockConflict = cartData?.items.some((item) => {
    const available = item.nft?.available ?? 0
    return item.quantity > available
  })

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir carrinho"
          className="relative p-2 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartItemsCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-mono font-bold">
              {cartItemsCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-full sm:max-w-md bg-background border-l border-border p-0">
        {/* Cabeçalho Fiel a MCarrinho de NFTs.png */}
        <SheetHeader className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between pr-6">
            <SheetTitle className="text-base font-bold tracking-tight text-foreground font-mono">
              Carrinho de NFTs ({cartItemsCount})
            </SheetTitle>
            <Link
              to="/carrinho"
              onClick={() => setIsOpen(false)}
              className="font-mono text-xs text-primary hover:underline"
            >
              Ver página →
            </Link>
          </div>
        </SheetHeader>

        {hasStockConflict && (
          <div className="bg-destructive/15 border-b border-destructive/30 px-6 py-2.5 text-xs font-mono text-destructive flex items-center gap-2">
            <span>⚠</span>
            <span>Aviso: Um item no seu carrinho excede o estoque atualizado!</span>
          </div>
        )}

        {/* Lista de Itens */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <ScrollArea className="flex-1 h-full" type="always">
            <div className="p-6 pr-5">
              {!cartData?.items || cartData.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-xs font-mono mb-2">Seu carrinho está vazio.</p>
                  <p className="text-muted-foreground/60 text-[11px] font-mono">
                    Explore o catálogo e adicione NFTs à sua carteira.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {cartData.items.map((item) => {
                    const available = item.nft?.available ?? 0
                    const isExceeded = item.quantity > available

                    return (
                      <div
                        key={item.nftId}
                        className={`flex items-center gap-3.5 bg-[#1E1712] p-3.5 rounded-2xl border transition-all ${
                          isExceeded ? 'border-destructive/60 bg-destructive/5' : 'border-border'
                        }`}
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background">
                          <img
                            src={item.nft?.image || '/nfts/ape-emerald.png'}
                            alt={item.nft?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between min-w-0 gap-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-xs text-foreground font-mono truncate">
                              {item.nft?.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMutation.mutate(item.nftId)}
                              aria-label="Remover item"
                              className="text-muted-foreground hover:text-destructive text-xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-mono text-[11px] text-muted-foreground">
                            Edição: <strong className="text-foreground">{item.nft?.editionType || '1/50'}</strong>
                          </span>

                          <div className="flex justify-between items-center mt-1">
                            <span className="font-mono text-xs font-bold text-primary">
                              {(parseFloat(item.nft?.price || '0') * item.quantity).toFixed(2)} ETH
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.nftId, item.quantity, -1, available)}
                                disabled={updateMutation.isPending || removeMutation.isPending}
                                className="h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground hover:border-primary text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono text-xs w-4 text-center font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.nftId, item.quantity, 1, available)}
                                disabled={updateMutation.isPending || item.quantity >= available}
                                className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Rodapé com Código Promocional e Resumo da Carteira */}
        {cartData?.items && cartData.items.length > 0 && (
          <div className="p-6 bg-[#1E1712] border-t border-border shrink-0 mt-auto space-y-4 font-mono">
            <form onSubmit={handleApplyCoupon} className="flex w-full">
              <input
                type="text"
                placeholder="Digite o código promocional..."
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={!!appliedCoupon}
                className="flex-1 min-w-0 bg-background border border-primary/60 rounded-l-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-r-lg text-xs font-bold cursor-pointer"
                >
                  Remover
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-r-lg text-xs font-bold cursor-pointer"
                >
                  Aplicar
                </button>
              )}
            </form>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-bold">{quoteData?.subtotal || '0.00'} ETH</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Desconto do lançamento</span>
                <span className="text-foreground">
                  {appliedCoupon && quoteData?.discount ? `(-) ${quoteData.discount} ETH` : '(-) 00.00'}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de rede</span>
                <div className="text-right">
                  <span className="text-foreground font-bold block">{quoteData?.gasFee || '0.016'} ETH</span>
                  <span className="text-primary text-[10px]">Taxa estimada</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="font-bold text-sm text-foreground">Total</span>
              <span className="font-bold text-base text-primary">
                {isQuoteLoading ? 'Calculando...' : `${quoteData?.total || '0.000'} ETH`}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={hasStockConflict}
              className="w-full h-11 text-xs font-bold rounded-xl font-mono bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {hasStockConflict ? 'Ajuste quantidades com estoque' : 'Conectar e finalizar'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
