import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { Cart } from '@/components/Cart'
import { AuthModal } from '@/components/AuthModal'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getFavorites, getCart } from '@/lib/api'
import { Search, Heart, Menu, X, Home, ScanLine, ShoppingCart, User, LogIn } from 'lucide-react'

type NavSection = 'inicio' | 'mercado' | 'criadores' | 'aprenda'

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  })

  const favoritesCount = favData?.favorites?.length ?? user?.favorites?.length ?? 0
  const cartItemsCount = cartData?.items.reduce((total, item) => total + item.quantity, 0) || 0

  useEffect(() => {
    if (location.pathname !== '/') {
      if (location.pathname.startsWith('/nft') || location.pathname.startsWith('/carrinho') || location.pathname.startsWith('/pagamento')) {
        setActiveSection('mercado')
      } else {
        setActiveSection('inicio')
      }
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
        const y = el.getBoundingClientRect().top + window.scrollY - 90
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
    setIsSearchOpen(false)
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
          const y = el.getBoundingClientRect().top + window.scrollY - 90
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto max-w-7xl flex h-20 items-center justify-between gap-4 px-4 lg:px-8">
          {/* Logótipo KURIO (Fiel ao Mockup Figma) */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              onClick={() => {
                setActiveSection('inicio')
                setIsMobileMenuOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="font-mono text-xl font-bold tracking-[0.2em] text-foreground hover:text-primary transition-colors"
            >
              KURIO
            </Link>
          </div>

          {/* Navegação Central (Desktop) */}
          <nav aria-label="Navegação Principal" className="hidden md:flex items-center h-full gap-8 lg:gap-10">
            <button
              type="button"
              onClick={() => scrollToSection(null, 'inicio')}
              className={`h-full flex items-center font-mono text-xs transition-colors cursor-pointer border-b-2 ${
                activeSection === 'inicio'
                  ? 'text-primary border-primary font-bold'
                  : 'text-foreground/80 border-transparent hover:text-foreground'
              }`}
            >
              Início
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('catalogo', 'mercado')}
              className={`h-full flex items-center font-mono text-xs transition-colors cursor-pointer border-b-2 ${
                activeSection === 'mercado'
                  ? 'text-primary border-primary font-bold'
                  : 'text-foreground/80 border-transparent hover:text-foreground'
              }`}
            >
              Mercado
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('criadores', 'criadores')}
              className={`h-full flex items-center font-mono text-xs transition-colors cursor-pointer border-b-2 ${
                activeSection === 'criadores'
                  ? 'text-primary border-primary font-bold'
                  : 'text-foreground/80 border-transparent hover:text-foreground'
              }`}
            >
              Criadores
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('aprenda', 'aprenda')}
              className={`h-full flex items-center font-mono text-xs transition-colors cursor-pointer border-b-2 ${
                activeSection === 'aprenda'
                  ? 'text-primary border-primary font-bold'
                  : 'text-foreground/80 border-transparent hover:text-foreground'
              }`}
            >
              Aprenda
            </button>
          </nav>

          {/* Ações à Direita: Busca, Carrinho, Botão Entrar / Perfil */}
          <div className="flex items-center gap-3 sm:gap-5">
            {isSearchOpen ? (
              <form onSubmit={handleHeaderSearch} className="hidden sm:flex items-center relative w-56">
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar NFT..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  aria-label="Buscar NFT no cabeçalho"
                  className="w-full bg-card border border-border rounded-md pl-3 pr-8 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Fechar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Buscar NFT"
                className="p-2 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Carrinho (Drawer + Badge Âmbar) */}
            <Cart />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/carteiras"
                  className="font-mono text-xs text-muted-foreground hover:text-foreground hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-primary transition-colors"
                  activeProps={{ className: 'border-primary text-primary font-bold' }}
                >
                  Carteiras
                </Link>

                <Link
                  to="/perfil"
                  className="flex items-center gap-2 bg-card hover:bg-secondary border border-border px-3 py-1.5 rounded-md transition-colors"
                  activeProps={{ className: 'border-primary' }}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-primary"
                  />
                  <span className="font-mono text-xs hidden sm:inline-block font-bold text-foreground">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:inline-flex text-xs font-mono text-muted-foreground hover:text-destructive px-2 h-8"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-2 h-9 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Button>
            )}

            {/* Botão Menu Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 rounded-md border border-border bg-card text-foreground hover:border-primary transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-5 space-y-4">
            <form onSubmit={handleHeaderSearch} className="relative">
              <input
                type="text"
                placeholder="Explorar coleções..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-4 pr-10 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
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
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-foreground hover:bg-secondary cursor-pointer"
              >
                <span>Início</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('catalogo', 'mercado')}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-foreground hover:bg-secondary cursor-pointer"
              >
                <span>Mercado</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('criadores', 'criadores')}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-foreground hover:bg-secondary cursor-pointer"
              >
                <span>Criadores</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('aprenda', 'aprenda')}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-foreground hover:bg-secondary cursor-pointer"
              >
                <span>Aprenda</span>
                <span>→</span>
              </button>
              <Link
                to="/carrinho"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-foreground hover:bg-secondary"
              >
                <span>Carrinho ({cartItemsCount})</span>
                <span>→</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Barra de Navegação Inferior Mobile (Fiel a MInício.png) */}
      <nav
        aria-label="Navegação Inferior Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1E1712] border-t border-border rounded-t-3xl h-16 px-6 flex items-center justify-between shadow-2xl"
      >
        <button
          type="button"
          onClick={() => scrollToSection(null, 'inicio')}
          aria-label="Início"
          className={`p-2 transition-colors cursor-pointer ${
            location.pathname === '/' && activeSection === 'inicio' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleFavoritesClick}
          aria-label="Favoritos"
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-primary text-primary' : ''}`} />
        </button>

        {/* Botão Central Elevado Âmbar (Scanner / Explorar) */}
        <button
          type="button"
          onClick={() => scrollToSection('catalogo', 'mercado')}
          aria-label="Explorar Mercado"
          className="w-14 h-14 -mt-8 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center border-4 border-background cursor-pointer hover:bg-primary/90 transition-transform active:scale-95"
        >
          <ScanLine className="w-6 h-6" />
        </button>

        <Link
          to="/carrinho"
          aria-label="Carrinho de NFTs"
          className={`relative p-2 transition-colors ${
            location.pathname === '/carrinho' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {cartItemsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] font-bold flex items-center justify-center">
              {cartItemsCount}
            </span>
          )}
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
          aria-label="Perfil"
          className={`p-2 transition-colors cursor-pointer ${
            location.pathname === '/perfil' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="w-5 h-5" />
        </button>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
