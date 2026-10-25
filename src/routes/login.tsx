import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Se já estiver logado, redireciona para o perfil
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
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-280px)]">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Header da Página de Login (Figma Frame: Desktop / Login) */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-3 font-sans text-2xl font-black text-foreground">
            <span className="text-primary border-b-2 border-primary pb-1">Entrar</span>
            <span className="text-muted-foreground font-light">|</span>
            <Link to="/cadastro" className="text-muted-foreground hover:text-foreground transition-colors">
              Criar conta
            </Link>
          </div>
          <p className="font-mono text-xs text-muted-foreground pt-1">
            Acesse seu perfil de colecionador e gerencie seus NFTs.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-muted-foreground mb-1.5 font-bold">E-mail</label>
            <input
              type="email"
              required
              placeholder="alex@kurio.art"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-muted-foreground font-bold">Senha</label>
              <button
                type="button"
                onClick={() => toast.info('Para testes, a senha padrão é password123')}
                className="text-primary hover:underline text-[11px]"
              >
                Esqueceu a senha?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl font-bold font-sans text-sm text-primary-foreground mt-4 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? 'Autenticando...' : 'Entrar na Plataforma'}
          </Button>
        </form>

        {/* Usuários Rápidos para Teste de Isolamento */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-xs font-mono text-muted-foreground text-center mb-3">
            Atalhos para avaliação e teste de isolamento de cache:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@kurio.art')}
              className="py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border font-mono text-xs text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👤</span> Alex Nomad
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sara@kurio.art')}
              className="py-2.5 px-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border font-mono text-xs text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👤</span> Sara Nova
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
