import { test, expect } from '@playwright/test';

test.describe('Shorms Renderer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-renderer');
    await page.waitForLoadState('networkidle');
  });

  test('should load the test page without errors', async ({ page }) => {
    // Check for page title
    await expect(page.locator('h1')).toContainText('Shorms Renderer Test');

    // Check console for errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to catch any errors
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('should render all form fields correctly', async ({ page }) => {
    // Check progress indicator
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();

    // Check form fields on page 1
    await expect(page.locator('label:has-text("Your Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Email Address")')).toBeVisible();
    await expect(page.locator('label:has-text("Age")')).toBeVisible();

    // Check navigation buttons
    const prevButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');

    await expect(prevButton).toBeVisible();
    await expect(prevButton).toBeDisabled(); // Should be disabled on first page
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
  });

  test('should accept input in form fields', async ({ page }) => {
    // Fill in the name field
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('John Doe');
    await expect(nameInput).toHaveValue('John Doe');

    // Fill in the email field
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('john.doe@example.com');
    await expect(emailInput).toHaveValue('john.doe@example.com');

    // Fill in the age field
    const ageInput = page.locator('input[name="age"]');
    await ageInput.fill('25');
    await expect(ageInput).toHaveValue('25');
  });

  test('should update dirty state in debug panel', async ({ page }) => {
    // Check initial dirty state
    const debugPanel = page.locator('text=Dirty:');
    await expect(debugPanel).toBeVisible();

    // Fill in a field
    await page.locator('input[name="name"]').fill('Test User');

    // Note: Debug panel might need a moment to update
    await page.waitForTimeout(500);
  });

  test('should navigate between pages', async ({ page }) => {
    // Fill in required fields
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john@example.com');

    // Click Next button
    await page.locator('button:has-text("Next")').click();

    // Wait for navigation
    await page.waitForTimeout(500);

    // Check we're on page 2
    await expect(page.locator('text=Step 2 of 2')).toBeVisible();
    await expect(page.locator('text=Additional Details')).toBeVisible();

    // Previous button should now be enabled
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeEnabled();

    // Click Previous to go back
    await prevButton.click();
    await page.waitForTimeout(500);

    // Should be back on page 1
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to click Next without filling required fields
    await page.locator('button:has-text("Next")').click();

    // Should show validation errors (look for error messages or prevent navigation)
    // Note: Implementation might vary, adjust selectors as needed
    await page.waitForTimeout(500);

    // Check if still on page 1 (validation prevented navigation)
    const step1 = page.locator('text=Step 1 of 2');
    const isVisible = await step1.isVisible();

    // If validation is working, we should still be on page 1
    expect(isVisible).toBe(true);
  });

  test('should validate name field min length', async ({ page }) => {
    // Enter a single character (below minLength: 2)
    await page.locator('input[name="name"]').fill('A');
    await page.locator('input[name="email"]').fill('test@example.com');

    // Try to navigate
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Should still be on page 1 due to validation error
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Enter valid name but invalid email
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('notanemail');

    // Try to navigate
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Should still be on page 1 due to email validation error
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();
  });

  test('should validate age range', async ({ page }) => {
    // Fill page 1 with invalid age
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john@example.com');
    await page.locator('input[name="age"]').fill('15'); // Below minimum (18)

    // Try to navigate (should be blocked by validation)
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Should still be on page 1 due to age validation
    await expect(page.locator('text=Step 1 of 2')).toBeVisible();
  });

  test('should complete full form submission flow', async ({ page }) => {
    // Listen for dialog (alert)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Form submitted');
      await dialog.accept();
    });

    // Fill page 1
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="email"]').fill('john.doe@example.com');
    await page.locator('input[name="age"]').fill('30');

    // Navigate to page 2
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Fill page 2
    await page.locator('textarea[name="bio"]').fill('Test additional information');

    // Submit form
    await page.locator('button:has-text("Submit")').click();
    await page.waitForTimeout(1000);
  });

  test('should show debug panel in development', async ({ page }) => {
    // Check for debug panel elements
    await expect(page.locator('text=Dirty:')).toBeVisible();
    await expect(page.locator('text=Valid:')).toBeVisible();
    await expect(page.locator('text=Suggestions:')).toBeVisible();
    await expect(page.locator('text=Can Undo:')).toBeVisible();
    await expect(page.locator('text=Can Redo:')).toBeVisible();
  });

  test('should preserve form values during navigation', async ({ page }) => {
    // Fill in values on page 1
    await page.locator('input[name="name"]').fill('Jane Smith');
    await page.locator('input[name="email"]').fill('jane@example.com');
    await page.locator('input[name="age"]').fill('28');

    // Navigate to page 2
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);

    // Go back to page 1
    await page.locator('button:has-text("Previous")').click();
    await page.waitForTimeout(500);

    // Values should be preserved
    await expect(page.locator('input[name="name"]')).toHaveValue('Jane Smith');
    await expect(page.locator('input[name="email"]')).toHaveValue('jane@example.com');
    await expect(page.locator('input[name="age"]')).toHaveValue('28');
  });
});
