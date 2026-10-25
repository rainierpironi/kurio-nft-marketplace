import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Cart } from '@/components/Cart'
import { AuthModal } from '@/components/AuthModal'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getFavorites } from '@/lib/api'
import { Search, Heart, Menu, X, Home, Compass, Wallet, User } from 'lucide-react'

type NavSection = 'inicio' | 'mercado' | 'criadores' | 'aprenda'

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const [activeSection, setActiveSection] = useState<NavSection>('inicio')

  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
  })

  const favoritesCount = favData?.favorites?.length ?? user?.favorites?.length ?? 0

  // Sincroniza a seção ativa do Header conforme o scroll na Home
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('inicio')
      return
    }

    const handleScroll = () => {
      const scrollY = window.scrollY + 180
      const aprendaEl = document.getElementById('aprenda')
      const criadoresEl = document.getElementById('criadores')
      const catalogoEl = document.getElementById('catalogo')

      if (aprendaEl && scrollY >= aprendaEl.offsetTop) {
        setActiveSection('aprenda')
      } else if (criadoresEl && scrollY >= criadoresEl.offsetTop) {
        setActiveSection('criadores')
      } else if (catalogoEl && scrollY >= catalogoEl.offsetTop) {
        setActiveSection('mercado')
      } else {
        setActiveSection('inicio')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const scrollToSection = (sectionId: string | null, sectionName: NavSection) => {
    setActiveSection(sectionName)
    setIsMobileMenuOpen(false)

    const doScroll = () => {
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.getElementById(sectionId)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 96
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }

    if (location.pathname !== '/') {
      navigate({ to: '/' }).then(() => {
        setTimeout(doScroll, 120)
      })
    } else {
      doScroll()
    }
  }

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = headerSearch.trim()
    setIsMobileMenuOpen(false)
    navigate({
      to: '/',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        q: clean || undefined,
        page: 1,
      }),
    }).then(() => {
      setTimeout(() => {
        const el = document.getElementById('catalogo')
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 96
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)
    })
  }

  const handleFavoritesClick = () => {
    setIsMobileMenuOpen(false)
    if (!isAuthenticated) {
      setIsAuthOpen(true)
      return
    }
    navigate({ to: '/perfil', search: { tab: 'favoritos' } as any })
  }

  const isHome = location.pathname === '/'

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4 lg:px-8">
          {/* Logótipo */}
          <div className="flex items-center gap-6 shrink-0">
            <Link
              to="/"
              onClick={() => {
                setActiveSection('inicio')
                setIsMobileMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="font-mono text-2xl font-black tracking-widest text-primary flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="w-3 h-3 rounded-full bg-primary inline-block shadow-[0_0_10px_#7EE622]" />
              KURIO
            </Link>
          </div>

          {/* Navegação Central (Desktop) */}
          <nav aria-label="Navegação Principal" className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              type="button"
              onClick={() => scrollToSection(null, 'inicio')}
              className={`text-[15px] font-medium transition-colors cursor-pointer pb-1 ${
                isHome && activeSection === 'inicio'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Início
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('catalogo', 'mercado')}
              className={`text-[15px] font-medium transition-colors cursor-pointer pb-1 ${
                isHome && activeSection === 'mercado'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mercado
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('criadores', 'criadores')}
              className={`text-[15px] font-medium transition-colors cursor-pointer pb-1 ${
                isHome && activeSection === 'criadores'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Criadores
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('aprenda', 'aprenda')}
              className={`text-[15px] font-medium transition-colors cursor-pointer pb-1 ${
                isHome && activeSection === 'aprenda'
                  ? 'text-primary border-b-2 border-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Aprenda
            </button>
          </nav>

          {/* Busca Rápida no Header (Desktop XL) */}
          <form onSubmit={handleHeaderSearch} className="hidden xl:flex items-center relative w-60">
            <input
              type="text"
              placeholder="Buscar NFT ou coleção..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              aria-label="Buscar NFT no cabeçalho"
              className="w-full bg-secondary/90 border border-border rounded-full pl-4 pr-9 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              aria-label="Executar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Ações: Favoritos, Carrinho, Login / Usuário e Menu Mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Atalho de Favoritos */}
            <button
              type="button"
              onClick={handleFavoritesClick}
              aria-label="Meus Favoritos"
              title="Meus Favoritos"
              className="relative p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-primary text-primary' : ''}`} />
              {favoritesCount > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground font-mono font-bold">
                  {favoritesCount}
                </Badge>
              )}
            </button>

            {/* Carrinho (Drawer) */}
            <Cart />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/carteiras"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 border border-border/80 hover:border-primary/50 px-3 py-1.5 rounded-full transition-colors"
                  activeProps={{ className: 'border-primary text-primary bg-primary/10 font-bold' }}
                  title="Gerenciar Carteiras Conectadas"
                >
                  <span>👛</span>
                  <span className="hidden lg:inline">Carteiras</span>
                </Link>

                <Link
                  to="/perfil"
                  className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary border border-border px-2.5 sm:px-3 py-1.5 rounded-full transition-colors group"
                  activeProps={{ className: 'border-primary bg-secondary' }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-primary/40 group-hover:border-primary"
                  />
                  <span className="font-mono text-xs hidden sm:inline-block font-medium text-foreground">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:inline-flex text-xs font-mono text-muted-foreground hover:text-destructive px-2.5 h-8"
                  title="Encerrar Sessão"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAuthOpen(true)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-4 sm:px-5 font-mono text-xs sm:text-sm h-9 transition-all font-bold"
                >
                  <span className="mr-1.5">↪</span> Entrar
                </Button>
              </div>
            )}

            {/* Botão Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 rounded-xl border border-border bg-secondary/60 text-foreground hover:border-primary transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/80 bg-card/98 backdrop-blur-xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleHeaderSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar por nome, artista ou coleção..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            <nav className="flex flex-col space-y-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => scrollToSection(null, 'inicio')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isHome && activeSection === 'inicio'
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <span>Início</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('catalogo', 'mercado')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isHome && activeSection === 'mercado'
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <span>Mercado & Catálogo</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('criadores', 'criadores')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isHome && activeSection === 'criadores'
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <span>Criadores em Destaque</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('aprenda', 'aprenda')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  isHome && activeSection === 'aprenda'
                    ? 'bg-primary/15 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                <span>Aprenda (Blog & Guias Web3)</span>
                <span>→</span>
              </button>
            </nav>

            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/carteiras"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center font-mono text-xs py-2 px-3 rounded-xl bg-secondary border border-border text-foreground hover:border-primary"
                  >
                    👛 Minhas Carteiras
                  </Link>
                  <Link
                    to="/perfil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center font-mono text-xs py-2 px-3 rounded-xl bg-secondary border border-border text-foreground hover:border-primary"
                  >
                    👤 Meu Perfil
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      logout()
                    }}
                    className="w-full mt-1 text-center font-mono text-xs py-2 px-3 rounded-xl bg-destructive/15 text-destructive font-bold cursor-pointer"
                  >
                    Encerrar Sessão
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center font-mono text-xs py-2.5 px-3 rounded-xl bg-primary text-primary-foreground font-bold"
                  >
                    Entrar na Conta
                  </Link>
                  <Link
                    to="/cadastro"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 text-center font-mono text-xs py-2.5 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Barra de Navegação Inferior Mobile (Fiel ao Frame Mobile do Figma) */}
      <nav
        aria-label="Navegação Inferior Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/80 px-4 py-2 flex items-center justify-around shadow-2xl"
      >
        <button
          type="button"
          onClick={() => scrollToSection(null, 'inicio')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            isHome && activeSection === 'inicio' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-mono text-[10px]">Início</span>
        </button>

        <button
          type="button"
          onClick={() => scrollToSection('catalogo', 'mercado')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            isHome && activeSection === 'mercado' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="font-mono text-[10px]">Mercado</span>
        </button>

        <button
          type="button"
          onClick={handleFavoritesClick}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            location.pathname === '/perfil' && (location.search as any)?.tab === 'favoritos'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="font-mono text-[10px]">Favoritos</span>
          {favoritesCount > 0 && (
            <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>

        <Link
          to="/carteiras"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/carteiras' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="font-mono text-[10px]">Carteiras</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (isAuthenticated) {
              navigate({ to: '/perfil' })
            } else {
              setIsAuthOpen(true)
            }
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
            location.pathname === '/perfil' && !(location.search as any)?.tab
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="font-mono text-[10px]">{isAuthenticated ? 'Perfil' : 'Entrar'}</span>
        </button>
      </nav>

      {/* Instância da Modal de Autenticação */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
