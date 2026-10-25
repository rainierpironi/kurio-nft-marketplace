import { test, expect } from '@playwright/test'

test.describe('Perfil do Colecionador e Gestão de Favoritos', () => {
  test('deve acessar o perfil após login e navegar pelas abas', async ({ page }) => {
    await page.goto('/login')

    // Login rápido com Alex Nomad
    await page.locator('button:has-text("Alex Nomad")').click()
    await expect(page).toHaveURL('/')

    // Navega para o perfil
    await page.goto('/perfil')
    await expect(page.locator('h1:has-text("Alex Nomad")')).toBeVisible()

    // Testa as abas
    await page.locator('button:has-text("Carteiras")').click()
    await expect(page.locator('text=Adicionar Nova Carteira')).toBeVisible()

    await page.locator('button:has-text("Favoritos")').click()
    await expect(page.locator('text=NFTs Favoritos')).toBeVisible()

    await page.locator('button:has-text("Segurança")').click()
    await expect(page.locator('text=Alterar Senha de Acesso')).toBeVisible()
  })

  test('deve atualizar os dados do perfil com sucesso', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button:has-text("Alex Nomad")').click()

    await page.goto('/perfil')
    const nameInput = page.locator('input[value="Alex Nomad"]')
    await nameInput.fill('Alex Nomad Atualizado')
    await page.locator('button:has-text("Salvar Alterações")').click()

    await expect(page.locator('text=Perfil atualizado com sucesso!')).toBeVisible()
  })
})
