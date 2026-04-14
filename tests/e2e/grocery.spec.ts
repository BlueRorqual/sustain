import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => indexedDB.deleteDatabase('sustain'))
})

test('grocery list shows empty state when no list exists', async ({ page }) => {
  await page.goto('/grocery')
  await expect(page.getByText('No active grocery list.')).toBeVisible()
})

test('navigating to discover from empty grocery list', async ({ page }) => {
  await page.goto('/grocery')
  await page.getByText('Start discovering produce').click()
  await expect(page).toHaveURL('/discover')
})
