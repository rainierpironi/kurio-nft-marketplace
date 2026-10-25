import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { MapPin, Mail, Phone } from 'lucide-react'

export function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Informe um e-mail válido.')
      return
    }
    toast.success('E-mail cadastrado! Você receberá os próximos lançamentos.')
    setEmail('')
  }

  return (
    <footer className="w-full bg-background text-foreground pt-12 pb-24 md:pb-10 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 lg:px-8">
        <div className="bg-[#1E1712] border border-border overflow-hidden">
          {/* Bloco Superior: 3 Medalhões (W, C, D) + Newsletter */}
          <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Medalhão W */}
              <div className="space-y-3 pr-2 border-b sm:border-b-0 sm:border-r border-border/60 pb-4 sm:pb-0">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground font-mono font-bold text-lg flex items-center justify-center">
                    W
                  </div>
                </div>
                <h4 className="font-mono font-bold text-xs text-foreground">Segurança da carteira</h4>
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  Proteja sua carteira e colecione arte digital verificada com confiança.
                </p>
              </div>

              {/* Medalhão C */}
              <div className="space-y-3 pr-2 border-b sm:border-b-0 sm:border-r border-border/60 pb-4 sm:pb-0">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground font-mono font-bold text-lg flex items-center justify-center">
                    C
                  </div>
                </div>
                <h4 className="font-mono font-bold text-xs text-foreground">Criadores em destaque</h4>
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
                </p>
              </div>

              {/* Medalhão D */}
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground font-mono font-bold text-lg flex items-center justify-center">
                    D
                  </div>
                </div>
                <h4 className="font-mono font-bold text-xs text-foreground">Alertas de lançamentos</h4>
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
                </p>
              </div>
            </div>

            {/* Coluna Newsletter */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="font-mono font-bold text-xs text-foreground">
                Antecipe-se ao próximo lançamento
              </h4>
              <form onSubmit={handleSubscribe} className="flex w-full">
                <input
                  type="email"
                  required
                  placeholder="digite seu e-mail..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 bg-background border border-border rounded-l-md px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs font-bold px-4 py-2 rounded-r-md transition-colors cursor-pointer shrink-0"
                >
                  Enviar
                </button>
              </form>
              <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </div>
          </div>

          {/* Faixa Central: KURIO | Localização | E-mail | Telefone */}
          <div className="bg-[#2B1F16] border-y border-border px-6 lg:px-10 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center font-mono text-xs">
            <Link to="/" className="font-bold text-base tracking-[0.2em] text-foreground">
              KURIO
            </Link>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[11px] text-foreground/90">
                Feito para colecionadores, criadores e cultura
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[11px] text-foreground/90">contato@email.com</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[11px] text-foreground/90">+55 11 4002 8922</span>
            </div>
          </div>

          {/* Bloco Inferior: 4 Colunas de Links + Redes Sociais e Carteiras */}
          <div className="p-6 lg:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 font-mono text-xs">
            {/* Coluna 1: Meu perfil */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs text-foreground">Meu perfil</h5>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li>
                  <Link to="/perfil" className="hover:text-primary transition-colors">
                    Meu perfil
                  </Link>
                </li>
                <li>
                  <Link to="/perfil" className="hover:text-primary transition-colors">
                    Minha coleção
                  </Link>
                </li>
                <li>
                  <Link to="/perfil" className="hover:text-primary transition-colors">
                    Atividade
                  </Link>
                </li>
                <li>
                  <Link to="/carteiras" className="hover:text-primary transition-colors">
                    Estúdio do criador
                  </Link>
                </li>
                <li>
                  <Link to="/perfil" search={{ tab: 'favoritos' } as any} className="hover:text-primary transition-colors">
                    Lista de interesse
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 2: Central de ajuda */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs text-foreground">Central de ajuda</h5>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Central de ajuda
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Como comprar NFTs
                  </Link>
                </li>
                <li>
                  <Link to="/carteiras" className="hover:text-primary transition-colors">
                    Carteira e segurança
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Política do mercado
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Denunciar item
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Coleções */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs text-foreground">Coleções</h5>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li>
                  <Link to="/" search={{ category: 'Arte digital' } as any} className="hover:text-primary transition-colors">
                    Arte digital
                  </Link>
                </li>
                <li>
                  <Link to="/" search={{ category: 'Fotografia' } as any} className="hover:text-primary transition-colors">
                    Fotografia
                  </Link>
                </li>
                <li>
                  <Link to="/" search={{ category: 'Música' } as any} className="hover:text-primary transition-colors">
                    Música
                  </Link>
                </li>
                <li>
                  <Link to="/" search={{ category: 'Arte 3D' } as any} className="hover:text-primary transition-colors">
                    Arte 3D
                  </Link>
                </li>
                <li>
                  <Link to="/" search={{ category: 'Utilidade' } as any} className="hover:text-primary transition-colors">
                    Utilidade
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Redes sociais + Carteiras compatíveis */}
            <div className="space-y-5">
              <div className="space-y-3">
                <h5 className="font-bold text-xs text-foreground">Redes sociais</h5>
                <div className="flex items-center gap-2">
                  {['f', 'ig', 'tw', 'in', 'yt'].map((social) => (
                    <a
                      key={social}
                      href="#redes-sociais"
                      aria-label={`Rede social ${social}`}
                      className="w-7 h-7 rounded border border-primary/40 flex items-center justify-center text-[10px] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-xs text-foreground">Carteiras compatíveis</h5>
                <div className="inline-block bg-background border border-border rounded px-2.5 py-1.5 text-[9px] font-bold text-primary tracking-wider">
                  METAMASK • WALLETCONNECT • COINBASE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-5 text-center font-mono text-[11px] text-muted-foreground">
          © 2026 Kurio. Propriedade digital para todos.
        </div>
      </div>
    </footer>
  )
}
