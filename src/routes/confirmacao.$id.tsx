import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { MailCheck } from 'lucide-react'

export const Route = createFileRoute('/confirmacao/$id')({
  component: OrderConfirmation,
})

function OrderConfirmation() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-xl">
        <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !data?.order) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center max-w-md font-mono">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl mx-auto mb-4">
          ✕
        </div>
        <h1 className="text-xl font-bold mb-2 text-foreground">Pedido não encontrado</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Não conseguimos localizar o recibo com o identificador #{id}.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-md">
          Voltar ao Catálogo
        </Button>
      </div>
    )
  }

  const { order } = data
  const shortTx = order.transactionHash
    ? `${order.transactionHash.slice(0, 6)}...${order.transactionHash.slice(-4)}`.toUpperCase()
    : '0xA91F...E82C'

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 font-mono">
      {/* Card de Confirmação Fiel a Confirmação de Pedido.png */}
      <div className="max-w-[540px] mx-auto bg-[#221A14] border border-border shadow-2xl overflow-hidden relative">
        {/* Botão Fechar Superior Direito */}
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          aria-label="Fechar confirmação"
          className="absolute top-3.5 right-4 text-primary hover:opacity-80 font-bold text-sm cursor-pointer z-10"
        >
          ✕
        </button>

        {/* Topo com Ícone THANK YOU */}
        <div className="bg-[#2B1F16] px-6 py-7 text-center border-b border-border space-y-2.5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/15 border border-primary/40 flex flex-col items-center justify-center text-primary">
            <span className="text-[8px] font-bold tracking-tighter leading-none mb-0.5">THANK YOU</span>
            <MailCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xs sm:text-sm text-foreground font-normal">
            Seus NFTs agora estão na sua carteira
          </h1>
          <span className="sr-only">Pagamento Confirmado! Pedido {order.id}</span>
        </div>

        {/* Faixa de 4 Colunas: ID da transação | Data | Total | Carteira */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border px-5 py-3.5 gap-3 text-[11px]">
          <div className="sm:border-r border-border/60 pr-2">
            <span className="text-muted-foreground block">ID da transação</span>
            <span className="font-bold text-foreground block truncate" title={order.id}>
              {shortTx}
            </span>
          </div>
          <div className="sm:border-r border-border/60 pr-2">
            <span className="text-muted-foreground block">Data</span>
            <span className="font-bold text-foreground block">29 Jul, 2026</span>
          </div>
          <div className="sm:border-r border-border/60 pr-2">
            <span className="text-muted-foreground block">Total</span>
            <span className="font-bold text-foreground block">{order.total} ETH</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Carteira</span>
            <span className="font-bold text-foreground block truncate" title={order.walletAddress}>
              MetaMask
            </span>
          </div>
        </div>

        {/* Corpo: Detalhes da transação */}
        <div className="p-6 space-y-4">
          <h2 className="text-sm font-bold text-foreground">Detalhes da transação</h2>

          <div className="grid grid-cols-12 border-b border-border pb-2 text-xs font-bold text-foreground">
            <div className="col-span-7">NFTs</div>
            <div className="col-span-2 text-center">Edições</div>
            <div className="col-span-3 text-right">Subtotal</div>
          </div>

          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#1E1712] border border-border rounded-xl p-3 grid grid-cols-12 items-center gap-2 text-xs"
              >
                <div className="col-span-7 flex items-center gap-3 min-w-0">
                  <img
                    src={item.image || '/nfts/ape-emerald.png'}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-background shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block truncate">{item.title}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      ID do token: #{item.tokenId || item.nftId.padStart(4, '0')}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 text-center text-muted-foreground">(x {item.quantity})</div>
                <div className="col-span-3 text-right font-bold text-primary">
                  {(parseFloat(item.price) * item.quantity).toFixed(2)} ETH
                </div>
              </div>
            ))}
          </div>

          {/* Taxa de rede e Total */}
          <div className="space-y-2 pt-2 text-xs border-b border-border pb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de rede</span>
              <span className="font-bold text-foreground">{order.gasFee} ETH</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-bold text-sm text-primary">{order.total} ETH</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-2">
            Sua transação está sendo confirmada na blockchain. Você receberá em breve o comprovante da compra, os
            detalhes de propriedade do token e o acesso aos benefícios exclusivos de colecionador.
          </p>

          <div className="pt-2 flex flex-col items-center gap-2">
            <a
              href={order.blockExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs px-7 h-10 rounded-md transition-colors"
            >
              Ver no Etherscan
            </a>
          </div>
        </div>

        {/* Barra Inferior Âmbar Fiel ao Mockup */}
        <div className="h-2.5 w-full bg-primary" />
      </div>
    </div>
  )
}
