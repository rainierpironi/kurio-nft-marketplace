import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, addWallet, updateWallet, deleteWallet } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
  User,
  Wallet,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
} from 'lucide-react'

export const Route = createFileRoute('/carteiras')({
  component: CarteirasPage,
})

function CarteirasPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, user: authUser, logout } = useAuth()

  // Campos Fiel a Carteiras.png
  const [displayName, setDisplayName] = useState('')
  const [walletNickname, setWalletNickname] = useState('')
  const [network, setNetwork] = useState('Ethereum')
  const [profileName, setProfileName] = useState('')
  const [address, setAddress] = useState('')
  const [secondaryEns, setSecondaryEns] = useState('')
  const [walletType, setWalletType] = useState('MetaMask')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [sameAsPrimary, setSameAsPrimary] = useState(false)

  const { data: userData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await getMe()
      return data.user
    },
    enabled: isAuthenticated,
  })

  useEffect(() => {
    const u = userData || authUser
    if (u) {
      setDisplayName(u.name || '')
      setProfileName(u.name || '')
      setEmail(u.email || '')
      setEnsName(u.username || '')
      const primary = u.wallets?.find((w) => w.isPrimary) || u.wallets?.[0]
      if (primary) {
        setWalletNickname(primary.label || '')
        setNetwork(primary.network || 'Ethereum')
      }
    }
  }, [userData, authUser])

  const addWalletMutation = useMutation({
    mutationFn: () =>
      addWallet({
        address: address.trim(),
        network,
        label: walletNickname.trim() || `${walletType} Carteira`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Carteira salva com sucesso!')
      setAddress('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao salvar carteira')
    },
  })

  const setPrimaryMutation = useMutation({
    mutationFn: (walletId: string) => updateWallet(walletId, { isPrimary: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Carteira definida como principal!')
    },
  })

  const removeWalletMutation = useMutation({
    mutationFn: (walletId: string) => deleteWallet(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.info('Carteira desconectada.')
    },
  })

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md font-mono">
        <h1 className="text-xl font-bold mb-2 text-foreground">Conecte sua Conta</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Faça login para gerenciar suas carteiras Web3 e endereços vinculados.
        </p>
        <Button onClick={() => navigate({ to: '/login' })} className="font-mono text-xs rounded-md px-8">
          Fazer Login
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Skeleton className="lg:col-span-3 h-96 rounded-xl" />
        <Skeleton className="lg:col-span-9 h-96 rounded-xl" />
      </div>
    )
  }

  const user = userData || authUser

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8 lg:py-12 font-mono">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Esquerda: Meu perfil (Fiel a Carteiras.png) */}
        <aside className="lg:col-span-3 bg-[#1E1712] border border-border py-5">
          <h2 className="px-5 text-sm font-bold text-foreground mb-4">Meu perfil</h2>

          <nav className="flex flex-col text-xs">
            <button
              type="button"
              onClick={() => navigate({ to: '/perfil' })}
              className="flex items-center gap-3 px-5 py-3 text-left text-muted-foreground hover:text-foreground border-l-4 border-transparent cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Dados do perfil</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-3 px-5 py-3 text-left text-primary font-bold bg-background/40 border-l-4 border-primary cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Carteiras</span>
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/perfil', search: { tab: 'atividade' } as any })}
              className="flex items-center gap-3 px-5 py-3 text-left text-muted-foreground hover:text-foreground border-l-4 border-transparent cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>Atividade</span>
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/perfil', search: { tab: 'favoritos' } as any })}
              className="flex items-center gap-3 px-5 py-3 text-left text-muted-foreground hover:text-foreground border-l-4 border-transparent cursor-pointer"
            >
              <Heart className="w-4 h-4" />
              <span>Lista de interesse</span>
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/perfil', search: { tab: 'ofertas' } as any })}
              className="flex items-center gap-3 px-5 py-3 text-left text-muted-foreground hover:text-foreground border-l-4 border-transparent cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>Ofertas</span>
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/perfil', search: { tab: 'arquivos' } as any })}
              className="flex items-center gap-3 px-5 py-3 text-left text-muted-foreground hover:text-foreground border-l-4 border-transparent cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Arquivos baixados</span>
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/perfil', search: { tab: 'suporte' } as any })}
              className="flex items-center gap-3 px-5 py-3 text-left text-muted-foreground hover:text-foreground border-l-4 border-transparent cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Suporte</span>
            </button>

            <div className="my-3 border-t border-border mx-5" />

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 px-5 py-2.5 text-left text-primary font-bold hover:opacity-80 transition-opacity cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </nav>
        </aside>

        {/* Coluna Direita: Carteira principal + Carteira secundária (Fiel a Carteiras.png) */}
        <div className="lg:col-span-9 space-y-10 text-xs">
          {/* Topo: Carteira principal */}
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-sm font-bold text-foreground">Carteira principal</h1>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Defina a carteira principal usada para compras, ofertas, transferências e verificação de propriedade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const randomHex = `0x${Math.random().toString(16).substring(2, 10)}99B8`
                  setAddress(randomHex)
                  toast.info('Endereço de nova carteira gerado no formulário.')
                }}
                className="text-primary font-bold hover:underline shrink-0 cursor-pointer"
              >
                Adicionar
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!address.trim()) {
                  toast.error('Informe o endereço da carteira')
                  return
                }
                addWalletMutation.mutate()
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="space-y-1.5">
                <label className="text-foreground block">
                  Nome de exibição <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground block">
                  Apelido da carteira <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  aria-label="Identificação / Rótulo"
                  placeholder="Ex: MetaMask Principal"
                  value={walletNickname}
                  onChange={(e) => setWalletNickname(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground block">
                  Rede <span className="text-primary">*</span>
                </label>
                <select
                  aria-label="Rede Blockchain"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Ethereum">Selecione a rede blockchain (Ethereum)</option>
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
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-foreground block">
                  Endereço da carteira <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    aria-label="Endereço da Carteira"
                    placeholder="Endereço 0x ou carteira principal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="ENS ou carteira secundária (opcional)"
                    value={secondaryEns}
                    onChange={(e) => setSecondaryEns(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
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
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="MetaMask">Selecione sua carteira (MetaMask)</option>
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
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground block">
                  E-mail <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
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
                    value={ensName}
                    onChange={(e) => setEnsName(e.target.value)}
                    className="flex-1 min-w-0 bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button
                  type="submit"
                  disabled={addWalletMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 h-10 font-mono font-bold text-xs cursor-pointer"
                >
                  {addWalletMutation.isPending ? 'Salvando...' : 'Salvar carteira'}
                </Button>
              </div>
            </form>
          </div>

          {/* Lista de Carteiras Vinculadas Atualmente */}
          {user?.wallets && user.wallets.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border">
              <h2 className="text-xs font-bold text-foreground">Carteiras Vinculadas ({user.wallets.length})</h2>
              <div className="grid grid-cols-1 gap-3">
                {user.wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      wallet.isPrimary ? 'border-primary bg-primary/5' : 'border-border bg-[#1E1712]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{wallet.label}</span>
                        {wallet.isPrimary && (
                          <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">({wallet.network})</span>
                      </div>
                      <p className="text-muted-foreground truncate">{wallet.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {!wallet.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryMutation.mutate(wallet.id)}
                          className="text-xs rounded-md font-mono"
                        >
                          Tornar Principal
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeWalletMutation.mutate(wallet.id)}
                        className="text-destructive hover:underline cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rodapé: Carteira secundária (Fiel a Carteiras.png) */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Carteira secundária</h2>
              <p className="text-[11px] text-muted-foreground mt-1">
                Você ainda não adicionou uma carteira secundária.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={sameAsPrimary}
                  onChange={(e) => setSameAsPrimary(e.target.checked)}
                  className="accent-primary w-3.5 h-3.5"
                />
                <span>Igual à carteira principal</span>
              </label>

              <button
                type="button"
                onClick={() => toast.info('Preencha o endereço acima para vincular uma carteira secundária.')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
