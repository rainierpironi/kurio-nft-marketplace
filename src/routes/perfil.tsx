import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, updateProfile, updatePassword, addWallet, updateWallet, deleteWallet, getNFTs } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { NFTCard } from '@/components/NFTCard'

type ProfileTab = 'perfil' | 'carteiras' | 'favoritos' | 'seguranca'

export const Route = createFileRoute('/perfil')({
  validateSearch: (search: Record<string, unknown>): { tab?: ProfileTab } => {
    const t = search.tab
    if (t === 'perfil' || t === 'carteiras' || t === 'favoritos' || t === 'seguranca') {
      return { tab: t }
    }
    return {}
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<ProfileTab>(tab || 'perfil')

  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  // Estados de edição de perfil
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  // Estados de senha
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Estados de nova carteira
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [newWalletNetwork, setNewWalletNetwork] = useState('Ethereum')
  const [newWalletLabel, setNewWalletLabel] = useState('')

  const { data: userData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await getMe()
      setName(data.user.name)
      setUsername(data.user.username)
      setBio(data.user.bio)
      return data.user
    },
    enabled: isAuthenticated,
  })

  // Consulta todos os NFTs para exibir os favoritos
  const { data: nftsData } = useQuery({
    queryKey: ['nfts-all'],
    queryFn: () => getNFTs({ limit: 50 }),
    enabled: activeTab === 'favoritos',
  })

  // Mutações
  const profileMutation = useMutation({
    mutationFn: () => updateProfile({ name, username, bio }),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data.user)
      toast.success('Perfil atualizado com sucesso!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar perfil')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () => updatePassword({ oldPassword, newPassword }),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!')
      setOldPassword('')
      setNewPassword('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao alterar senha')
    },
  })

  const addWalletMutation = useMutation({
    mutationFn: () =>
      addWallet({
        address: newWalletAddress,
        network: newWalletNetwork,
        label: newWalletLabel || 'Nova Carteira',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Carteira adicionada com sucesso!')
      setNewWalletAddress('')
      setNewWalletLabel('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao adicionar carteira')
    },
  })

  const setPrimaryWalletMutation = useMutation({
    mutationFn: (walletId: string) => updateWallet(walletId, { isPrimary: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Carteira principal atualizada!')
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
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center max-w-md">
        <span className="text-4xl mb-4 block">🔒</span>
        <h1 className="font-sans text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="font-mono text-xs text-muted-foreground mb-6">
          Você precisa estar conectado a uma conta para visualizar seu perfil e gerenciar carteiras.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-full">
          Voltar à Página Inicial
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const user = userData

  // Filtra os NFTs favoritos do usuário
  const userFavorites = nftsData?.items.filter((item) => user?.favorites?.includes(item.id)) || []

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-5xl">
      {/* Banner Superior do Perfil (Frames Figma: Perfil do Colecionador / Carteiras) */}
      <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-lg"
          />
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
            ✓
          </span>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-black text-foreground">{user?.name}</h1>
              <p className="font-mono text-xs text-primary">@{user?.username}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="font-mono text-xs rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              Encerrar Sessão
            </Button>
          </div>
          <p className="font-mono text-xs text-muted-foreground max-w-xl">{user?.bio}</p>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex gap-4 border-b border-border mb-8 overflow-x-auto pb-2 font-mono text-xs">
        <button
          onClick={() => {
            setActiveTab('perfil')
            navigate({ to: '/perfil', search: {} })
          }}
          className={`pb-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'perfil'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Editar Perfil
        </button>
        <button
          onClick={() => {
            setActiveTab('carteiras')
            navigate({ to: '/perfil', search: { tab: 'carteiras' } })
          }}
          className={`pb-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'carteiras'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Carteiras Conectadas ({user?.wallets.length || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab('favoritos')
            navigate({ to: '/perfil', search: { tab: 'favoritos' } })
          }}
          className={`pb-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'favoritos'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Favoritos ({user?.favorites.length || 0})
        </button>
        <button
          onClick={() => {
            setActiveTab('seguranca')
            navigate({ to: '/perfil', search: { tab: 'seguranca' } })
          }}
          className={`pb-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'seguranca'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Segurança & Senha
        </button>
      </div>

      {/* Tab: Editar Perfil */}
      {activeTab === 'perfil' && (
        <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6">
          <h2 className="font-sans text-xl font-bold">Informações Pessoais</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              profileMutation.mutate()
            }}
            className="space-y-4 font-mono text-xs"
          >
            <div>
              <label className="block text-muted-foreground mb-1">Nome de Exibição</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Nome de Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Biografia do Colecionador</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={profileMutation.isPending}
              className="rounded-full px-8 font-sans font-bold text-xs h-11 text-primary-foreground"
            >
              {profileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </div>
      )}

      {/* Tab: Carteiras Conectadas (Figma: Desktop & Mobile Carteiras) */}
      {activeTab === 'carteiras' && (
        <div className="space-y-8 max-w-3xl">
          <div className="space-y-4">
            <h2 className="font-sans text-xl font-bold">Suas Carteiras Cadastradas</h2>
            <div className="grid grid-cols-1 gap-4">
              {user?.wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    wallet.isPrimary
                      ? 'bg-primary/5 border-primary/50'
                      : 'bg-card border-border/70 hover:border-border'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-foreground">{wallet.label}</span>
                      {wallet.isPrimary && (
                        <span className="font-mono text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                      <span className="font-mono text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                        {wallet.network}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground truncate max-w-md">{wallet.address}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {!wallet.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryWalletMutation.mutate(wallet.id)}
                        className="font-mono text-xs rounded-xl"
                      >
                        Tornar Principal
                      </Button>
                    )}
                    <button
                      onClick={() => removeWalletMutation.mutate(wallet.id)}
                      className="text-xs font-mono text-destructive hover:underline p-2 cursor-pointer"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar Nova Carteira */}
          <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="font-sans font-bold text-base">Conectar Nova Carteira</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!newWalletAddress.trim()) {
                  toast.error('Informe o endereço da carteira')
                  return
                }
                addWalletMutation.mutate()
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs"
            >
              <div className="sm:col-span-2">
                <label className="block text-muted-foreground mb-1">Endereço (0x...)</label>
                <input
                  type="text"
                  placeholder="0x71C84982a17D9eC9b840132bFa3d..."
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Rótulo / Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Minha MetaMask Ledger"
                  value={newWalletLabel}
                  onChange={(e) => setNewWalletLabel(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Rede</label>
                <select
                  value={newWalletNetwork}
                  onChange={(e) => setNewWalletNetwork(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Solana">Solana</option>
                </select>
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button
                  type="submit"
                  disabled={addWalletMutation.isPending}
                  className="rounded-full px-8 font-sans font-bold text-xs h-11 text-primary-foreground"
                >
                  {addWalletMutation.isPending ? 'Conectando...' : '+ Conectar Carteira'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Favoritos */}
      {activeTab === 'favoritos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-sans text-xl font-bold">Seus Colecionáveis Salvos</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {userFavorites.length} item(ns) na sua lista de desejos
            </span>
          </div>

          {userFavorites.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-3xl border border-border">
              <span className="text-3xl mb-3 block">🤍</span>
              <p className="font-mono text-xs text-muted-foreground mb-4">Você ainda não favoritou nenhum NFT.</p>
              <Link to="/" className="text-primary font-mono text-xs hover:underline">
                Explorar catálogo para favoritar
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userFavorites.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Segurança & Troca de Senha */}
      {activeTab === 'seguranca' && (
        <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 max-w-xl space-y-6">
          <h2 className="font-sans text-xl font-bold">Alterar Senha</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!oldPassword || !newPassword) {
                toast.error('Preencha senha atual e nova senha')
                return
              }
              passwordMutation.mutate()
            }}
            className="space-y-4 font-mono text-xs"
          >
            <div>
              <label className="block text-muted-foreground mb-1">Senha Atual</label>
              <input
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Nova Senha (mínimo 6 caracteres)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={passwordMutation.isPending}
              className="rounded-full px-8 font-sans font-bold text-xs h-11 text-primary-foreground"
            >
              {passwordMutation.isPending ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
