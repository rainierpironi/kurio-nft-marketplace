import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, createOrder, getCheckoutQuote } from '@/lib/api'
import { Button } from '@/components/button'
import { Separator } from '@/components/separator'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export const Route = createFileRoute('/pagamento')({
  component: Pagamento,
})

function Pagamento() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: authUser } = useAuth()

  // Chave de Idempotência persistente na montagem do checkout para evitar duplicidade
  const [idempotencyKey] = useState(() => {
    return window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  })

  // Campos do Formulário Figma
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [network, setNetwork] = useState('Ethereum')
  const [profileName, setProfileName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [secondaryWallet, setSecondaryWallet] = useState('')
  const [walletType, setWalletType] = useState('MetaMask')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [collectorNote, setCollectorNote] = useState('')

  // Cupom
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  // Preenche dados automaticamente se usuário estiver logado
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

  // Cotação com validação de cupom e gas fee
  const { data: quoteData, isLoading: isQuoteLoading } = useQuery({
    queryKey: ['checkout-quote', appliedCoupon, cartData?.items],
    queryFn: () => getCheckoutQuote(appliedCoupon || undefined),
    enabled: !!cartData?.items && cartData.items.length > 0,
  })

  const [hasFailed, setHasFailed] = useState(false)

  // Mutação do Pedido com Chave de Idempotência
  const orderMutation = useMutation({
    mutationFn: async () => {
      // Validação prévia dos campos essenciais do layout
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

      // Redireciona diretamente para o recibo snapshot da compra
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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = couponCode.trim().toUpperCase()
    if (clean === 'KURIO10' || clean === 'GREENMINT20') {
      setAppliedCoupon(clean)
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
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center flex flex-col items-center">
        <span className="text-4xl mb-4">🛒</span>
        <h1 className="font-sans text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground font-mono text-xs mb-6">
          Adicione colecionáveis ao carrinho antes de prosseguir com o pagamento.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-full px-8">
          Explorar Catálogo
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <div className="font-mono text-xs text-muted-foreground mb-8 flex items-center gap-2">
        <Link to="/" className="hover:text-foreground">
          Início
        </Link>
        <span>/</span>
        <Link to="/" className="hover:text-foreground">
          Mercado
        </Link>
        <span>/</span>
        <span className="text-foreground font-bold">Pagamento</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Lado Esquerdo: Formulário Completo do Figma (Perfil do Colecionador / Dados da Compra) */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="font-sans text-2xl sm:text-3xl font-black text-foreground mb-2">
              Perfil do colecionador
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              Preencha suas informações para emissão e transferência do colecionável na blockchain.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              orderMutation.mutate()
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs"
          >
            <div className="space-y-1.5">
              <label className="text-foreground font-bold">
                Nome de exibição <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Alex Nomad"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">
                Nome de usuário <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: alexnomad"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">
                Rede <span className="text-primary">*</span>
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="Ethereum">Ethereum</option>
                <option value="Polygon">Polygon</option>
                <option value="Solana">Solana</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">
                Nome do perfil <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Alex Nomad Vault"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-foreground font-bold">
                Endereço da carteira <span className="text-primary">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Endereço 0x da carteira principal"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
                />
                <input
                  type="text"
                  placeholder="ENS ou carteira secundária (opcional)"
                  value={secondaryWallet}
                  onChange={(e) => setSecondaryWallet(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">
                Tipo de carteira <span className="text-primary">*</span>
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="MetaMask">MetaMask</option>
                <option value="Coinbase">Coinbase Wallet</option>
                <option value="WalletConnect">WalletConnect</option>
                <option value="Ledger">Ledger Cold Storage</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">Código de indicação (opcional)</label>
              <input
                type="text"
                placeholder="Ex: KURIO-REF-2026"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">
                E-mail para recibo <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-bold">Domínio Web3 / ENS</label>
              <div className="flex gap-2">
                <span className="bg-secondary border border-border rounded-xl px-3 py-3 text-muted-foreground">
                  .eth
                </span>
                <input
                  type="text"
                  placeholder="nomad"
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-foreground font-bold">Observação do colecionador (opcional)</label>
              <textarea
                rows={3}
                placeholder="Alguma instrução especial para a transação?"
                value={collectorNote}
                onChange={(e) => setCollectorNote(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-foreground resize-none"
              />
            </div>
          </form>
        </div>

        {/* Lado Direito: Resumo de Itens e Cotação */}
        <div className="w-full lg:w-[440px] shrink-0">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="font-sans text-xl font-bold text-foreground">Resumo do Pedido</h2>

            {/* Lista dos NFTs */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartData?.items.map((item) => (
                <div
                  key={item.nftId}
                  className="flex items-center gap-3 bg-secondary/80 p-3 rounded-2xl border border-border/50"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-background">
                    <img
                      src={
                        item.nft?.image ||
                        `https://placehold.co/100x100/e2e8f0/1e293b.png?text=${encodeURIComponent(item.nft?.title?.charAt(0) || 'N')}`
                      }
                      alt={item.nft?.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-xs text-foreground truncate">{item.nft?.title}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">ID: #{item.nftId}</p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className="text-muted-foreground block">x{item.quantity}</span>
                    <span className="font-bold text-primary">
                      {(parseFloat(item.nft?.price || '0') * item.quantity).toFixed(2)} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupom de Desconto */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Código promocional (ex: KURIO10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              {appliedCoupon ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAppliedCoupon(null)
                    setCouponCode('')
                  }}
                  className="font-mono text-xs rounded-xl border-destructive/50 text-destructive"
                >
                  ✕
                </Button>
              ) : (
                <Button type="submit" size="sm" className="font-mono text-xs rounded-xl font-bold">
                  Aplicar
                </Button>
              )}
            </form>

            <Separator className="bg-border/60" />

            {/* Linhas da Cotação com ETH strings */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">{quoteData?.subtotal || '0.0000'} ETH</span>
              </div>

              {appliedCoupon && quoteData?.discount && parseFloat(quoteData.discount) > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Desconto ({appliedCoupon})</span>
                  <span>-{quoteData.discount} ETH</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Taxa de rede (Gas Fee)</span>
                <span className="text-foreground">{quoteData?.gasFee || '0.0042'} ETH</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-border/60">
                <span className="text-foreground font-sans text-base">Total a Pagar</span>
                <span className="font-mono text-xl text-primary font-black">
                  {isQuoteLoading ? 'Calculando...' : `${quoteData?.total || '0.0000'} ETH`}
                </span>
              </div>
            </div>

            {/* Mensagem de Erro e Botão de Retry com Chave de Idempotência */}
            {hasFailed && (
              <div className="bg-destructive/10 border border-destructive/40 p-3 rounded-xl text-xs font-mono text-destructive">
                <span>⚠ Falha no processamento. Você pode tentar novamente com a mesma chave de idempotência.</span>
              </div>
            )}

            <Button
              disabled={orderMutation.isPending}
              onClick={() => orderMutation.mutate()}
              className="w-full h-13 text-sm font-black rounded-full font-sans text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
            >
              {orderMutation.isPending
                ? 'Processando na blockchain...'
                : hasFailed
                ? 'Tentar Novamente (Recuperar Pedido)'
                : 'Confirmar e Pagar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
