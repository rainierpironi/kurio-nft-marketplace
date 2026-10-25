import { useState, useEffect } from 'react'
import { resetFixture } from '@/lib/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function DevTools() {
  const [scenario, setScenario] = useState('success')
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    const saved = localStorage.getItem('MSW_SCENARIO') || 'success'
    setScenario(saved)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setScenario(value)
    localStorage.setItem('MSW_SCENARIO', value)
    toast.info(`Cenário alterado para: ${value}`)
  }

  const triggerRealtimeUpdate = () => {
    window.dispatchEvent(new Event('MSW_SIMULATE_NFT_UPDATE'))
  }

  const handleResetFixture = async () => {
    try {
      await resetFixture()
      localStorage.setItem('MSW_SCENARIO', 'success')
      setScenario('success')
      queryClient.clear()
      toast.success('Fixtures de simulação restauradas com sucesso!')
    } catch {
      toast.error('Erro ao restaurar fixtures.')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Painel de Simulação"
        className="fixed bottom-20 md:bottom-4 left-4 z-[9999] bg-card/95 hover:bg-card border border-border px-3 py-1.5 rounded-full shadow-2xl font-mono text-xs text-primary font-bold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all hover:scale-105"
      >
        <span>⚡</span> MSW DevTools
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-[9999] bg-card border border-border/80 p-4 rounded-2xl shadow-2xl font-mono text-xs flex flex-col gap-3 w-64 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="text-primary font-bold uppercase text-[11px] flex items-center gap-1">
          <span>⚡</span> MSW Simulação
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block font-bold text-[10px] uppercase">
          Cenário de Teste:
        </label>
        <select
          value={scenario}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-xl px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary text-xs"
        >
          <option value="success">Sucesso Normal</option>
          <option value="payment_failed">Falha Pagamento (402)</option>
          <option value="timeout">Timeout de Rede</option>
          <option value="favorites_fail">Falha Favorito (Rollback)</option>
          <option value="session_expired">Sessão Expirada (401)</option>
        </select>
      </div>

      <button
        onClick={triggerRealtimeUpdate}
        className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-bold py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <span>📡</span> WebSocket Alteração
      </button>

      <button
        onClick={handleResetFixture}
        className="w-full bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground py-1.5 rounded-xl transition-colors cursor-pointer text-[11px]"
      >
        ↺ Restaurar Fixtures
      </button>
    </div>
  )
}
