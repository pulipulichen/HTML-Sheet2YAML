import { test, expect } from '@playwright/test';

test('switches UI language between English and Traditional Chinese', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const languageSelect = page.locator('#language-select');
  await languageSelect.waitFor();

  // Switch to Traditional Chinese
  await languageSelect.selectOption('zh-TW');
  await expect(page.locator('[data-i18n="header.title"]')).toHaveText('試算表轉 YAML');
  await expect(page.locator('[data-i18n="step1.title"]')).toHaveText('第一步：上傳檔案或輸入連結');
  await expect(page.locator('#fetch-url-btn')).toHaveText('從網址載入');
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('sheet2yaml_language')))
    .toBe('zh-TW');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');

  // Switch back to English
  await languageSelect.selectOption('en');
  await expect(page.locator('[data-i18n="header.title"]')).toHaveText('Spreadsheet to YAML');
  await expect(page.locator('[data-i18n="step1.title"]')).toHaveText('Step 1: Upload a file or enter a URL');
  await expect(page.locator('#fetch-url-btn')).toHaveText('Load from URL');
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('sheet2yaml_language')))
    .toBe('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});

test('persists selected language across reload', async ({ page }) => {
  await page.goto('http://localhost:8080');

  await page.locator('#language-select').selectOption('zh-TW');
  await expect(page.locator('[data-i18n="header.title"]')).toHaveText('試算表轉 YAML');

  await page.reload();
  await expect(page.locator('#language-select')).toHaveValue('zh-TW');
  await expect(page.locator('[data-i18n="header.title"]')).toHaveText('試算表轉 YAML');
});
