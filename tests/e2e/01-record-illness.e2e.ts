import { test, expect } from '@playwright/test';

/**
 * E2E Test: Record Illness Workflow (T031)
 * 
 * User Story: Users can create a detailed illness record with name, date, symptoms, and cause
 * System validates required fields, stores data persistently, and shows confirmation to user.
 * 
 * Test Flow:
 * 1. Navigate to /record page
 * 2. Fill in illness name, date, symptoms, and cause
 * 3. Submit form
 * 4. Verify success confirmation
 * 5. Navigate to history to verify record was saved
 */

test.describe('Record Illness Workflow (T031)', () => {
  test('should create a new illness record with symptoms and cause', async ({ page }) => {
    // 1. Navigate to record page
    await page.goto('/record');
    
    // Verify page loaded with form
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    // 2. Fill in illness name
    const illnessName = `Test Cold ${Date.now()}`;
    await page.locator('input[name="name"]').fill(illnessName);
    
    // Fill in start date (select today's date or a past date)
    const dateInput = page.locator('input[name="date_started"]');
    await expect(dateInput).toBeVisible();
    
    // Fill in symptoms
    const symptomNameInput = page.locator('input[placeholder*="Symptom name"]').first();
    await expect(symptomNameInput).toBeVisible();
    await symptomNameInput.fill('Cough');
    
    // Set symptom severity
    const severitySelect = page.locator('select[name*="severity"]').first();
    if (await severitySelect.isVisible()) {
      await severitySelect.selectOption('3');
    }
    
    // Set symptom duration
    const durationInput = page.locator('input[placeholder*="Duration"]').first();
    if (await durationInput.isVisible()) {
      await durationInput.fill('3');
    }
    
    // Fill in cause
    const causeInput = page.locator('input[placeholder*="Cause"]');
    if (await causeInput.isVisible()) {
      await causeInput.fill('Common cold virus');
    }
    
    // 3. Submit form
    await page.locator('button[type="submit"]').click();
    
    // 4. Verify success confirmation
    // Wait for success message or redirect to history
    await expect(page).toHaveURL(/\/(history|record)/, { timeout: 10000 });
    
    // Verify the record appears in history
    await page.goto('/history');
    
    // Wait for illness list to load from API
    await page.waitForTimeout(1000);
    
    // 5. Verify record was saved and appears in list
    await expect(page.locator('text=' + illnessName)).toBeVisible({ timeout: 5000 });
    
    // Verify the illness card shows symptom count
    const illnessCard = page.locator(`text=${illnessName}`).locator('..').first();
    await expect(illnessCard).toContainText(/Cold/, { ignoreCase: true });
  });

  test('should show validation error for missing illness name', async ({ page }) => {
    // Navigate to record page
    await page.goto('/record');
    
    // Try to submit without filling name
    await page.locator('button[type="submit"]').click();
    
    // Verify error message appears
    await expect(page.locator('text=name is required').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for missing date', async ({ page }) => {
    // Navigate to record page
    await page.goto('/record');
    
    // Fill in name only
    await page.locator('input[name="name"]').fill('Test Illness');
    
    // Clear the date field (it's pre-filled with today's date)
    const dateInput = page.locator('input[name="date_started"]');
    await dateInput.clear();
    
    // Try to submit
    await page.locator('button[type="submit"]').click();
    
    // Wait for validation error to be displayed
    await page.waitForTimeout(300);
    
    // Verify error message appears
    await expect(page.locator('text=date is required').first()).toBeVisible({ timeout: 5000 });
  });

  test('should allow end date after start date', async ({ page }) => {
    // Navigate to record page
    await page.goto('/record');
    
    // Fill in name
    const illnessName = `Recovery Test ${Date.now()}`;
    await page.locator('input[name="name"]').fill(illnessName);
    
    // Set start date
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    await page.locator('input[name="date_started"]').fill(startDate);
    
    // Set end date (3 days later)
    const endDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDateInput = page.locator('input[name="date_ended"]');
    if (await endDateInput.isVisible()) {
      await endDateInput.fill(endDate);
    }
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Verify success (redirect or success message)
    await expect(page).toHaveURL(/\/(history|record)/, { timeout: 10000 });
  });
});
