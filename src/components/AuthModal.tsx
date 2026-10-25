import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

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
        const displayName = name.trim() || username.trim()
        const handle = username.trim() || displayName.toLowerCase().replace(/\s+/g, '')
        if (!displayName || !email || !password) {
          toast.error('Preencha todos os campos')
          setIsSubmitting(false)
          return
        }
        if (password !== confirmPassword) {
          toast.error('As senhas não coincidem')
          setIsSubmitting(false)
          return
        }
        await register({ name: displayName, username: handle, email, password })
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[460px] bg-[#1E1712] border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono"
      >
        <div className="p-6 sm:p-8">
          {/* Botão Fechar */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-4 right-4 text-primary hover:opacity-80 transition-opacity text-base font-bold cursor-pointer"
          >
            ✕
          </button>

          {/* Cabeçalho (Entrar | Criar conta) */}
          <div id="auth-modal-title" className="flex justify-center items-center gap-3 mb-5 text-base font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`cursor-pointer transition-colors ${
                activeTab === 'login' ? 'text-primary' : 'text-foreground hover:text-primary/80'
              }`}
            >
              Entrar
            </button>
            <span className="text-muted-foreground font-light">|</span>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`cursor-pointer transition-colors ${
                activeTab === 'register' ? 'text-primary' : 'text-foreground hover:text-primary/80'
              }`}
            >
              Criar conta
            </button>
          </div>

          <p className="text-xs text-foreground/90 mb-4 leading-relaxed">
            {activeTab === 'login'
              ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
              : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
          </p>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {activeTab === 'register' && (
              <>
                <input
                  type="text"
                  aria-label="Nome Completo"
                  placeholder="Nome de exibição"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="text"
                  aria-label="Nome de usuário"
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </>
            )}

            <input
              type="email"
              aria-label="E-mail"
              placeholder={activeTab === 'login' ? 'contato@email.com' : 'Digite seu endereço de e-mail'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-primary/70 rounded-md px-3.5 py-2.5 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label="Senha"
                placeholder={activeTab === 'login' ? '••••••••••' : 'Senha'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-md pl-3.5 pr-10 py-2.5 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
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

            {activeTab === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => toast.info('Instruções enviadas para seu e-mail.')}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {activeTab === 'register' && (
              <input
                type={showPassword ? 'text' : 'password'}
                aria-label="Confirmar Senha"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3.5 py-2.5 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-md font-bold font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 mt-2 cursor-pointer"
            >
              {isSubmitting ? 'Processando...' : activeTab === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          {/* Divisor Social (Fiel a Login.png e Cadastro.png) */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-border flex-1" />
            <span className="text-[11px] text-muted-foreground">
              {activeTab === 'login' ? 'Ou continue com' : 'Ou cadastre-se com'}
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@kurio.art')}
              className="w-full h-10 bg-background border border-border hover:border-primary rounded-md flex items-center justify-center gap-2.5 text-xs text-foreground transition-colors cursor-pointer"
            >
              <span className="font-bold text-primary">G</span>
              <span>Continuar com Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sara@kurio.art')}
              className="w-full h-10 bg-background border border-border hover:border-primary rounded-md flex items-center justify-center gap-2.5 text-xs text-foreground transition-colors cursor-pointer"
            >
              <span className="font-bold text-[#3b82f6]">f</span>
              <span>Continuar com Facebook</span>
            </button>
          </div>

          {/* Atalhos Rápidos para Avaliação de Isolamento de Dados */}
          <div className="mt-5 pt-4 border-t border-border/60">
            <p className="text-[10px] text-muted-foreground text-center mb-2">
              Contas de demonstração rápida:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('alex@kurio.art')}
                className="text-[11px] py-1.5 px-2.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👤</span> Alex Nomad
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sara@kurio.art')}
                className="text-[11px] py-1.5 px-2.5 rounded bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👤</span> Sara Nova
              </button>
            </div>
          </div>
        </div>

        {/* Barra inferior âmbar fiel ao Mockup */}
        <div className="h-2.5 w-full bg-primary" />
      </div>
    </div>
  )
}
