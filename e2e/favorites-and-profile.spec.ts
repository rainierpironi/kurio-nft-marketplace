import { test, expect } from '@playwright/test'

test.describe('Perfil do Colecionador e Gestão de Favoritos', () => {
  test('deve acessar o perfil após login e navegar pela sidebar Meu perfil', async ({ page }) => {
    await page.goto('/login')

    // Login rápido com Alex Nomad
    await page.locator('button:has-text("Alex Nomad")').click()
    await expect(page).toHaveURL('/perfil')

    await expect(page.locator('h1:has-text("Perfil do colecionador")')).toBeVisible()
    await expect(page.locator('h2:has-text("Meu perfil")')).toBeVisible()
    await expect(page.locator('h2:has-text("Alterar senha")')).toBeVisible()

    // Testa navegação para Lista de interesse (Favoritos)
    await page.locator('aside button:has-text("Lista de interesse")').click()
    await expect(page.locator('h2:has-text("Lista de interesse (Favoritos)")')).toBeVisible()
  })

  test('deve atualizar os dados do perfil com sucesso', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button:has-text("Alex Nomad")').click()
    await expect(page).toHaveURL('/perfil')

    await expect(page.locator('h1:has-text("Perfil do colecionador")')).toBeVisible()

    const nameInput = page.locator('input[aria-label="Nome de Exibição"]')
    await nameInput.fill('Alex Nomad Atualizado')
    await page.locator('button:has-text("Salvar")').click()

    await expect(page.locator('text=Perfil atualizado com sucesso!')).toBeVisible()
  })
})
