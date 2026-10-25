import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, createOrder, getCheckoutQuote, updateCartItem, removeFromCart } from '@/lib/api'
import { Button } from '@/components/button'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export const Route = createFileRoute('/pagamento')({
  component: Pagamento,
})

function generateIdempotencyKey() {
  return window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function Pagamento() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: authUser } = useAuth()

  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey)
  const [quoteStale, setQuoteStale] = useState(false)

  // Campos do Formulário Figma (Pagamento.png)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [network, setNetwork] = useState('Ethereum')
  const [profileName, setProfileName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [secondaryWallet, setSecondaryWallet] = useState('')
  const [walletType, setWalletType] = useState('Coinbase Wallet')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [useAnotherWallet, setUseAnotherWallet] = useState(false)
  const [collectorNote, setCollectorNote] = useState('')

  // Cupom
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  useEffect(() => {
    if (authUser) {
      setDisplayName(authUser.name || '')
      setUsername(authUser.username || '')
      setEmail(authUser.email || '')
      setProfileName(authUser.name || '')
      const primaryW = authUser.wallets?.find((w) => w.isPrimary) || authUser.wallets?.[0]
      if (primaryW) {
        setWalletAddress(primaryW.address)
        setNetwork(primaryW.network || 'Ethereum')
      }
    }
  }, [authUser])

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  })

  // Escuta evento de alteração em tempo real nos itens do carrinho
  useEffect(() => {
    const handleRealtimeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (!detail || !cartData?.items) return
      const isInCart = cartData.items.some((item) => item.nftId === detail.id)
      if (isInCart) {
        setQuoteStale(true)
        toast.warning(
          `Cotação alterada! O item "${detail.title}" mudou para ${detail.price} ETH. Confirme a nova cotação antes de pagar.`
        )
      }
    }

    window.addEventListener('KURIO_NFT_UPDATED', handleRealtimeChange)
    return () => window.removeEventListener('KURIO_NFT_UPDATED', handleRealtimeChange)
  }, [cartData?.items])

  const { data: quoteData, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['checkout-quote', appliedCoupon, cartData?.items],
    queryFn: () => getCheckoutQuote(appliedCoupon || undefined),
    enabled: !!cartData?.items && cartData.items.length > 0,
  })

  const [hasFailed, setHasFailed] = useState(false)

  const hasStockConflict = cartData?.items.some((item) => {
    const available = item.nft?.available ?? 0
    return item.quantity > available
  })

  const adjustItemMutation = useMutation({
    mutationFn: async ({ nftId, available }: { nftId: string; available: number }) => {
      if (available <= 0) {
        return removeFromCart(nftId)
      }
      return updateCartItem(nftId, available)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['checkout-quote'] })
      toast.success('Quantidade ajustada para o estoque disponível!')
    },
  })

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (quoteStale) {
        throw new Error('A cotação mudou em tempo real. Confirme os novos valores antes de finalizar.')
      }
      if (hasStockConflict) {
        throw new Error('Um item no carrinho excede o estoque disponível. Ajuste antes de pagar.')
      }
      if (!displayName.trim() || !username.trim() || !email.trim()) {
        throw new Error('Por favor, preencha nome, nome de usuário e e-mail.')
      }
      if (!walletAddress.trim()) {
        throw new Error('Por favor, informe o endereço da sua carteira.')
      }

      return createOrder(
        {
          items: cartData?.items,
          subtotal: quoteData?.subtotal,
          discount: quoteData?.discount,
          gasFee: quoteData?.gasFee,
          total: quoteData?.total,
          network,
          walletAddress,
          displayName,
          username,
          collectorNote,
        },
        idempotencyKey
      )
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
      setHasFailed(false)

      if (response.recovered) {
        toast.info('Pedido recuperado com sucesso via chave de idempotência!')
      } else {
        toast.success(`Pedido #${response.order.id} confirmado com sucesso!`)
      }

      navigate({
        to: '/confirmacao/$id',
        params: { id: response.order.id },
      })
    },
    onError: (error: any) => {
      setHasFailed(true)
      const msg = error.response?.data?.message || error.message || 'Erro de rede ou timeout ao processar o pagamento.'
      toast.error(msg)
    },
  })

  const handleConfirmNewQuote = () => {
    setQuoteStale(false)
    setIdempotencyKey(generateIdempotencyKey())
    queryClient.invalidateQueries({ queryKey: ['checkout-quote'] })
    toast.success('Nova cotação confirmada! Você já pode concluir o pagamento.')
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = couponCode.trim().toUpperCase()
    if (clean === 'KURIO10' || clean === 'GREENMINT20') {
      setAppliedCoupon(clean)
      setIdempotencyKey(generateIdempotencyKey())
      toast.success(`Cupom ${clean} aplicado!`)
    } else {
      toast.error('Cupom inválido. Tente KURIO10.')
    }
  }

  if (isCartLoading) {
    return <div className="p-16 text-center text-muted-foreground font-mono">Carregando checkout...</div>
  }

  if (!cartData?.items.length) {
    return (
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-20 text-center flex flex-col items-center font-mono">
        <h1 className="text-xl font-bold mb-2 text-foreground">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground text-xs mb-6">
          Adicione colecionáveis ao carrinho antes de prosseguir com o pagamento.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-md px-8">
          Explorar Catálogo
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-6 lg:py-10 font-mono">
      {/* Cabeçalho Mobile Fiel a MPagamento.png */}
      <div className="md:hidden space-y-5 mb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate({ to: '/carrinho' })}
            aria-label="Voltar ao carrinho"
            className="w-9 h-9 rounded-full bg-[#1E1712] border border-border text-foreground flex items-center justify-center cursor-pointer"
          >
            ‹
          </button>
          <h2 className="text-sm font-bold text-foreground">Pagamento com carteira</h2>
          <span className="w-9" />
        </div>

        {/* Seção Mobile: Carteira conectada (Reserva / Principal) Fiel a MPagamento.png */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Carteira conectada</span>
            <Link to="/carteiras" className="text-primary font-bold hover:underline">
              Trocar carteira
            </Link>
          </div>

          {[
            {
              id: 'reserva',
              title: 'Reserva',
              addr: 'nova.kurio.eth',
              net: 'Rede Polygon',
              addressVal: 'nova.kurio.eth',
              networkVal: 'Polygon',
            },
            {
              id: 'principal',
              title: 'Principal',
              addr: walletAddress || '0xA91F...E82C',
              net: 'Rede principal Ethereum',
              addressVal: walletAddress || '0xA91F...E82C',
              networkVal: 'Ethereum',
            },
          ].map((cw) => {
            const isActive = network === cw.networkVal
            return (
              <div
                key={cw.id}
                onClick={() => {
                  setNetwork(cw.networkVal)
                  setWalletAddress(cw.addressVal)
                }}
                className={`bg-[#1E1712] border rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isActive ? 'border-primary' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      isActive ? 'border-primary' : 'border-muted-foreground'
                    }`}
                  >
                    {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-foreground block">{cw.title}</span>
                    <span className="text-muted-foreground block text-[11px]">{cw.addr}</span>
                    <span className="text-muted-foreground block text-[11px]">{cw.net}</span>
                  </div>
                </div>
                <span className="text-primary text-xs">✎</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Breadcrumb Fiel a Pagamento.png */}
      <nav aria-label="Breadcrumb" className="hidden md:flex text-xs text-muted-foreground mb-8 items-center gap-1.5">
        <Link to="/" className="text-foreground font-bold hover:text-primary">
          Início
        </Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground">
          Mercado
        </Link>
        <span>/</span>
        <span className="text-muted-foreground">Pagamento</span>
      </nav>

      {/* Banner de Revalidação de Cotação em Tempo Real */}
      {quoteStale && (
        <div
          role="alert"
          className="mb-8 bg-primary/10 border border-primary/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="font-bold text-xs sm:text-sm text-primary flex items-center gap-2">
              <span>📡</span> Atualização de Preço ou Disponibilidade Detectada!
            </p>
            <p className="text-xs text-muted-foreground">
              Os valores dos itens no seu carrinho mudaram durante a navegação. Por segurança, revise o novo total e
              confirme a cotação atualizada antes de prosseguir.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleConfirmNewQuote}
            className="rounded-md font-mono text-xs font-bold px-5 shrink-0"
          >
            Confirmar Nova Cotação ({quoteData?.total || '0.000'} ETH)
          </Button>
        </div>
      )}

      {/* Banner de Conflito de Estoque */}
      {hasStockConflict && (
        <div
          role="alert"
          className="mb-8 bg-destructive/10 border border-destructive/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="font-bold text-xs sm:text-sm text-destructive flex items-center gap-2">
              <span>⚠</span> Estoque Insuficiente para um ou mais itens
            </p>
            <p className="text-xs text-muted-foreground">
              A disponibilidade de um NFT no seu carrinho diminuiu em tempo real. Ajuste as quantidades abaixo para
              continuar.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Coluna Esquerda: Perfil do colecionador (Fiel a Pagamento.png) */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-base font-bold text-foreground">Perfil do colecionador</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              orderMutation.mutate()
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
          >
            <div className="space-y-1.5">
              <label className="text-foreground block">
                Nome de exibição <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Alex Nomad"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                Nome de usuário <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: alexnomad"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                Rede <span className="text-primary">*</span>
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Polygon">Polygon</option>
                <option value="Solana">Solana</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                Nome do perfil <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Alex Nomad Vault"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-foreground block">
                Endereço da carteira <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Endereço 0x da carteira principal"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
                />
                <input
                  type="text"
                  placeholder="ENS ou carteira secundária (opcional)"
                  value={secondaryWallet}
                  onChange={(e) => setSecondaryWallet(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                Tipo de carteira <span className="text-primary">*</span>
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="MetaMask">MetaMask</option>
                <option value="Coinbase Wallet">Coinbase Wallet</option>
                <option value="WalletConnect">WalletConnect</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                Código de indicação <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: KURIO-REF-2026"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                E-mail <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground block">
                Nome ENS <span className="text-primary">*</span>
              </label>
              <div className="flex gap-2">
                <span className="bg-background border border-border rounded-md px-3 py-2.5 text-foreground flex items-center gap-1">
                  .eth <span className="text-[10px]">⌄</span>
                </span>
                <input
                  type="text"
                  placeholder="nomad"
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                  className="flex-1 min-w-0 bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="sm:col-span-2 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={useAnotherWallet}
                  onChange={(e) => setUseAnotherWallet(e.target.checked)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span>Usar outra carteira?</span>
              </label>
            </div>

            <div className="space-y-1.5 sm:col-span-2 pt-2">
              <label className="text-foreground block">Observação do colecionador (opcional)</label>
              <textarea
                rows={5}
                value={collectorNote}
                onChange={(e) => setCollectorNote(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </div>
          </form>
        </div>

        {/* Coluna Direita: Seus NFTs + Carteira e rede (Fiel a Pagamento.png e MPagamento.png) */}
        <div className="lg:col-span-5 space-y-5">
          <h2 className="text-base font-bold text-foreground">Seus NFTs</h2>

          <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-bold text-foreground">
            <span>NFTs</span>
            <span>Subtotal</span>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-3">
            {cartData?.items.map((item) => {
              const available = item.nft?.available ?? 0
              const isExceeded = item.quantity > available
              const tokenId = item.nft?.tokenId || item.nftId.padStart(4, '0')

              return (
                <div
                  key={item.nftId}
                  className={`bg-[#1E1712] p-3.5 rounded-xl border ${
                    isExceeded ? 'border-destructive' : 'border-border'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.nft?.image || '/nfts/ape-emerald.png'}
                        alt={item.nft?.title}
                        className="w-14 h-14 rounded-xl object-cover bg-background shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{item.nft?.title}</p>
                        <p className="text-[11px] text-muted-foreground">ID do token: #{tokenId}</p>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground shrink-0">(x {item.quantity})</span>

                    <span className="font-bold text-xs sm:text-sm text-primary shrink-0">
                      {(parseFloat(item.nft?.price || '0') * item.quantity).toFixed(2)} ETH
                    </span>
                  </div>

                  {isExceeded && (
                    <div className="flex items-center justify-between pt-2 border-t border-destructive/30 text-[11px] text-destructive">
                      <span>Disponível agora: {available} un.</span>
                      <button
                        type="button"
                        onClick={() => adjustItemMutation.mutate({ nftId: item.nftId, available })}
                        className="underline font-bold cursor-pointer hover:text-foreground"
                      >
                        {available > 0 ? `Ajustar para ${available}` : 'Remover item'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Link / Input de Código Promocional */}
          <div className="space-y-2">
            <div className="text-right text-xs text-muted-foreground">
              Tem um código promocional?{' '}
              <button
                type="button"
                onClick={() => setShowCouponInput((v) => !v)}
                className="text-primary hover:underline font-bold cursor-pointer"
              >
                Aplique aqui
              </button>
            </div>

            {(showCouponInput || couponCode || appliedCoupon) && (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código promocional (ex: KURIO10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                />
                {appliedCoupon ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAppliedCoupon(null)
                      setCouponCode('')
                      setIdempotencyKey(generateIdempotencyKey())
                    }}
                    className="text-xs rounded-md border-destructive/50 text-destructive"
                  >
                    ✕
                  </Button>
                ) : (
                  <Button type="submit" size="sm" className="text-xs rounded-md font-bold">
                    Aplicar
                  </Button>
                )}
              </form>
            )}
          </div>

          {/* Totais */}
          <div className="space-y-2.5 text-xs pt-1">
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

          {/* Seção: Carteira e rede (Fiel a Pagamento.png e MPagamento.png) */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-sm font-bold text-foreground">Carteira e rede</h3>

            {[
              { id: 'Multi', label: 'METAMASK • WALLETCONNECT • COINBASE', mobileLabel: 'WalletConnect', badge: 'W', isBadge: true },
              { id: 'MetaMask', label: 'MetaMask', mobileLabel: 'MetaMask', badge: 'M', isBadge: false },
              { id: 'Coinbase Wallet', label: 'Coinbase Wallet', mobileLabel: 'Coinbase Wallet', badge: 'C', isBadge: false },
            ].map((option) => {
              const isSelected = walletType === option.id
              return (
                <label
                  key={option.id}
                  onClick={() => setWalletType(option.id)}
                  className={`flex items-center justify-between gap-3 p-3.5 rounded-xl md:rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border bg-[#1E1712] md:bg-background hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="md:hidden w-8 h-8 rounded-full bg-background border border-border text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {option.badge}
                    </span>
                    <input
                      type="radio"
                      name="walletOption"
                      checked={isSelected}
                      onChange={() => setWalletType(option.id)}
                      className="hidden md:inline-block accent-primary w-3.5 h-3.5"
                    />
                    <span
                      className={
                        option.isBadge
                          ? 'hidden md:inline text-[10px] font-bold text-primary tracking-wider'
                          : 'hidden md:inline text-xs text-foreground'
                      }
                    >
                      {option.label}
                    </span>
                    <span className="md:hidden text-xs font-bold text-foreground">
                      {option.mobileLabel}
                    </span>
                  </div>
                  <span
                    className={`md:hidden w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-muted-foreground'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                </label>
              )
            })}
          </div>

          {hasFailed && (
            <div className="bg-destructive/10 border border-destructive/40 p-3 rounded-lg text-xs text-destructive">
              <span>⚠ Falha no processamento. Você pode tentar novamente com a mesma chave de idempotência.</span>
            </div>
          )}

          {quoteStale ? (
            <Button
              type="button"
              onClick={handleConfirmNewQuote}
              className="w-full h-11 text-xs font-bold rounded-md font-mono bg-primary text-primary-foreground cursor-pointer"
            >
              Confirmar Nova Cotação para Prosseguir
            </Button>
          ) : (
            <Button
              disabled={orderMutation.isPending || hasStockConflict}
              onClick={() => orderMutation.mutate()}
              className="w-full h-11 text-xs font-bold rounded-md font-mono bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              {orderMutation.isPending
                ? 'Processando na blockchain...'
                : hasStockConflict
                ? 'Ajuste o Estoque Acima'
                : hasFailed
                ? 'Tentar Novamente (Recuperar Pedido)'
                : 'Confirmar compra'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
