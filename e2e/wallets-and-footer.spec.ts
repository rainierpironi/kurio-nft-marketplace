import { test, expect } from '@playwright/test'

test.describe('Páginas Dedicadas de Carteiras, Login, Cadastro e Footer', () => {
  test('deve exibir o footer completo com medalhões e newsletter', async ({ page }) => {
    await page.goto('/')
    
    // Verifica elementos do footer
    await expect(page.locator('text=Arte Autêntica & Rara')).toBeVisible()
    await expect(page.locator('text=Liquidação Instantânea')).toBeVisible()
    await expect(page.locator('text=Apoio aos Criadores')).toBeVisible()
    await expect(page.locator('text=Newsletter Kurio')).toBeVisible()
    await expect(page.locator('text=Ethereum Mainnet Operacional')).toBeVisible()
  })

  test('deve gerenciar carteiras na rota dedicada /carteiras', async ({ page }) => {
    // Faz login primeiro
    await page.goto('/login')
    await page.locator('button:has-text("Alex Nomad")').click()

    // Acessa rota /carteiras
    await page.goto('/carteiras')
    await expect(page.locator('h1:has-text("Carteiras e Redes")')).toBeVisible()
    await expect(page.locator('text=Carteiras Vinculadas')).toBeVisible()

    // Simula conexão rápida
    await page.locator('button:has-text("MetaMask")').first().click()
    await page.locator('button:has-text("Confirmar Conexão")').click()

    await expect(page.locator('text=Nova carteira conectada com sucesso!')).toBeVisible()
  })

  test('deve renderizar a página de cadastro /cadastro e validar campos', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.locator('h1, span:has-text("Criar conta")').first()).toBeVisible()

    const submitBtn = page.locator('button:has-text("Finalizar Cadastro")')
    await submitBtn.click()
    await expect(page.locator('text=Preencha todos os campos do formulário')).toBeVisible()
  })
})
