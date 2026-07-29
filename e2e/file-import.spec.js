import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleCsv = path.join(__dirname, 'fixtures', 'sample.csv');

test('imports a CSV file and shows YAML preview', async ({ page }) => {
  await page.goto('http://localhost:8080');

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.locator('#file-input').setInputFiles(sampleCsv);

  const resultsSection = page.locator('#results-section');
  await expect(resultsSection).toBeVisible({ timeout: 60000 });

  // textarea content is in .value, not textContent
  const yamlPreview = page.locator('#yaml-preview');
  await expect(yamlPreview).toHaveValue(/Alice/);
  await expect(yamlPreview).toHaveValue(/Taipei/);
  await expect(yamlPreview).toHaveValue(/name:/);

  await expect(page.locator('#copy-btn')).toBeVisible();
  await expect(page.locator('#download-btn')).toBeVisible();

  // Single-sheet CSV should not show download-all
  await expect(page.locator('#download-all-btn')).toBeHidden();

  await page.waitForLoadState('networkidle');
  expect(consoleErrors).toHaveLength(0);
});

test('shows an error when fetching with an empty URL', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Force English so the assertion is stable
  await page.locator('#language-select').selectOption('en');
  await page.locator('#fetch-url-btn').click();

  const messageBox = page.locator('#message-box');
  await expect(messageBox).toBeVisible();
  await expect(messageBox).toHaveText('Please enter a valid URL');
});

test('fills the demo Google Sheet URL when clicking the demo button', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Avoid depending on external Google network during E2E
  await page.route('**/spreadsheets/**', async route => {
    await route.abort();
  });

  await page.locator('#load-demo-btn').click();

  await expect(page.locator('#url-input')).toHaveValue(
    'https://docs.google.com/spreadsheets/d/1dOFyNqpjL5K7k-26K-C5wfArAruiYoXcyuXYCkTpbbc/edit?usp=sharing'
  );
});
