import { test, expect } from '@playwright/test'

test.describe('Fluxo Ponta a Ponta: Compra e Recibo de Confirmação', () => {
  test('deve concluir compra e exibir recibo snapshot imutável fiel ao Figma', async ({ page }) => {
    await page.goto('/')

    // Adiciona NFT ao carrinho
    await page.locator('#catalogo button:has-text("Comprar")').first().click()

    // Abre o carrinho e avança para checkout
    await page.locator('button[aria-label="Abrir carrinho"]').click()
    const checkoutBtn = page.locator('button:has-text("Conectar e finalizar")')
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    await expect(page).toHaveURL('/pagamento')
    await expect(page.locator('h1:has-text("Perfil do colecionador")')).toBeVisible()
    await expect(page.locator('h2:has-text("Seus NFTs")')).toBeVisible()

    // Preenche dados obrigatórios do formulário
    await page.getByPlaceholder('Ex: Alex Nomad', { exact: true }).fill('Teste Colecionador')
    await page.getByPlaceholder('Ex: alexnomad', { exact: true }).fill('testecolecionador')
    await page.getByPlaceholder('Ex: Alex Nomad Vault', { exact: true }).fill('Perfil Teste')
    await page.locator('input[placeholder*="0x da carteira principal"]').fill('0x71C84982a17D9eC9b840132bFa3d')
    await page.getByPlaceholder('seuemail@exemplo.com').first().fill('teste@kurio.art')

    // Confirma pagamento
    await page.locator('button:has-text("Confirmar compra")').click()

    // Deve redirecionar para a página de confirmação
    await expect(page).toHaveURL(/\/confirmacao\/ORD-/, { timeout: 10000 })
    await expect(page.locator('h1:has-text("Seus NFTs agora estão na sua carteira")')).toBeVisible()
    await expect(page.locator('text=Detalhes da transação')).toBeVisible()
    await expect(page.locator('a:has-text("Ver no Etherscan")')).toBeVisible()
  })
})
