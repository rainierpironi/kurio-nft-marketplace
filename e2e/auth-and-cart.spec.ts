import { test, expect } from '@playwright/test'

test.describe('Autenticação, Carrinho e Cupom', () => {
  test('deve adicionar item ao carrinho como visitante e aplicar cupom de desconto', async ({ page }) => {
    await page.goto('/')

    // Clica no botão Comprar do primeiro card
    const buyButton = page.locator('button:has-text("Comprar")').first()
    await buyButton.click()

    // Abre o carrinho
    await page.locator('button[aria-label="Abrir carrinho"]').click()
    await expect(page.locator('text=O seu Carrinho')).toBeVisible()

    // Aplica cupom KURIO10
    const couponInput = page.locator('input[placeholder*="Cupom"]')
    await couponInput.fill('KURIO10')
    await page.locator('button:has-text("Aplicar")').click()

    await expect(page.locator('text=Desconto (KURIO10)')).toBeVisible()
  })

  test('deve autenticar usuário demo e verificar isolamento no logout', async ({ page }) => {
    await page.goto('/')

    // Abre modal de login
    await page.locator('button:has-text("Entrar")').click()
    await expect(page.locator('text=Usuários rápidos para teste')).toBeVisible()

    // Clica no botão rápido do Alex Nomad
    await page.locator('button:has-text("Alex Nomad")').click()

    // Verifica que o nome Alex aparece no Header
    await expect(page.locator('text=Alex')).toBeVisible()

    // Efetua logout
    await page.locator('button:has-text("Sair")').click()
    await expect(page.locator('button:has-text("Entrar")')).toBeVisible()
  })
})
