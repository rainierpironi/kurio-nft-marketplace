import { test, expect } from '@playwright/test'

test.describe('Catálogo, Filtros e Sincronização de URL', () => {
  test('deve carregar a página inicial com catálogo e Hero banner', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=KURIO')).toBeVisible()
    await expect(page.locator('text=Seja dono do futuro')).toBeVisible()
    await expect(page.locator('text=Cosmic Perspective')).toBeVisible()
  })

  test('deve filtrar por busca textual e refletir na URL', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('input[placeholder*="Buscar por nome"]')
    await searchInput.fill('Emerald')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/q=Emerald/)
    await expect(page.locator('text=Emerald Ape #042')).toBeVisible()
    await expect(page.locator('text=Digital Horizon')).not.toBeVisible()
  })

  test('deve alternar categoria, sincronizar na URL e permitir limpar', async ({ page }) => {
    await page.goto('/')
    await page.locator('li:has-text("Fotografia")').click()

    await expect(page).toHaveURL(/category=Fotografia/)
    await expect(page.locator('text=Digital Horizon')).toBeVisible()

    // Limpar filtro
    await page.locator('button:has-text("Limpar")').first().click()
    await expect(page).not.toHaveURL(/category=/)
  })

  test('deve navegar pelo histórico do navegador preservando filtros', async ({ page }) => {
    await page.goto('/')
    await page.locator('li:has-text("Música")').click()
    await expect(page).toHaveURL(/category=M%C3%BAsica/)

    await page.goBack()
    await expect(page).not.toHaveURL(/category=/)

    await page.goForward()
    await expect(page).toHaveURL(/category=M%C3%BAsica/)
  })
})
