import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, updateProfile, updatePassword, getNFTs } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { NFTCard } from '@/components/NFTCard'
import {
  User,
  Wallet,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react'

type ProfileTab = 'perfil' | 'carteiras' | 'atividade' | 'favoritos' | 'ofertas' | 'arquivos' | 'suporte'

export const Route = createFileRoute('/perfil')({
  validateSearch: (search: Record<string, unknown>): { tab?: ProfileTab } => {
    const t = search.tab as ProfileTab | undefined
    if (
      t === 'perfil' ||
      t === 'carteiras' ||
      t === 'atividade' ||
      t === 'favoritos' ||
      t === 'ofertas' ||
      t === 'arquivos' ||
      t === 'suporte'
    ) {
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
    } else {
      setActiveTab('perfil')
    }
  }, [tab])

  // Campos do Formulário (Perfil do Colecionador.png)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [ensName, setEnsName] = useState('')
  const [walletNickname, setWalletNickname] = useState('')
  const [bio, setBio] = useState('')

  // Campos de Alterar Senha
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const { data: userData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await getMe()
      setName(data.user.name)
      setUsername(data.user.username)
      setEmail(data.user.email)
      setBio(data.user.bio)
      setEnsName(data.user.username)
      setWalletNickname(data.user.wallets?.[0]?.label || 'Carteira Principal')
      return data.user
    },
    enabled: isAuthenticated,
  })

  const { data: nftsData } = useQuery({
    queryKey: ['nfts-all'],
    queryFn: () => getNFTs({ limit: 50 }),
    enabled: activeTab === 'favoritos',
  })

  const saveAllMutation = useMutation({
    mutationFn: async () => {
      const updated = await updateProfile({ name, username, bio })
      if (oldPassword && newPassword) {
        if (newPassword !== confirmNewPassword) {
          throw new Error('A confirmação da nova senha não coincide.')
        }
        await updatePassword({ oldPassword, newPassword })
      }
      return updated
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data.user)
      toast.success('Perfil atualizado com sucesso!')
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Erro ao atualizar perfil')
    },
  })

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center max-w-md font-mono">
        <h1 className="text-xl font-bold mb-2 text-foreground">Acesso Restrito</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Você precisa estar conectado a uma conta para visualizar seu perfil e gerenciar carteiras.
        </p>
        <Button onClick={() => navigate({ to: '/login' })} className="font-mono text-xs rounded-md px-6">
          Entrar na Conta
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

  const user = userData
  const userFavorites = nftsData?.items.filter((item) => user?.favorites?.includes(item.id)) || []

  const sidebarItems: { id: ProfileTab; label: string; icon: React.ReactNode; route?: string }[] = [
    { id: 'perfil', label: 'Dados do perfil', icon: <User className="w-4 h-4" /> },
    { id: 'carteiras', label: 'Carteiras', icon: <Wallet className="w-4 h-4" />, route: '/carteiras' },
    { id: 'atividade', label: 'Atividade', icon: <Activity className="w-4 h-4" /> },
    { id: 'favoritos', label: 'Lista de interesse', icon: <Heart className="w-4 h-4" /> },
    { id: 'ofertas', label: 'Ofertas', icon: <Tag className="w-4 h-4" /> },
    { id: 'arquivos', label: 'Arquivos baixados', icon: <Download className="w-4 h-4" /> },
    { id: 'suporte', label: 'Suporte', icon: <HelpCircle className="w-4 h-4" /> },
  ]

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-8 lg:py-12 font-mono">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Esquerda: Meu perfil (Fiel a Perfil do Colecionador.png) */}
        <aside className="lg:col-span-3 bg-[#1E1712] border border-border py-5">
          <h2 className="px-5 text-sm font-bold text-foreground mb-4">Meu perfil</h2>

          <nav className="flex flex-col text-xs">
            {sidebarItems.map((item) => {
              const isCurrent = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.route) {
                      navigate({ to: item.route as any })
                    } else {
                      setActiveTab(item.id)
                      navigate({ to: '/perfil', search: item.id === 'perfil' ? {} : { tab: item.id } })
                    }
                  }}
                  className={`flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer border-l-4 ${
                    isCurrent
                      ? 'border-primary text-primary font-bold bg-background/40'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            })}

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

        {/* Conteúdo Principal à Direita */}
        <div className="lg:col-span-9">
          {activeTab === 'perfil' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveAllMutation.mutate()
              }}
              className="space-y-8 text-xs"
            >
              {/* Seção: Perfil do colecionador */}
              <div className="space-y-5">
                <h1 className="text-sm font-bold text-foreground">Perfil do colecionador</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-foreground block">
                      Nome de exibição <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      aria-label="Nome de Exibição"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground block">
                      Nome de usuário <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      aria-label="Nome de Usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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

                  <div className="space-y-1.5">
                    <label className="text-foreground block">
                      Apelido da carteira <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletNickname}
                      onChange={(e) => setWalletNickname(e.target.value)}
                      className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground block">Avatar</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1712] border border-border flex items-center justify-center overflow-hidden text-primary">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.success('Avatar atualizado!')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs px-4 py-2 rounded-md cursor-pointer"
                      >
                        Alterar
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info('Avatar padrão restaurado.')}
                        className="text-foreground hover:text-destructive text-xs px-2 py-2 cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Alterar senha */}
              <div className="space-y-4 pt-2 max-w-md">
                <h2 className="text-sm font-bold text-foreground">Alterar senha</h2>

                <div className="space-y-1.5">
                  <label className="text-foreground block">Senha atual</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-md pl-3.5 pr-10 py-2.5 text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground block">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-md pl-3.5 pr-10 py-2.5 text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground block">Confirmar nova senha</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-md pl-3.5 pr-10 py-2.5 text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saveAllMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-7 h-10 font-mono font-bold text-xs cursor-pointer"
                  >
                    {saveAllMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Tab: Lista de interesse (Favoritos) */}
          {activeTab === 'favoritos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h2 className="text-sm font-bold text-foreground">Lista de interesse (Favoritos)</h2>
                <span className="text-xs text-muted-foreground">
                  {userFavorites.length} item(ns) salvos
                </span>
              </div>

              {userFavorites.length === 0 ? (
                <div className="p-12 text-center bg-[#1E1712] rounded-xl border border-border space-y-3">
                  <p className="text-xs text-muted-foreground">Você ainda não favoritou nenhum NFT.</p>
                  <Link to="/" className="text-primary text-xs font-bold hover:underline inline-block">
                    Explorar catálogo para favoritar
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  {userFavorites.map((nft) => (
                    <NFTCard key={nft.id} nft={nft} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outras abas informativas */}
          {(activeTab === 'atividade' ||
            activeTab === 'ofertas' ||
            activeTab === 'arquivos' ||
            activeTab === 'suporte') && (
            <div className="bg-[#1E1712] border border-border rounded-xl p-8 text-center space-y-3">
              <h2 className="text-sm font-bold text-foreground uppercase">{activeTab}</h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Histórico sincronizado com sua carteira Ethereum principal ({user?.wallets?.[0]?.address}).
              </p>
              <Button
                onClick={() => setActiveTab('perfil')}
                variant="outline"
                className="text-xs rounded-md font-mono"
              >
                Voltar aos Dados do Perfil
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
