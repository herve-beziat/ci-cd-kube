const { test, expect } = require('@playwright/test');

test.describe('Send a request', () => {
  test('sends a GET request to /api/health and displays the response', async ({ page, baseURL }) => {
    await page.goto('/');

    await page.locator('#method').selectOption('GET');
    await page.locator('#url').fill(`${baseURL}/api/health`);
    await page.getByRole('button', { name: 'Envoyer' }).click();

    await expect(page.locator('#response-status')).toHaveText('200 OK');
    await expect(page.locator('#response-body')).toContainText('"status": "ok"');

    // Cleanup: don't leave this test's entry in the shared history
    await page.locator('#clear-history').click();
  });
});
