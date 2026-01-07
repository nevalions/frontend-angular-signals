import { test, expect } from '@playwright/test';

test.describe('Sport Detail Component Refactor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/sports/1');
    await page.waitForTimeout(500);
  });

  test('should display sport detail with dotted menu', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /FOOTBALL/i })).toBeVisible();
    const menuButtons = await page.getByRole('button').all();
    const dottedMenuButton = menuButtons[1];
    await expect(dottedMenuButton).toBeVisible();
  });

  test('should open dotted menu on click', async ({ page }) => {
    const menuButtons = await page.getByRole('button').all();
    const dottedMenuButton = menuButtons[1];
    await dottedMenuButton.click();
    await page.waitForTimeout(300);
    
    const menuContainer = page.locator('.sport-detail__menu-dropdown');
    await expect(menuContainer).toBeVisible();
  });

  test('should have Edit and Delete buttons in menu', async ({ page }) => {
    const menuButtons = await page.getByRole('button').all();
    const dottedMenuButton = menuButtons[1];
    await dottedMenuButton.click();
    await page.waitForTimeout(300);
    
    const editButton = page.getByRole('button', { name: 'Edit' });
    const deleteButton = page.getByRole('button', { name: 'Delete' });
    
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
  });

  test('should close menu when clicking menu button again', async ({ page }) => {
    const menuButtons = await page.getByRole('button').all();
    const dottedMenuButton = menuButtons[1];
    await dottedMenuButton.click();
    await page.waitForTimeout(300);
    
    const menuContainer = page.locator('.sport-detail__menu-dropdown');
    await expect(menuContainer).toBeVisible();
    
    await dottedMenuButton.click();
    await page.waitForTimeout(300);
    
    await expect(menuContainer).not.toBeVisible();
  });

  test('should show search input', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'Search tournaments' });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search by name or description...');
  });

  test('should filter tournaments by search', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'Search tournaments' });
    await searchInput.fill('кубок');
    await page.waitForTimeout(500);
    
    const cards = page.locator('.sport-detail__tournament-card');
    const count = await cards.count();
    expect(count).toBeLessThan(6);
  });

  test('should clear search with button', async ({ page }) => {
    const searchInput = page.getByRole('textbox', { name: 'Search tournaments' });
    await searchInput.fill('test');
    
    const clearButtons = await page.getByRole('button', { name: 'Clear' }).all();
    await clearButtons[1].click();
    
    await expect(searchInput).toHaveValue('');
  });

  test('should display tournaments as cards', async ({ page }) => {
    const cards = page.locator('.sport-detail__tournament-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have tournament icons', async ({ page }) => {
    const cards = page.locator('.sport-detail__tournament-card');
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    
    const icon = firstCard.locator('.sport-detail__tournament-icon');
    await expect(icon).toBeVisible();
  });

  test('should display pagination when there are tournaments', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(500);
    
    const paginationWrapper = page.locator('.sport-detail__pagination-wrapper');
    const isVisible = await paginationWrapper.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should have items per page options', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(500);
    
    const itemsOptions = page.locator('.sport-detail__items-option');
    const count = await itemsOptions.count();
    expect(count).toBe(3);
  });

  test('should navigate to tournament detail on card click', async ({ page }) => {
    const cards = page.locator('.sport-detail__tournament-card');
    const firstCard = cards.first();
    await firstCard.click();
    
    await page.waitForURL(/\/sports\/1\/seasons\/\d+\/tournaments\/\d+/);
  });
});
