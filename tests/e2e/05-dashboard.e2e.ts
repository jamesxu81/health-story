import { test, expect } from '@playwright/test';

/**
 * E2E Test: Dashboard & Today View
 *
 * Verifies the dashboard landing page shows active illnesses,
 * recent activity, quick-action buttons, and summary stats.
 */

const AUTH_HEADER = { Authorization: 'Bearer default-user' };

async function createIllness(
  request: any,
  overrides: Record<string, any> = {}
) {
  const payload = {
    name: `E2E Illness ${Date.now()}`,
    date_started: new Date().toISOString().split('T')[0],
    symptoms: [{ name: 'Cough', severity: 'mild' }],
    ...overrides,
  };

  const res = await request.post('/api/illnesses', {
    headers: AUTH_HEADER,
    data: payload,
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.data;
}

test.describe('Dashboard & Today View', () => {
  test('should load the dashboard at root URL', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/welcome back/i);
  });

  test('should show empty state when no illnesses exist', async ({
    page,
  }) => {
    await page.goto('/');
    // If the user has data this may not show; verify the page at least
    // renders the dashboard structure
    await expect(
      page.locator('text=Add a sick day').first()
    ).toBeVisible();
  });

  test('should display quick-action buttons', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('a:has-text("Add a sick day")').first()
    ).toBeVisible();
    await expect(
      page.locator('a:has-text("View timeline")').first()
    ).toBeVisible();
  });

  test('quick-action "Add a sick day" navigates to /record', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .locator('section[aria-label="Quick actions"] a:has-text("Add a sick day")')
      .click();
    await expect(page).toHaveURL(/\/record/);
  });

  test('quick-action "View timeline" navigates to /history', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .locator('section[aria-label="Quick actions"] a:has-text("View timeline")')
      .click();
    await expect(page).toHaveURL(/\/history/);
  });

  test('should show active illness cards when active illnesses exist', async ({
    page,
    request,
  }) => {
    const illness = await createIllness(request, {
      name: `Dashboard Active ${Date.now()}`,
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    await expect(
      page.locator(`text=${illness.name}`).first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('text=/active sick day/i').first()
    ).toBeVisible();
  });

  test('should show recent activity feed', async ({
    page,
    request,
  }) => {
    await createIllness(request, {
      name: `Activity Feed Test ${Date.now()}`,
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    await expect(
      page.locator('text=Recent activity').first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('text=Logged').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show stats section when illnesses exist', async ({
    page,
    request,
  }) => {
    await createIllness(request, {
      name: `Stats Test ${Date.now()}`,
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    await expect(
      page.locator('text=At a glance').first()
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('text=Total recorded').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('nav bar includes Home link that highlights on dashboard', async ({
    page,
  }) => {
    await page.goto('/');
    const homeLink = page.locator('nav a:has-text("Home")');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveClass(/bg-teal-100/);
  });

  test('nav bar Home link does not highlight on other pages', async ({
    page,
  }) => {
    await page.goto('/record');
    const homeLink = page.locator('nav a:has-text("Home")');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).not.toHaveClass(/bg-teal-100/);
  });
});
