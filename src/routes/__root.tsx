import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { DevTools } from '@/components/DevTools'
import { Toaster, toast } from 'sonner'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { AuthProvider } from '@/context/AuthContext'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootContent() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // É OBRIGATÓRIO forçar transports: ['websocket'] para o MSW conseguir interceptar
    const socket = io(window.location.origin, {
      transports: ['websocket'],
    })

    // Escuta atualizações do servidor simulado
    socket.on('nft.updated', (updatedNft: any) => {
      toast.info(`Atualização ao vivo: ${updatedNft.title} agora está por ${updatedNft.price} ETH!`)
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['checkout-quote'] })
      queryClient.invalidateQueries({ queryKey: ['nft', updatedNft.id] })
      window.dispatchEvent(new CustomEvent('KURIO_NFT_UPDATED', { detail: updatedNft }))
    })

    socket.on('order.updated', (orderUpdate: any) => {
      toast.success(`Pedido ${orderUpdate.orderId}: status alterado para ${orderUpdate.status}`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    })

    // Repassa o evento local do DevTools para dentro da rede do Socket
    const handleSimulate = () => {
      socket.emit('admin.simulate_update')
    }

    window.addEventListener('MSW_SIMULATE_NFT_UPDATE', handleSimulate)

    return () => {
      window.removeEventListener('MSW_SIMULATE_NFT_UPDATE', handleSimulate)
      socket.disconnect()
    }
  }, [queryClient])

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      <Header />
      <main className="flex-1 w-full mx-auto">
        <Outlet />
      </main>
      <Footer />
      <Toaster theme="dark" richColors position="bottom-center" />
      <DevTools />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}

function RootComponent() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  )
}
