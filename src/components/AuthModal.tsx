import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Campos do formulário
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const modalRef = useRef<HTMLDivElement>(null)

  // Gerenciamento de foco e tecla ESC (a11y)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleQuickLogin = async (userEmail: string) => {
    setIsSubmitting(true)
    try {
      await login({ email: userEmail, password: 'password123' })
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Falha ao autenticar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (activeTab === 'login') {
        if (!email || !password) {
          toast.error('Preencha e-mail e senha')
          setIsSubmitting(false)
          return
        }
        await login({ email, password })
        onClose()
      } else {
        if (!name || !username || !email || !password) {
          toast.error('Preencha todos os campos')
          setIsSubmitting(false)
          return
        }
        if (password !== confirmPassword) {
          toast.error('As senhas não coincidem')
          setIsSubmitting(false)
          return
        }
        await register({ name, username, email, password })
        onClose()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro na operação')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      {/* Container da Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors text-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Cabeçalho da Modal (Tabs) */}
        <div id="auth-modal-title" className="flex justify-center items-center gap-3 mb-6 font-sans text-xl font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`cursor-pointer transition-colors ${
              activeTab === 'login' ? 'text-foreground border-b-2 border-primary pb-1' : 'text-muted-foreground hover:text-foreground/80'
            }`}
          >
            Entrar
          </button>
          <span className="text-muted-foreground font-light">|</span>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`cursor-pointer transition-colors ${
              activeTab === 'register' ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground hover:text-primary/80'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">Nome de Usuário</label>
                <input
                  type="text"
                  placeholder="@usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1">E-mail</label>
            <input
              type="email"
              placeholder={activeTab === 'login' ? 'alex@kurio.art' : 'contato@email.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1">Confirmar Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl font-bold font-sans text-sm mt-3"
          >
            {isSubmitting ? 'Processando...' : activeTab === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        {/* Atalhos Rápidos para Testes de Avaliação (Mock Users) */}
        {activeTab === 'login' && (
          <div className="mt-6 pt-5 border-t border-border/60">
            <p className="text-xs font-mono text-muted-foreground text-center mb-3">
              Usuários rápidos para teste e avaliação de isolamento:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex@kurio.art')}
                className="text-xs font-mono py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👤</span> Alex Nomad
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sara@kurio.art')}
                className="text-xs font-mono py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👤</span> Sara Nova
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
