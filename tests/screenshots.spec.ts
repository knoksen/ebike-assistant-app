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
  { route: '/rides', name: 'rides' },
  { route: '/maintenance', name: 'maintenance' },
  { route: '/parts', name: 'parts' },
];

const screenshotsDir = path.resolve(__dirname, '..', 'docs', 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

for (const p of pages) {
  test(`capture ${p.name} page @screenshot`, async ({ page }, testInfo) => {
    await page.goto(p.route);
    await page.waitForTimeout(600); // allow UI to stabilize
    const variant = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
    const filePath = path.join(screenshotsDir, `${p.name}-${variant}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    expect(fs.existsSync(filePath)).toBe(true);
  });
}
