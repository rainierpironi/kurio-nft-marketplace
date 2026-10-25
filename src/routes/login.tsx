import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/perfil' })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha seu e-mail e senha')
      return
    }

    setIsSubmitting(true)
    try {
      await login({ email, password })
      navigate({ to: '/perfil' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao autenticar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickLogin = async (userEmail: string) => {
    setIsSubmitting(true)
    try {
      await login({ email: userEmail, password: 'password123' })
      navigate({ to: '/perfil' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao autenticar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-260px)] font-mono">
      <div className="relative w-full max-w-[460px] bg-[#1E1712] border border-border shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-primary hover:opacity-80 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>

          {/* Abas Entrar | Criar conta (Fiel a Login.png e MLogin.png) */}
          <div className="flex justify-center items-center gap-3 mb-5 text-base font-bold">
            <span className="text-primary">Entrar</span>
            <span className="text-muted-foreground font-light">|</span>
            <Link to="/cadastro" className="text-foreground hover:text-primary transition-colors">
              Criar conta
            </Link>
          </div>

          <p className="text-xs text-foreground/90 mb-4 leading-relaxed">
            Entre para gerenciar sua carteira, coleção e perfil de criador.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <input
              type="email"
              aria-label="E-mail"
              required
              placeholder="contato@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-primary/70 rounded-md px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label="Senha"
                required
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-3.5 pr-10 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Alternar visibilidade da senha"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast.info('Para testes, a senha padrão é password123')}
                className="text-[11px] text-primary hover:underline cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-md font-bold font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 mt-2 cursor-pointer"
            >
              {isSubmitting ? 'Autenticando...' : 'Entrar'}
            </Button>
          </form>

          {/* Divisor Social */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] text-muted-foreground">Ou continue com</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-2.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@kurio.art')}
              className="w-full h-10 bg-background border border-border hover:border-primary rounded-md flex items-center justify-center gap-2.5 text-foreground transition-colors cursor-pointer"
            >
              <span className="font-bold text-primary">G</span>
              <span>Continuar com Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sara@kurio.art')}
              className="w-full h-10 bg-background border border-border hover:border-primary rounded-md flex items-center justify-center gap-2.5 text-foreground transition-colors cursor-pointer"
            >
              <span className="font-bold text-[#3b82f6]">f</span>
              <span>Continuar com Facebook</span>
            </button>
          </div>

          {/* Atalhos para Teste de Isolamento */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <p className="text-[10px] text-muted-foreground text-center mb-2">
              Contas rápidas para avaliação:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex@kurio.art')}
                className="py-1.5 px-2.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👤</span> Alex Nomad
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sara@kurio.art')}
                className="py-1.5 px-2.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👤</span> Sara Nova
              </button>
            </div>
          </div>
        </div>

        <div className="h-2.5 w-full bg-primary" />
      </div>
    </div>
  )
}
