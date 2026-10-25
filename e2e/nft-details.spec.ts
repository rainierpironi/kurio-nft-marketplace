import { test, expect } from '@playwright/test'

test.describe('Detalhes do NFT e Tratamento 404', () => {
  test('deve acessar diretamente a página de detalhes de um NFT existente fiel ao Figma', async ({ page }) => {
    await page.goto('/nft/1')
    await expect(page.locator('h1:has-text("Emerald Ape #042")')).toBeVisible()
    await expect(page.getByText('1.19 ETH', { exact: true }).first()).toBeVisible()
    await expect(page.locator('text=19 avaliações de colecionadores')).toBeVisible()
    await expect(page.locator('text=ID do token: #0042')).toBeVisible()
    await expect(page.locator('text=Mais desta coleção')).toBeVisible()
  })

  test('deve exibir tela 404 e botão de retorno para NFT inexistente', async ({ page }) => {
    await page.goto('/nft/999999')
    await expect(page.locator('h1:has-text("NFT não encontrado")')).toBeVisible()
    await expect(page.locator('text=#999999')).toBeVisible()

    const backButton = page.locator('button:has-text("Voltar para o catálogo")')
    await expect(backButton).toBeVisible()
    await backButton.click()
    await expect(page).toHaveURL('/')
  })
})
