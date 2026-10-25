import { test, expect } from '@playwright/test'

test.describe('Fluxo Ponta a Ponta: Compra e Recibo de Confirmação', () => {
  test('deve concluir compra e exibir recibo snapshot imutável com ID e hash', async ({ page }) => {
    await page.goto('/')

    // Adiciona NFT ao carrinho
    await page.locator('button:has-text("Comprar")').first().click()

    // Abre o carrinho e avança para checkout
    await page.locator('button[aria-label="Abrir carrinho"]').click()
    await page.locator('button:has-text("Avançar para Pagamento")').click()

    await expect(page).toHaveURL('/pagamento')
    await expect(page.locator('h1:has-text("Perfil do colecionador")')).toBeVisible()

    // Preenche dados obrigatórios do formulário
    await page.locator('input[placeholder*="Alex Nomad"]').fill('Teste Colecionador')
    await page.locator('input[placeholder*="alexnomad"]').fill('testecolecionador')
    await page.locator('input[placeholder*="Alex Nomad Vault"]').fill('Perfil Teste')
    await page.locator('input[placeholder*="0x da carteira principal"]').fill('0x71C84982a17D9eC9b840132bFa3d')
    await page.locator('input[placeholder*="seuemail@exemplo.com"]').fill('teste@kurio.art')

    // Confirma pagamento
    await page.locator('button:has-text("Confirmar e Pagar")').click()

    // Deve redirecionar para a página de confirmação
    await expect(page).toHaveURL(/\/confirmacao\/ORD-/)
    await expect(page.locator('h1:has-text("Pagamento Confirmado!")')).toBeVisible()
    await expect(page.locator('text=Hash da Transação (TX Hash)')).toBeVisible()
    await expect(page.locator('text=0x')).toBeVisible()
  })
})
