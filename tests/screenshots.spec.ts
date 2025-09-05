import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages: { route: string; name: string; }[] = [
  { route: '/', name: 'home' },
  { route: '/diagnostics', name: 'diagnostics' },
  { route: '/boost', name: 'boost' },
  { route: '/settings', name: 'settings' },
];

const screenshotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

for (const p of pages) {
  test(`capture ${p.name} page @screenshot`, async ({ page }) => {
    await page.goto(p.route);
    await page.waitForTimeout(500); // allow UI to stabilize
    const filePath = path.join(screenshotsDir, `${p.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    expect(fs.existsSync(filePath)).toBe(true);
  });
}
