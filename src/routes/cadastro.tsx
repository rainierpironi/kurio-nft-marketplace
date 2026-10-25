import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const Route = createFileRoute('/cadastro')({
  component: CadastroPage,
})

function CadastroPage() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    navigate({ to: '/perfil' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !username || !email || !password) {
      toast.error('Preencha todos os campos do formulário')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas digitadas não coincidem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await register({ name, username, email, password })
      navigate({ to: '/' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-280px)]">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Header da Página de Cadastro (Figma Frame: Desktop / Cadastro) */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-3 font-sans text-2xl font-black text-foreground">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <span className="text-muted-foreground font-light">|</span>
            <span className="text-primary border-b-2 border-primary pb-1">Criar conta</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground pt-1">
            Cadastre-se na Kurio para colecionar, favoritar e apoiar artistas.
          </p>
        </div>

        {/* Formulário de Registro */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-muted-foreground mb-1.5 font-bold">Nome Completo</label>
            <input
              type="text"
              required
              placeholder="Ex: Lucas Mendes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-bold">Nome de Usuário</label>
            <input
              type="text"
              required
              placeholder="lucasmendes"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-bold">E-mail</label>
            <input
              type="email"
              required
              placeholder="lucas@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-bold">Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5 font-bold">Confirmar Senha</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl font-bold font-sans text-sm text-primary-foreground mt-4 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? 'Registrando...' : 'Finalizar Cadastro'}
          </Button>
        </form>

      </div>
    </div>
  )
}
