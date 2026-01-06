import { test, expect } from '@playwright/test';

test.describe('Navbar Component Tests', () => {
  test('main header links to /home', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const navbarTitle = page.locator('.navbar-title');
    await expect(navbarTitle).toBeVisible();

    const navbarTitleLink = page.locator('.navbar-title-link');
    await navbarTitleLink.click();
    await expect(page).toHaveURL('/home');
  });

  test('menu items are uppercase', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const menuItems = page.locator('.navbar-nav a');
    const count = await menuItems.count();

    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      const textTransform = await item.evaluate(el => window.getComputedStyle(el).textTransform);
      expect(textTransform).toBe('uppercase');
    }
  });

  test('dropdown text is uppercase', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const dropdownToggle = page.locator('.dropdown-toggle');
    const textTransform = await dropdownToggle.evaluate(el => window.getComputedStyle(el).textTransform);
    expect(textTransform).toBe('uppercase');
  });

  test('main header title is uppercase', async ({ page }) => {
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const navbarTitle = page.locator('.navbar-title');
    const textTransform = await navbarTitle.evaluate(el => window.getComputedStyle(el).textTransform);
    expect(textTransform).toBe('uppercase');
  });

  test('mobile burger menu appears on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const hamburger = page.locator('.hamburger-menu');
    await expect(hamburger).toBeVisible();

    await hamburger.click();

    const mobileNav = page.locator('.navbar-nav.mobile-open');
    await expect(mobileNav).toBeVisible();

    await hamburger.click();
    await expect(mobileNav).not.toBeVisible();
  });

  test('mobile burger menu is positioned on right side', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/home');
    await page.waitForLoadState('networkidle');

    const hamburger = page.locator('.hamburger-menu');
    const box = await hamburger.boundingBox();

    if (box) {
      expect(box.x).toBeGreaterThan(200);
    }
  });

  test('root route redirects to /home', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL('/home');
  });
});
