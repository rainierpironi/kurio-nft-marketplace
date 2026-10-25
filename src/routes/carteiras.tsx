import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, addWallet, updateWallet, deleteWallet } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export const Route = createFileRoute('/carteiras')({
  component: CarteirasPage,
})

function CarteirasPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, user: authUser } = useAuth()

  const [newAddress, setNewAddress] = useState('')
  const [newNetwork, setNewNetwork] = useState('Ethereum')
  const [newLabel, setNewLabel] = useState('')
  const [selectedWalletProvider, setSelectedWalletProvider] = useState('MetaMask')

  const { data: userData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await getMe()
      return data.user
    },
    enabled: isAuthenticated,
  })

  const addWalletMutation = useMutation({
    mutationFn: () =>
      addWallet({
        address: newAddress,
        network: newNetwork,
        label: newLabel || `${selectedWalletProvider} Carteira`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Nova carteira conectada com sucesso!')
      setNewAddress('')
      setNewLabel('')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Erro ao conectar carteira')
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

  // Simula conexão rápida com carteira detectada
  const handleQuickConnect = (providerName: string) => {
    setSelectedWalletProvider(providerName)
    const randomHex = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
    setNewAddress(randomHex)
    setNewLabel(`${providerName} Conectada`)
    toast.success(`Carteira ${providerName} simulada com sucesso!`)
  }

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <span className="text-4xl mb-4 block">👛</span>
        <h1 className="font-sans text-2xl font-bold mb-2">Conecte sua Conta</h1>
        <p className="font-mono text-xs text-muted-foreground mb-6">
          Faça login para gerenciar suas carteiras Web3 e endereços vinculados.
        </p>
        <Button onClick={() => navigate({ to: '/login' })} className="font-mono text-xs rounded-full px-8">
          Fazer Login
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    )
  }

  const user = userData || authUser

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12 max-w-5xl space-y-10">
      
      {/* Breadcrumb e Header (Figma Frame: Desktop / Carteiras) */}
      <div>
        <nav className="font-mono text-xs text-muted-foreground mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-foreground">Início</Link>
          <span>/</span>
          <Link to="/perfil" className="hover:text-foreground">Colecionador</Link>
          <span>/</span>
          <span className="text-foreground font-bold">Carteiras</span>
        </nav>
        <h1 className="font-sans text-3xl sm:text-4xl font-black text-foreground">
          Carteiras e Redes
        </h1>
        <p className="font-mono text-xs sm:text-sm text-muted-foreground mt-1">
          Gerencie suas chaves públicas, alterne a rede padrão e defina a carteira para recebimento dos seus NFTs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Lista de Carteiras Ativas */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-sans text-lg font-bold text-foreground flex items-center justify-between">
            <span>Carteiras Vinculadas</span>
            <span className="font-mono text-xs text-muted-foreground">
              {user?.wallets.length || 0} cadastrada(s)
            </span>
          </h2>

          <div className="space-y-3">
            {user?.wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-6 rounded-3xl border transition-all ${
                  wallet.isPrimary
                    ? 'bg-primary/5 border-primary/60 shadow-lg'
                    : 'bg-card border-border/70 hover:border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-base text-foreground">{wallet.label}</span>
                      {wallet.isPrimary && (
                        <span className="font-mono text-[10px] bg-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full border border-primary/30">
                          Principal
                        </span>
                      )}
                      <span className="font-mono text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                        {wallet.network}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                      <span>{wallet.address}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(wallet.address)
                          toast.success('Endereço copiado para a área de transferência!')
                        }}
                        className="text-primary hover:underline cursor-pointer"
                        title="Copiar endereço"
                      >
                        [Copiar]
                      </button>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {!wallet.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryMutation.mutate(wallet.id)}
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
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Conectar Nova Carteira */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit">
          <h3 className="font-sans font-bold text-base text-foreground">Conectar Nova Carteira</h3>

          {/* Seletores rápidos de provedor */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-muted-foreground block">Provedores Suportados</span>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {['MetaMask', 'Coinbase', 'WalletConnect', 'Ledger'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleQuickConnect(provider)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedWalletProvider === provider
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newAddress.trim()) {
                toast.error('Informe o endereço da carteira')
                return
              }
              addWalletMutation.mutate()
            }}
            className="space-y-4 font-mono text-xs"
          >
            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Endereço da Carteira</label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Rede Blockchain</label>
              <select
                value={newNetwork}
                onChange={(e) => setNewNetwork(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="Ethereum">Ethereum (ERC-721)</option>
                <option value="Polygon">Polygon (PoS)</option>
                <option value="Solana">Solana (SPL)</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Identificação / Rótulo</label>
              <input
                type="text"
                placeholder="Ex: Minha Carteira Principal"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={addWalletMutation.isPending}
              className="w-full h-11 rounded-full font-sans font-bold text-xs text-primary-foreground mt-2"
            >
              {addWalletMutation.isPending ? 'Conectando...' : '+ Vincular Carteira'}
            </Button>
          </form>
        </div>

      </div>
    </div>
  )
}
