import { test, expect } from '@playwright/test';

test.describe('Persons Page Visual Tests', () => {
  test('persons list page - desktop', async ({ page }) => {
    await page.goto('/persons');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('persons-list-desktop.png');
  });

  test('persons list page - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/persons');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('persons-list-tablet.png');
  });

  test('persons list page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/persons');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('persons-list-mobile.png');
  });
});
