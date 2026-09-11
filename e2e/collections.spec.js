const { test, expect } = require('@playwright/test');

const COLLECTION_NAME = 'e2e-test-collection';

test.describe('Collections', () => {
  test('creates and deletes a collection', async ({ page }) => {
    await page.goto('/');

    await page.locator('#new-collection').click();
    await page.locator('#modal-collection-name').fill(COLLECTION_NAME);
    await page.locator('#new-collection-confirm').click();

    const collectionEntry = page.locator('.collection-group').filter({ hasText: COLLECTION_NAME });
    await expect(collectionEntry).toBeVisible();

    await collectionEntry.locator('.collection-delete').click();
    await page.locator('#delete-collection-confirm').click();

    await expect(page.locator('.collection-group').filter({ hasText: COLLECTION_NAME })).toHaveCount(0);
  });
});
