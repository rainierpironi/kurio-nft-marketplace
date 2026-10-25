import { test, expect } from '@playwright/test'

test.describe('Perfil do Colecionador e Gestão de Favoritos', () => {
  test('deve acessar o perfil após login e navegar pelas abas', async ({ page }) => {
    await page.goto('/login')

    // Login rápido com Alex Nomad
    await page.locator('button:has-text("Alex Nomad")').click()
    await expect(page).toHaveURL('/perfil')

    await expect(page.locator('h1:has-text("Alex Nomad")')).toBeVisible()

    // Testa as abas
    await page.locator('button:has-text("Carteiras Conectadas")').click()
    await expect(page.locator('text=Conectar Nova Carteira')).toBeVisible()

    await page.locator('button:has-text("Favoritos (")').click()
    await expect(page.locator('text=Seus Colecionáveis Salvos')).toBeVisible()

    await page.locator('button:has-text("Segurança & Senha")').click()
    await expect(page.locator('h2:has-text("Alterar Senha")')).toBeVisible()
  })

  test('deve atualizar os dados do perfil com sucesso', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button:has-text("Alex Nomad")').click()
    await expect(page).toHaveURL('/perfil')

    await expect(page.locator('h1:has-text("Alex Nomad")')).toBeVisible()

    const nameInput = page.locator('form input[type="text"]').first()
    await nameInput.fill('Alex Nomad Atualizado')
    await page.locator('button:has-text("Salvar Alterações")').click()

    await expect(page.locator('text=Perfil atualizado com sucesso!')).toBeVisible()
  })
})
