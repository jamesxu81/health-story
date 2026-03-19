import { test, expect } from '@playwright/test';

const AUTH_HEADER = { Authorization: 'Bearer default-user' };

test.describe('Family Members', () => {
  test('should navigate to family page from nav', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a:has-text("Family")').click();
    await expect(page).toHaveURL(/\/family/);
    await expect(page.locator('h1')).toContainText(/family members/i);
  });

  test('should show empty state initially', async ({ page }) => {
    await page.goto('/family');
    await expect(
      page.locator('text=/no family members/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('should add a family member', async ({ page }) => {
    await page.goto('/family');

    await page.locator('button:has-text("Add a family member")').click();
    await page.locator('#member-name').fill('Emma');

    // Select relationship
    await page.locator('#member-relationship').selectOption('child');

    await page.locator('button[type="submit"]:has-text("Add member")').click();

    await expect(
      page.locator('text=Emma').first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('text=child').first()
    ).toBeVisible();
  });

  test('should create a family member via API and see it on the family page', async ({
    page,
    request,
  }) => {
    const memberName = `API Member ${Date.now()}`;
    const res = await request.post('/api/family-members', {
      headers: AUTH_HEADER,
      data: { name: memberName, color: '#ea580c', relationship: 'spouse' },
    });
    expect(res.ok()).toBeTruthy();

    await page.goto('/family');
    await expect(
      page.locator(`text=${memberName}`).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show member picker on illness form when members exist', async ({
    page,
    request,
  }) => {
    // Ensure at least one family member exists
    await request.post('/api/family-members', {
      headers: AUTH_HEADER,
      data: { name: 'Picker Test Kid', color: '#7c3aed', relationship: 'child' },
    });

    await page.goto('/record');
    await expect(
      page.locator('text=/who is this for/i').first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('button:has-text("Everyone")').first()
    ).toBeVisible();
  });

  test('should delete a family member', async ({ page, request }) => {
    const name = `Delete Me ${Date.now()}`;
    await request.post('/api/family-members', {
      headers: AUTH_HEADER,
      data: { name, color: '#64748b' },
    });

    await page.goto('/family');
    await expect(page.locator(`text=${name}`).first()).toBeVisible({
      timeout: 5000,
    });

    // Set up dialog handler before clicking
    page.on('dialog', (dialog) => dialog.accept());

    const memberRow = page.locator(`text=${name}`).locator('..').locator('..');
    await memberRow.locator('button:has-text("Remove")').click();

    await expect(page.locator(`text=${name}`)).toHaveCount(0, {
      timeout: 5000,
    });
  });
});
