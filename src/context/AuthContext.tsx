import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/lib/api'
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout, mergeCart } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: { name: string; username: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  const refreshUser = async () => {
    const token = localStorage.getItem('KURIO_AUTH_TOKEN')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const data = await getMe()
      setUser(data.user)
    } catch {
      localStorage.removeItem('KURIO_AUTH_TOKEN')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const handleLogin = async (credentials: { email: string; password: string }) => {
    const data = await apiLogin(credentials)
    localStorage.setItem('KURIO_AUTH_TOKEN', data.token)
    setUser(data.user)

    // Mesclagem automática do carrinho de visitante ao fazer login
    try {
      await mergeCart()
    } catch (e) {
      console.warn('Falha na mesclagem do carrinho', e)
    }

    // Invalida e limpa queries para evitar vazamento de dados de outro usuário
    queryClient.invalidateQueries({ queryKey: ['cart'] })
    queryClient.invalidateQueries({ queryKey: ['favorites'] })
    queryClient.invalidateQueries({ queryKey: ['profile'] })
    toast.success(`Bem-vindo de volta, ${data.user.name}!`)
  }

  const handleRegister = async (userData: { name: string; username: string; email: string; password: string }) => {
    const data = await apiRegister(userData)
    localStorage.setItem('KURIO_AUTH_TOKEN', data.token)
    setUser(data.user)

    try {
      await mergeCart()
    } catch (e) {
      console.warn('Falha na mesclagem do carrinho', e)
    }

    queryClient.invalidateQueries({ queryKey: ['cart'] })
    queryClient.invalidateQueries({ queryKey: ['favorites'] })
    toast.success(`Conta criada com sucesso! Bem-vindo, ${data.user.name}.`)
  }

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (e) {
      console.warn('Erro ao deslogar da API', e)
    } finally {
      localStorage.removeItem('KURIO_AUTH_TOKEN')
      setUser(null)
      // LIMPEZA ESTRITA DE CACHE (Critério eliminatório do desafio: isolamento de dados)
      queryClient.clear()
      toast.info('Sessão encerrada.')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
