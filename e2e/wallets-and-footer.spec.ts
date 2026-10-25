import { test, expect } from '@playwright/test'

test.describe('Páginas Dedicadas de Carteiras, Login, Cadastro e Footer', () => {
  test('deve exibir o footer completo com medalhões W, C, D e newsletter fiel ao Figma', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=Segurança da carteira')).toBeVisible()
    await expect(page.locator('text=Criadores em destaque')).toBeVisible()
    await expect(page.locator('text=Alertas de lançamentos')).toBeVisible()
    await expect(page.locator('text=Antecipe-se ao próximo lançamento')).toBeVisible()
    await expect(page.locator('text=© 2026 Kurio. Propriedade digital para todos.')).toBeVisible()
  })

  test('deve gerenciar carteiras na rota dedicada /carteiras fiel ao Figma', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button:has-text("Alex Nomad")').click()
    await expect(page).toHaveURL('/perfil')

    await page.goto('/carteiras')
    await expect(page.locator('h1:has-text("Carteira principal")')).toBeVisible()
    await expect(page.locator('h2:has-text("Carteira secundária")')).toBeVisible()

    // Clica em Adicionar para preencher endereço rápido e salva
    await page.locator('button:has-text("Adicionar")').first().click()
    await page.locator('button:has-text("Salvar carteira")').click()

    await expect(page.locator('text=Carteira salva com sucesso!')).toBeVisible()
  })

  test('deve renderizar a página de cadastro /cadastro e validar campos', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.locator('span:has-text("Criar conta")').first()).toBeVisible()

    const submitBtn = page.locator('button:has-text("Criar conta")')
    await submitBtn.click()
    await expect(page.locator('text=Preencha todos os campos do formulário')).toBeVisible()
  })
})
