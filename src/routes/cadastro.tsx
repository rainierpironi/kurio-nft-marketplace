import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export const Route = createFileRoute('/cadastro')({
  component: CadastroPage,
})

function CadastroPage() {
  const { register, login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/perfil' })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const displayName = name.trim() || username.trim()
    const handle = username.trim() || displayName.toLowerCase().replace(/\s+/g, '')

    if (!displayName || !email || !password) {
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
      await register({ name: displayName, username: handle, email, password })
      navigate({ to: '/' })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialRegister = async (userEmail: string) => {
    setIsSubmitting(true)
    try {
      await login({ email: userEmail, password: 'password123' })
      navigate({ to: '/' })
    } catch {
      toast.error('Falha na autenticação social')
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

          {/* Abas Entrar | Criar conta (Fiel a Cadastro.png e MCadastro.png) */}
          <div className="flex justify-center items-center gap-3 mb-5 text-base font-bold">
            <Link to="/login" className="text-foreground hover:text-primary transition-colors">
              Entrar
            </Link>
            <span className="text-muted-foreground font-light">|</span>
            <span className="text-primary">Criar conta</span>
          </div>

          <p className="text-xs text-foreground/90 mb-4 leading-relaxed">
            Crie seu perfil de colecionador e conecte uma carteira quando quiser.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
            <input
              type="text"
              aria-label="Nome Completo"
              placeholder="Nome de exibição"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />

            <input
              type="text"
              aria-label="Nome de usuário"
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />

            <input
              type="email"
              aria-label="E-mail"
              placeholder="Digite seu endereço de e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label="Senha"
                placeholder="Senha"
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

            <input
              type={showPassword ? 'text' : 'password'}
              aria-label="Confirmar Senha"
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-md font-bold font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 mt-2 cursor-pointer"
            >
              {isSubmitting ? 'Registrando...' : 'Criar conta'}
            </Button>
          </form>

          {/* Divisor Social */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] text-muted-foreground">Ou cadastre-se com</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-2.5 text-xs">
            <button
              type="button"
              onClick={() => handleSocialRegister('alex@kurio.art')}
              className="w-full h-10 bg-background border border-border hover:border-primary rounded-md flex items-center justify-center gap-2.5 text-foreground transition-colors cursor-pointer"
            >
              <span className="font-bold text-primary">G</span>
              <span>Continuar com Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialRegister('sara@kurio.art')}
              className="w-full h-10 bg-background border border-border hover:border-primary rounded-md flex items-center justify-center gap-2.5 text-foreground transition-colors cursor-pointer"
            >
              <span className="font-bold text-[#3b82f6]">f</span>
              <span>Continuar com Facebook</span>
            </button>
          </div>
        </div>

        <div className="h-2.5 w-full bg-primary" />
      </div>
    </div>
  )
}
