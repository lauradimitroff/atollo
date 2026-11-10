import { test, expect, type Page } from '@playwright/test'

test('the demo account explains why its settings are locked', async ({ page }) => {
  await page.goto('/settings/profile')
  await expect(page.getByRole('note')).toContainText('Compte de démonstration')
  await expect(page.getByLabel('Nom')).toBeDisabled()

  await page.goto('/settings/account')
  await expect(page.getByRole('button', { name: 'Supprimer mon compte' })).toBeDisabled()

  // Its sites can be looked at (tracking code) but not changed.
  await page.goto('/settings/sites')
  await expect(page.getByRole('button', { name: 'Ajouter le site' })).toBeDisabled()
  const first = page.getByRole('region', { name: 'Vos sites' }).getByRole('listitem').first()
  await expect(first.getByRole('button', { name: 'Modifier' })).toBeDisabled()
  await first.getByRole('button', { name: 'Code de suivi' }).click()
  await expect(page.getByRole('dialog')).toContainText('data-site="atelier-nord"')
})

test.describe('with an account of its own', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  const PASSWORD = 'une phrase assez longue'

  async function signUp(page: Page) {
    await page.goto('/register?redirect=/settings/profile')
    await page.getByLabel('Nom').fill('Sam Test')
    await page.getByLabel('Adresse e-mail').fill('sam@studio.example')
    await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Créer mon compte' }).click()
    await expect(page).toHaveURL('/settings/profile')
  }

  test('renames the account', async ({ page }) => {
    await signUp(page)
    const save = page.getByRole('button', { name: 'Enregistrer' })
    await expect(save).toBeDisabled() // nothing changed yet

    await page.getByLabel('Nom').fill('Sam Martin')
    await save.click()
    await expect(page.getByRole('status')).toHaveText('Profil enregistré.')
  })

  test('changes the password only with the current one', async ({ page }) => {
    await signUp(page)
    await page.goto('/settings/account')
    const section = page.getByRole('region', { name: 'Mot de passe' })

    await section.getByLabel('Mot de passe actuel').fill('pas le bon')
    await section.getByLabel('Nouveau mot de passe').fill('une autre phrase longue')
    await section.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(section.getByRole('alert')).toHaveText('Mot de passe actuel incorrect.')

    await section.getByLabel('Mot de passe actuel').fill(PASSWORD)
    await section.getByRole('button', { name: 'Changer le mot de passe' }).click()
    await expect(section.getByRole('status')).toHaveText('Mot de passe modifié.')
  })

  test('starts with no site, then adds, edits and deletes one', async ({ page }) => {
    await signUp(page)
    await page.goto('/sites')
    await expect(page.getByRole('heading', { name: 'Ajoutez votre premier site' })).toBeVisible()
    // The demo sites belong to the demo account only.
    await page.goto('/s/atelier-nord/overview')
    await expect(page.getByRole('heading', { name: 'Cette page n’existe pas' })).toBeVisible()

    await page.goto('/settings/sites')
    const add = page.getByRole('region', { name: 'Ajouter un site' })
    await add.getByLabel('Nom du site').fill('Carnet de voyage')
    await add.getByLabel('Domaine').fill('https://www.Carnet.example/blog')
    await add.getByRole('button', { name: 'Ajouter le site' }).click()
    await expect(add.getByRole('status').filter({ hasText: 'ajouté' })).toContainText(
      'Carnet de voyage est ajouté.',
    )
    await expect(add.getByLabel('Code de suivi')).toContainText('data-site=')

    const list = page.getByRole('region', { name: 'Vos sites' })
    await expect(list.getByRole('listitem')).toContainText('carnet.example')

    await list.getByRole('button', { name: 'Modifier' }).click()
    const edit = page.getByRole('dialog')
    await edit.getByLabel('Nom du site').fill('Carnet de route')
    await edit.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(edit).toBeHidden()
    await expect(list.getByRole('listitem')).toContainText('Carnet de route')

    // Its dashboard opens, with no visit yet: no tracking script is installed.
    await list.getByRole('link', { name: /Carnet de route/ }).click()
    await expect(
      page.getByRole('heading', { name: 'Aucune visite sur cette période' }),
    ).toBeVisible()

    await page.goto('/settings/sites')
    await list.getByRole('button', { name: 'Supprimer' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer le site' }).click()
    await expect(list).toContainText('Aucun site pour l’instant.')
  })

  test('refuses the same domain twice in an account', async ({ page }) => {
    await signUp(page)
    await page.goto('/settings/sites')
    const add = page.getByRole('region', { name: 'Ajouter un site' })
    for (const name of ['Blog', 'Blog bis']) {
      await add.getByLabel('Nom du site').fill(name)
      await add.getByLabel('Domaine').fill('https://blog.example')
      await add.getByRole('button', { name: 'Ajouter le site' }).click()
      // Wait for the answer: the form empties itself after a success.
      await expect(add.getByRole('button', { name: 'Ajouter le site' })).not.toHaveAttribute(
        'aria-busy',
      )
    }
    await expect(add.getByRole('alert')).toHaveText('Ce domaine est déjà suivi dans votre compte.')
    await expect(page.getByRole('region', { name: 'Vos sites' })).toContainText('1 site suivi.')
  })

  test('deletes the account after confirmation', async ({ page }) => {
    await signUp(page)
    await page.goto('/settings/sites')
    await page.getByLabel('Nom du site').fill('Blog')
    await page.getByLabel('Domaine').fill('blog.example')
    await page.getByRole('button', { name: 'Ajouter le site' }).click()
    await expect(page.getByRole('region', { name: 'Vos sites' })).toContainText('blog.example')
    await page.goto('/settings/account')

    await page.getByRole('button', { name: 'Supprimer mon compte' }).click()
    const dialog = page.getByRole('alertdialog')
    await dialog.getByLabel('Mot de passe actuel, pour confirmer').fill(PASSWORD)
    await dialog.getByRole('button', { name: 'Supprimer définitivement' }).click()

    await expect(page).toHaveURL('/login?deleted=1')
    await expect(page.getByRole('status')).toContainText('Votre compte a bien été supprimé.')
    // Its sites went with it.
    expect(await page.evaluate(() => localStorage.getItem('atollo-sites'))).toBe('[]')

    await page.getByLabel('Adresse e-mail').fill('sam@studio.example')
    await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await expect(page.getByRole('alert')).toContainText('E-mail ou mot de passe incorrect.')
  })
})
