import { test, expect } from '@playwright/test';

test('exposes PWA manifest and theme metadata', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute('href', 'manifest.json');

  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f8fafc');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', 'assets/favicon/favicon.png');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', 'assets/favicon/favicon.png');

  const manifestResponse = await page.request.get('http://localhost:8080/manifest.json');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe('Spreadsheet to YAML Tool');
  expect(manifest.short_name).toBe('Sheet2YAML');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons?.length).toBeGreaterThan(0);

  const iconResponse = await page.request.get('http://localhost:8080/assets/favicon/favicon.png');
  expect(iconResponse.ok()).toBeTruthy();

  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});
