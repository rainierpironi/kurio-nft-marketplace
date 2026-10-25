import { Link } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { Cart } from '@/components/Cart'
import { AuthModal } from '@/components/AuthModal'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
          {/* Logótipo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="font-mono text-2xl font-black tracking-widest text-primary flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
              KURIO
            </Link>
          </div>

          {/* Navegação Central (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-[15px] font-medium text-foreground hover:text-primary transition-colors"
              activeProps={{ className: 'text-primary border-b-2 border-primary pb-1' }}
            >
              Início
            </Link>
            <Link
              to="/"
              search={{}}
              className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Mercado
            </Link>
            <Link
              to="/"
              className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Criadores
            </Link>
            <Link
              to="/"
              className="text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Aprenda
            </Link>
          </nav>

          {/* Ações: Carrinho e Login / Usuário */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Cart />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/perfil"
                  className="flex items-center gap-2.5 bg-secondary/80 hover:bg-secondary border border-border px-3 py-1.5 rounded-full transition-colors group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary/40 group-hover:border-primary"
                  />
                  <span className="font-mono text-xs hidden sm:inline-block font-medium text-foreground">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs font-mono text-muted-foreground hover:text-destructive p-2 h-8"
                  title="Encerrar Sessão"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAuthOpen(true)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-5 font-mono text-xs sm:text-sm h-9 transition-all"
              >
                <span className="mr-1.5">↪</span> Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Instância da Modal de Autenticação */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
