import { test, expect } from '@playwright/test'

test('onboarding with manual location', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Where are you shopping?')).toBeVisible()

  // Skip GPS, enter manually
  await page.getByText('Enter manually').click()
  await page.getByPlaceholder('City').fill('Portland')
  await page.getByPlaceholder('Region / State').fill('Oregon')
  await page.getByPlaceholder('Country').fill('USA')
  await page.getByText('Continue').click()

  // Dietary prefs step
  await expect(page.getByText('Any dietary preferences?')).toBeVisible()
  await page.getByText('Skip for now').click()

  // Redirected to discover
  await expect(page).toHaveURL('/discover')
})

test('geolocation denied falls back to manual input', async ({ page, context }) => {
  await context.grantPermissions([]) // deny all permissions
  await page.goto('/')
  await page.getByText('Use my location').click()
  // Should show manual input
  await expect(page.getByPlaceholder('City')).toBeVisible()
})
