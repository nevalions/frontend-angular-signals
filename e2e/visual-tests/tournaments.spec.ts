import { test, expect } from '@playwright/test';

test.describe('Tournaments Page Visual Tests', () => {
  test('tournaments list page - desktop', async ({ page }) => {
    await page.goto('/sports/1/seasons/2024/tournaments');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tournaments-list-desktop.png');
  });

  test('tournaments list page - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/sports/1/seasons/2024/tournaments');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tournaments-list-mobile.png');
  });

  test('tournaments create page - desktop', async ({ page }) => {
    await page.goto('/sports/1/seasons/2024/tournaments/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tournaments-create-desktop.png');
  });

  test('tournaments create page with validation errors', async ({ page }) => {
    await page.goto('/sports/1/seasons/2024/tournaments/new');
    await page.waitForLoadState('networkidle');

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('tournaments-create-validation.png');
    }
  });

  test('tournaments detail page - desktop', async ({ page }) => {
    await page.goto('/sports/1/seasons/2024/tournaments/1');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tournaments-detail-desktop.png');
  });
});
