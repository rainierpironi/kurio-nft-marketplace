import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getOrderById } from '@/lib/api'
import { Button } from '@/components/button'
import { Skeleton } from '@/components/skeleton'
import { Separator } from '@/components/separator'

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
      <div className="container mx-auto px-4 lg:px-8 py-16 max-w-2xl">
        <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (isError || !data?.order) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-20 text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-2xl mx-auto mb-4">
          ✕
        </div>
        <h1 className="font-sans text-2xl font-bold mb-2">Pedido não encontrado</h1>
        <p className="font-mono text-xs text-muted-foreground mb-6">
          Não conseguimos localizar o recibo com o identificador #{id}.
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="font-mono text-xs rounded-full">
          Voltar ao Catálogo
        </Button>
      </div>
    )
  }

  const { order } = data

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
      {/* Cabeçalho de Sucesso (Frame Figma: Confirmação de Pedido) */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary text-primary flex items-center justify-center text-3xl mx-auto animate-in zoom-in duration-300">
          ✓
        </div>
        <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
          Transação Verificada na Rede
        </span>
        <h1 className="font-sans text-3xl sm:text-4xl font-black uppercase text-foreground">
          Pagamento Confirmado!
        </h1>
        <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Os colecionáveis digitais foram transferidos com sucesso para a sua carteira e registrados na blockchain.
        </p>
      </div>

      {/* Cartão do Recibo Imutável */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-border/60 gap-2">
          <div>
            <span className="font-mono text-xs text-muted-foreground">ID do Pedido</span>
            <p className="font-mono text-sm font-bold text-foreground">{order.id}</p>
          </div>
          <div className="sm:text-right">
            <span className="font-mono text-xs text-muted-foreground">Data e Hora</span>
            <p className="font-mono text-xs text-foreground">
              {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Detalhes da Blockchain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/80 p-4 rounded-2xl border border-border/50 font-mono text-xs">
          <div>
            <span className="text-muted-foreground block mb-1">Rede Utilizada</span>
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {order.network}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-1">Carteira Destinatária</span>
            <span className="font-bold text-foreground truncate block" title={order.walletAddress}>
              {order.walletAddress}
            </span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/40">
            <span className="text-muted-foreground block mb-1">Hash da Transação (TX Hash)</span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-primary truncate">{order.transactionHash}</span>
              <a
                href={order.blockExplorerUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline shrink-0"
              >
                Explorador ↗
              </a>
            </div>
          </div>
        </div>

        {/* Lista de Itens Comprados (Snapshot) */}
        <div>
          <h3 className="font-sans font-bold text-sm text-foreground mb-3">Itens Adquiridos</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/40 font-mono text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block">{item.title}</span>
                  <span className="text-muted-foreground">Quantidade: {item.quantity}x</span>
                </div>
                <span className="font-bold text-primary">
                  {(parseFloat(item.price) * item.quantity).toFixed(2)} ETH
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Resumo Financeiro */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground">{order.subtotal} ETH</span>
          </div>
          {parseFloat(order.discount) > 0 && (
            <div className="flex justify-between text-primary">
              <span>Desconto Aplicado</span>
              <span>-{order.discount} ETH</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Taxa de Rede (Gas)</span>
            <span className="text-foreground">{order.gasFee} ETH</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-border/40">
            <span className="text-foreground font-sans">Total Pago</span>
            <span className="font-mono text-lg text-primary">{order.total} ETH</span>
          </div>
        </div>

        {/* Ações */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate({ to: '/' })}
            className="flex-1 h-12 rounded-full font-bold font-sans text-sm text-primary-foreground shadow-lg shadow-primary/20"
          >
            Continuar Explorando
          </Button>
          <Link
            to="/perfil"
            className="flex-1 h-12 rounded-full font-mono text-xs font-bold border border-border hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
          >
            Ver Minha Coleção no Perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
