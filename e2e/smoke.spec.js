const { test, expect } = require('@playwright/test');

test.describe('Smoke', () => {
  test('the app loads and shows its home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Pocketman');
    await expect(page.locator('.logo')).toHaveText('Pocketman');
  });
});
