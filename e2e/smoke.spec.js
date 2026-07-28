import { test, expect } from '@playwright/test';

test('loads the main page without console errors', async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('http://localhost:8080');

  // 2. Setup console error tracking
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 3. Perform actions / wait for key UI
  await expect(page.locator('h1')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('#drop-zone')).toBeVisible();
  await expect(page.locator('#url-input')).toBeVisible();
  await expect(page.locator('#fetch-url-btn')).toBeVisible();
  await expect(page.locator('#language-select')).toBeVisible();

  // 4. Assertions
  await expect(page.locator('#results-section')).toBeHidden();

  // 5. Final checks
  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});
