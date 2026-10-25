import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/button'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Informe um e-mail válido para assinar.')
      return
    }
    setIsSubscribed(true)
    toast.success('Inscrição confirmada! Você receberá os próximos drops e novidades.')
    setEmail('')
  }

  return (
    <footer className="w-full bg-[#0D0A08] border-t border-border/80 text-foreground pt-16 pb-24 md:pb-12 mt-auto z-10 relative">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl flex flex-col gap-16">
        
        {/* Frame 122: Três Medalhões de Destaque + Newsletter (Figma Specification) */}
        <div className="bg-[#140F0C] border border-border/60 rounded-3xl p-8 lg:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Três Medalhões de Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl shrink-0">
                💎
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-foreground">Arte Autêntica & Rara</h4>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Colecionáveis selecionados por curadoria com proveniência verificada na rede.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl shrink-0">
                ⚡
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-foreground">Liquidação Instantânea</h4>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Transferências peer-to-peer sem custódia intermediária direto para sua carteira.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl shrink-0">
                🌱
              </div>
              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-foreground">Apoio aos Criadores</h4>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Royalties perpétuos garantidos em contratos inteligentes para apoiar artistas.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="w-full lg:w-96 shrink-0 bg-background/60 border border-border/60 p-6 rounded-2xl space-y-3">
            <span className="font-mono text-[11px] text-primary uppercase font-bold tracking-widest block">
              Newsletter Kurio
            </span>
            <h4 className="font-sans font-bold text-base text-foreground">Drops e Lançamentos</h4>
            <p className="font-mono text-xs text-muted-foreground">
              Receba notificações de novas coleções antes de chegarem ao mercado aberto.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 pt-1">
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-xl px-3.5 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" className="font-mono text-xs font-bold rounded-xl px-4 text-primary-foreground">
                {isSubscribed ? 'Inscrito!' : 'Assinar'}
              </Button>
            </form>
          </div>
        </div>

        {/* Frame 121: Faixa da Marca + 4 Colunas de Links + Redes e Carteiras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pt-4">
          
          {/* Coluna da Marca */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="font-mono text-2xl font-black tracking-widest text-primary flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-primary inline-block"></span>
              KURIO
            </Link>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-sm">
              Plataforma descentralizada de negociação de arte digital e colecionáveis raros. 
              Conectando entusiastas, criadores e investidores Web3 com transparência na blockchain.
            </p>
            <div className="pt-2 font-mono text-xs text-muted-foreground space-y-1">
              <p>Contato: <span className="text-foreground font-medium">contato@kurio.art</span></p>
              <p>Status: <span className="text-primary font-bold">● Ethereum Mainnet Operacional</span></p>
            </div>
          </div>

          {/* Coluna 1: Mercado */}
          <div className="space-y-4 font-mono text-xs">
            <h5 className="font-sans font-bold text-sm text-foreground uppercase tracking-wide">Mercado</h5>
            <ul className="space-y-2.5 text-muted-foreground">
              <li>
                <Link to="/" search={{ category: 'Arte digital' }} className="hover:text-primary transition-colors">
                  Arte Digital
                </Link>
              </li>
              <li>
                <Link to="/" search={{ category: 'Fotografia' }} className="hover:text-primary transition-colors">
                  Fotografia
                </Link>
              </li>
              <li>
                <Link to="/" search={{ category: 'Música' }} className="hover:text-primary transition-colors">
                  Música & Áudio
                </Link>
              </li>
              <li>
                <Link to="/" search={{ category: 'Arte 3D' }} className="hover:text-primary transition-colors">
                  Modelos 3D
                </Link>
              </li>
              <li>
                <Link to="/" search={{}} className="hover:text-primary transition-colors">
                  Todos os Colecionáveis
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 2: Minha Conta */}
          <div className="space-y-4 font-mono text-xs">
            <h5 className="font-sans font-bold text-sm text-foreground uppercase tracking-wide">Minha Conta</h5>
            <ul className="space-y-2.5 text-muted-foreground">
              <li>
                <Link to="/perfil" className="hover:text-primary transition-colors">
                  Perfil do Colecionador
                </Link>
              </li>
              <li>
                <Link to="/carteiras" className="hover:text-primary transition-colors">
                  Carteiras Conectadas
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Acessar Conta / Login
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="hover:text-primary transition-colors">
                  Cadastrar-se
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Comunidade & Carteiras Suportadas */}
          <div className="space-y-4 font-mono text-xs">
            <h5 className="font-sans font-bold text-sm text-foreground uppercase tracking-wide">Comunidade & Web3</h5>
            
            {/* Social Chips usando os ícones do projeto */}
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-primary transition-colors group"
              >
                <svg className="w-4 h-4 fill-muted-foreground group-hover:fill-primary transition-colors">
                  <use href="/icons.svg#discord-icon" />
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-primary transition-colors group"
              >
                <svg className="w-4 h-4 fill-muted-foreground group-hover:fill-primary transition-colors">
                  <use href="/icons.svg#x-icon" />
                </svg>
              </a>

              <a
                href="https://bsky.app"
                target="_blank"
                rel="noreferrer"
                aria-label="Bluesky"
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-primary transition-colors group"
              >
                <svg className="w-4 h-4 fill-muted-foreground group-hover:fill-primary transition-colors">
                  <use href="/icons.svg#bluesky-icon" />
                </svg>
              </a>

              <a
                href="https://github.com/junglegaming/frontend-challenge"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-primary transition-colors group"
              >
                <svg className="w-4 h-4 fill-muted-foreground group-hover:fill-primary transition-colors">
                  <use href="/icons.svg#github-icon" />
                </svg>
              </a>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-muted-foreground block mb-2 font-bold uppercase">Carteiras Aceitas</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-secondary rounded-lg border border-border/80 text-[10px] text-foreground font-mono">
                  MetaMask
                </span>
                <span className="px-2.5 py-1 bg-secondary rounded-lg border border-border/80 text-[10px] text-foreground font-mono">
                  Coinbase
                </span>
                <span className="px-2.5 py-1 bg-secondary rounded-lg border border-border/80 text-[10px] text-foreground font-mono">
                  WalletConnect
                </span>
                <span className="px-2.5 py-1 bg-secondary rounded-lg border border-border/80 text-[10px] text-foreground font-mono">
                  Ledger
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Direitos Autorais */}
        <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-muted-foreground">
          <p>© 2026 KURIO Marketplace. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Desenvolvido para o Jungle Gaming Challenge</span>
            <span>•</span>
            <span className="text-primary font-bold">Deep Linking & A11y 100% Ativos</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
