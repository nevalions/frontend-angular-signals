import { test, expect } from '@playwright/test';

test.describe('Sports Page Visual Tests', () => {
  test('sports list page - desktop', async ({ page }) => {
    await page.goto('/sports');
    await expect(page).toHaveScreenshot('sports-list-desktop.png');
  });

  test('sports list page - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/sports');
    await expect(page).toHaveScreenshot('sports-list-tablet.png');
  });

  test('sports list page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sports');
    await expect(page).toHaveScreenshot('sports-list-mobile.png');
  });

  test('sports detail page - desktop', async ({ page }) => {
    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    const firstSportLink = page.locator('a').first();
    const sportCount = await page.locator('a').count();

    if (sportCount > 0) {
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('sports-detail-desktop.png');
    }
  });

  test('sports detail page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sports');
    await page.waitForLoadState('networkidle');

    const firstSportLink = page.locator('a').first();
    const sportCount = await page.locator('a').count();

    if (sportCount > 0) {
      await firstSportLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('sports-detail-mobile.png');
    }
  });
});
