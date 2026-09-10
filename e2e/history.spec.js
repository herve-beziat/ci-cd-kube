const { test, expect } = require('@playwright/test');

test.describe('History', () => {
  test('records a sent request and can be cleared', async ({ page, baseURL }) => {
    await page.goto('/');

    await page.locator('#url').fill(`${baseURL}/api/health`);
    await page.getByRole('button', { name: 'Envoyer' }).click();
    await expect(page.locator('#response-status')).toHaveText('200 OK');

    const historyEntry = page.locator('#history-list .history-item').filter({ hasText: '/api/health' }).first();
    await expect(historyEntry).toBeVisible();

    await page.locator('#clear-history').click();
    await expect(page.locator('#history-list')).toHaveText('Aucune requête');
  });
});
