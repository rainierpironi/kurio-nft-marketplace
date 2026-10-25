import { test, expect } from '@playwright/test'

test.describe('Catálogo, Filtros, Header e Sincronização de URL', () => {
  test('deve carregar a página inicial com catálogo fiel ao Figma, Header funcional e Hero banner', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner').getByRole('link', { name: 'KURIO' })).toBeVisible()
    await expect(page.locator('text=SEJA DONO DO FUTURO DA')).toBeVisible()
    await expect(page.locator('#catalogo').locator('text=Emerald Ape #042')).toBeVisible()
    await expect(page.locator('#catalogo').locator('text=Sage Nomad #009')).toBeVisible()
    await expect(page.locator('#catalogo').locator('text=Neon Vessel #552')).toBeVisible()

    // Verifica que os links do Header estão visíveis e funcionais
    const nav = page.getByRole('navigation', { name: 'Navegação Principal' })
    await expect(nav.getByRole('button', { name: 'Início' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Mercado' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Criadores' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Aprenda' })).toBeVisible()
  })

  test('deve filtrar por busca textual e refletir na URL', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('#catalogo input[placeholder*="Buscar por nome"]')
    await searchInput.fill('Emerald')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/q=Emerald/)
    await expect(page.locator('#catalogo').locator('text=Emerald Ape #042')).toBeVisible()
    await expect(page.locator('#catalogo').locator('text=Sage Nomad #009')).not.toBeVisible()
  })

  test('deve alternar categoria na sidebar Coleções, sincronizar na URL e permitir limpar', async ({ page }) => {
    await page.goto('/')
    await page.locator('#catalogo li:has-text("Fotografia")').click()

    await expect(page).toHaveURL(/category=Fotografia/)
    await expect(page.locator('#catalogo').locator('text=Neon Vessel #552')).toBeVisible()

    // Limpar filtro
    await page.locator('#catalogo button:has-text("Limpar")').first().click()
    await expect(page).not.toHaveURL(/category=/)
  })

  test('deve navegar pelo histórico do navegador preservando filtros', async ({ page }) => {
    await page.goto('/')
    await page.locator('#catalogo li:has-text("Música")').click()
    await expect(page).toHaveURL(/category=M%C3%BAsica/)

    await page.goBack()
    await expect(page).not.toHaveURL(/category=/)

    await page.goForward()
    await expect(page).toHaveURL(/category=M%C3%BAsica/)
  })
})
