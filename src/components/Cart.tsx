import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, updateCartItem, removeFromCart, getCheckoutQuote } from '@/lib/api'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet'
import { Separator } from '@/components/separator'
import { ScrollArea } from '@/components/scroll-area'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

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

  // Consulta de Cotação Dinâmica com Cupom e Taxa de Rede
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

  // Verifica se há conflito de estoque em tempo real
  const hasStockConflict = cartData?.items.some((item) => {
    const available = item.nft?.available ?? 0
    return item.quantity > available
  })

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          aria-label="Abrir carrinho"
          className="relative pr-3 cursor-pointer border-none bg-transparent hover:bg-transparent hover:text-primary"
        >
          <span className="text-xl">🛒</span>
          {cartItemsCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground font-mono">
              {cartItemsCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full w-full sm:max-w-md bg-background border-l border-border p-0">
        {/* Cabeçalho */}
        <SheetHeader className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold tracking-tight text-foreground font-sans">
              O seu Carrinho ({cartItemsCount})
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Alerta de conflito de estoque em tempo real */}
        {hasStockConflict && (
          <div className="bg-destructive/15 border-b border-destructive/30 px-6 py-2.5 text-xs font-mono text-destructive flex items-center gap-2">
            <span>⚠</span>
            <span>Aviso: Um item no seu carrinho excede o estoque atualizado!</span>
          </div>
        )}

        {/* Scroll de Itens */}
        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <ScrollArea className="flex-1 h-full" type="always">
            <div className="p-6 pr-5">
              {!cartData?.items || cartData.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <span className="text-4xl mb-3">🛒</span>
                  <p className="text-muted-foreground text-sm font-mono mb-2">O seu carrinho está vazio.</p>
                  <p className="text-muted-foreground/60 text-xs font-mono">
                    Explore o catálogo e adicione colecionáveis.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cartData.items.map((item) => {
                    const available = item.nft?.available ?? 0
                    const isExceeded = item.quantity > available

                    return (
                      <div
                        key={item.nftId}
                        className={`flex items-center gap-4 bg-secondary p-4 rounded-2xl border transition-all ${
                          isExceeded ? 'border-destructive/60 bg-destructive/5' : 'border-border/60'
                        }`}
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background border border-border/40">
                          <img
                            src={
                              item.nft?.image ||
                              `https://placehold.co/100x100/e2e8f0/1e293b.png?text=${encodeURIComponent(item.nft?.title?.charAt(0) || 'N')}`
                            }
                            alt={item.nft?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between h-full min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-sm leading-tight text-foreground font-sans truncate">
                              {item.nft?.title}
                            </span>
                            <button
                              onClick={() => removeMutation.mutate(item.nftId)}
                              aria-label="Remover item"
                              className="text-muted-foreground hover:text-destructive text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <span className="font-mono text-xs text-muted-foreground">
                            {item.nft?.network} • {item.nft?.editionType}
                          </span>

                          <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center gap-2 bg-background rounded-full px-2 py-0.5 border border-border">
                              <button
                                onClick={() => handleQuantityChange(item.nftId, item.quantity, -1, available)}
                                disabled={updateMutation.isPending || removeMutation.isPending}
                                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono text-xs w-4 text-center font-bold">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.nftId, item.quantity, 1, available)}
                                disabled={updateMutation.isPending || item.quantity >= available}
                                className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground text-xs font-bold disabled:opacity-40 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-mono text-sm font-bold text-primary">
                              {(parseFloat(item.nft?.price || '0') * item.quantity).toFixed(2)} ETH
                            </span>
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

        {/* Rodapé Fixo com Cupom e Cotação */}
        {cartData?.items && cartData.items.length > 0 && (
          <div className="p-6 bg-secondary/80 border-t border-border shrink-0 mt-auto space-y-4">
            {/* Campo de Cupom */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Cupom (ex: KURIO10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={!!appliedCoupon}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              {appliedCoupon ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="font-mono text-xs rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Remover
                </Button>
              ) : (
                <Button type="submit" size="sm" className="font-mono text-xs rounded-xl font-bold">
                  Aplicar
                </Button>
              )}
            </form>

            {/* Linhas de Valores */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{quoteData?.subtotal || '0.0000'} ETH</span>
              </div>

              {appliedCoupon && quoteData?.discount && parseFloat(quoteData.discount) > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Desconto ({appliedCoupon})</span>
                  <span>-{quoteData.discount} ETH</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de rede estimada (Gas)</span>
                <span className="text-foreground">{quoteData?.gasFee || '0.0042'} ETH</span>
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-foreground font-sans">Total</span>
              <span className="font-mono font-bold text-xl text-primary">
                {isQuoteLoading ? 'Calculando...' : `${quoteData?.total || '0.0000'} ETH`}
              </span>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={hasStockConflict}
              className="w-full h-12 text-sm font-bold rounded-full font-sans text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              {hasStockConflict ? 'Ajuste quantidades com estoque' : 'Avançar para Pagamento →'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
