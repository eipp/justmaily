import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('should complete sign up and sign in flow with MFA', async ({ page }) => {
    // 1. Navigate to sign up
    await page.click('text=Create an account')
    await expect(page).toHaveURL('/auth/signup')

    // 2. Fill sign up form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    // 3. Verify email confirmation page
    await expect(page).toHaveURL('/auth/verify-email')
    await expect(page.locator('text=Check your email')).toBeVisible()

    // 4. Sign in
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    // 5. Set up MFA
    await expect(page).toHaveURL('/settings/security/mfa')
    await page.click('text=Enable Two-Factor Authentication')
    
    // 6. Verify QR code and secret are shown
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible()
    await expect(page.locator('[data-testid="mfa-secret"]')).toBeVisible()

    // 7. Enter verification code
    await page.fill('[name="code"]', '123456')
    await page.click('text=Verify')

    // 8. Verify MFA is enabled
    await expect(page.locator('text=Two-factor authentication enabled')).toBeVisible()

    // 9. Sign out
    await page.click('[data-testid="user-menu"]')
    await page.click('text=Sign out')
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should handle password reset flow', async ({ page }) => {
    // 1. Navigate to forgot password
    await page.click('text=Forgot your password?')
    await expect(page).toHaveURL('/auth/reset-password')

    // 2. Request password reset
    await page.fill('[name="email"]', 'test@example.com')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Check your email')).toBeVisible()

    // 3. Reset password (simulated email link)
    await page.goto('/auth/reset-password?token=mock-token')
    await page.fill('[name="password"]', 'NewPassword123!')
    await page.fill('[name="confirmPassword"]', 'NewPassword123!')
    await page.click('button[type="submit"]')

    // 4. Verify redirect to sign in
    await expect(page).toHaveURL('/auth/signin')
    await expect(page.locator('text=Password updated successfully')).toBeVisible()

    // 5. Sign in with new password
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'NewPassword123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should handle authentication errors', async ({ page }) => {
    // 1. Test invalid credentials
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid email or password')).toBeVisible()

    // 2. Test invalid MFA code
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await page.fill('[name="code"]', '000000')
    await page.click('text=Verify')
    await expect(page.locator('text=Invalid verification code')).toBeVisible()

    // 3. Test password requirements
    await page.click('text=Create an account')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'weak')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
  })

  test('should enforce rate limiting', async ({ page }) => {
    // Attempt multiple rapid sign-ins
    for (let i = 0; i < 5; i++) {
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'wrong')
      await page.click('button[type="submit"]')
    }

    await expect(page.locator('text=Too many attempts')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })
}) 