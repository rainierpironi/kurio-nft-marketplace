import { test, expect } from '@playwright/test'

test.describe('Autenticação, Carrinho e Cupom', () => {
  test('deve adicionar item ao carrinho como visitante, aplicar cupom e acessar /carrinho', async ({ page }) => {
    await page.goto('/')

    // Clica no botão Comprar do primeiro card
    const buyButton = page.locator('#catalogo button:has-text("Comprar")').first()
    await buyButton.click()

    // Abre o drawer do carrinho
    await page.locator('button[aria-label="Abrir carrinho"]').click()
    await expect(page.getByRole('heading', { name: /Carrinho de NFTs/i })).toBeVisible()

    // Aplica cupom KURIO10
    const couponInput = page.locator('input[placeholder*="Digite o código promocional"]')
    await expect(couponInput).toBeVisible()
    await couponInput.fill('KURIO10')
    await page.getByRole('dialog').getByRole('button', { name: 'Aplicar' }).click()

    await expect(page.getByRole('dialog').locator('text=(-) 0.12 ETH')).toBeVisible()

    // Navega para a página dedicada /carrinho
    await page.locator('a:has-text("Ver página")').click()
    await expect(page).toHaveURL('/carrinho')
    await expect(page.locator('h2:has-text("Resumo da carteira")')).toBeVisible()
    await expect(page.locator('text=Colecionadores também viram')).toBeVisible()
  })

  test('deve autenticar usuário demo e verificar isolamento no logout', async ({ page }) => {
    await page.goto('/')

    // Abre modal de login pelo botão do Header
    await page.getByRole('banner').getByRole('button', { name: /Entrar/i }).click()
    await expect(page.locator('text=Contas de demonstração rápida')).toBeVisible()

    // Clica no botão rápido do Alex Nomad
    await page.locator('button:has-text("Alex Nomad")').click()

    // Verifica que o nome Alex aparece no Header
    await expect(page.getByRole('banner').locator('text=Alex')).toBeVisible()

    // Efetua logout
    await page.getByRole('banner').getByRole('button', { name: 'Sair' }).click()
    await expect(page.getByRole('banner').getByRole('button', { name: /Entrar/i })).toBeVisible()
  })
})
