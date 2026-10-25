import { test, expect } from '@playwright/test'

test.describe('Detalhes do NFT e Tratamento 404', () => {
  test('deve acessar diretamente a página de detalhes de um NFT existente', async ({ page }) => {
    await page.goto('/nft/1')
    await expect(page.locator('h1:has-text("Cosmic Perspective")')).toBeVisible()
    await expect(page.locator('text=0.05 ETH')).toBeVisible()
    await expect(page.locator('text=Elena Rostova')).toBeVisible()
  })

  test('deve exibir tela 404 e botão de retorno para NFT inexistente', async ({ page }) => {
    await page.goto('/nft/999999')
    await expect(page.locator('text=NFT não encontrado')).toBeVisible()
    await expect(page.locator('text=#999999')).toBeVisible()

    const backButton = page.locator('button:has-text("Voltar para o catálogo")')
    await expect(backButton).toBeVisible()
    await backButton.click()
    await expect(page).toHaveURL('/')
  })
})
