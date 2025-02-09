import { test, expect } from '@playwright/test'

test.describe('API Key Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in and navigate to API keys page
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.goto('/settings/api-keys')
  })

  test('should manage API keys lifecycle', async ({ page }) => {
    // 1. Create new API key
    await page.click('text=Create API Key')
    await page.fill('[name="name"]', 'Test API Key')
    await page.selectOption('[name="permissions"]', ['email:send', 'email:track'])
    await page.fill('[name="expirationDays"]', '30')
    await page.click('button[type="submit"]')

    // 2. Verify key is created and shown
    const keyModal = page.locator('[data-testid="api-key-modal"]')
    await expect(keyModal).toBeVisible()
    const apiKey = await keyModal.locator('[data-testid="api-key-value"]').textContent()
    expect(apiKey).toMatch(/^mk_/)
    await keyModal.locator('button:text("Close")').click()

    // 3. Verify key appears in list
    const keyRow = page.locator('tr', { hasText: 'Test API Key' })
    await expect(keyRow).toBeVisible()
    await expect(keyRow.locator('td:nth-child(2)')).toHaveText('Test API Key')
    await expect(keyRow.locator('td:nth-child(3)')).toHaveText('email:send, email:track')
    await expect(keyRow.locator('td:nth-child(4)')).toContainText('30 days')

    // 4. Test key in API request
    const response = await page.evaluate(async (key) => {
      const res = await fetch('/api/test-auth', {
        headers: { 'Authorization': `Bearer ${key}` }
      })
      return { status: res.status, ok: res.ok }
    }, apiKey)
    expect(response.ok).toBe(true)

    // 5. Revoke key
    await keyRow.locator('button[aria-label="Revoke API key"]').click()
    await page.locator('button:text("Confirm")').click()
    await expect(keyRow.locator('td:last-child')).toHaveText('Revoked')

    // 6. Verify revoked key doesn't work
    const revokedResponse = await page.evaluate(async (key) => {
      const res = await fetch('/api/test-auth', {
        headers: { 'Authorization': `Bearer ${key}` }
      })
      return { status: res.status }
    }, apiKey)
    expect(revokedResponse.status).toBe(401)
  })

  test('should enforce API key validation rules', async ({ page }) => {
    // 1. Test required fields
    await page.click('text=Create API Key')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Select at least one permission')).toBeVisible()

    // 2. Test name validation
    await page.fill('[name="name"]', 'a')
    await expect(page.locator('text=Name must be at least 3 characters')).toBeVisible()

    // 3. Test permissions validation
    await page.fill('[name="name"]', 'Test Key')
    await page.selectOption('[name="permissions"]', [])
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Select at least one permission')).toBeVisible()

    // 4. Test expiration validation
    await page.selectOption('[name="permissions"]', ['email:send'])
    await page.fill('[name="expirationDays"]', '0')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Expiration must be between 1 and 365 days')).toBeVisible()
  })

  test('should handle pagination and filtering', async ({ page }) => {
    // Create multiple API keys
    for (let i = 1; i <= 12; i++) {
      await page.click('text=Create API Key')
      await page.fill('[name="name"]', `Test Key ${i}`)
      await page.selectOption('[name="permissions"]', ['email:send'])
      await page.click('button[type="submit"]')
      await page.locator('[data-testid="api-key-modal"] button:text("Close")').click()
    }

    // Test pagination
    await expect(page.locator('tr')).toHaveCount(11) // 10 rows + header
    await page.click('button:text("Next")')
    await expect(page.locator('tr')).toHaveCount(3) // 2 rows + header

    // Test filtering
    await page.fill('[placeholder="Search API keys"]', 'Test Key 1')
    await expect(page.locator('tr')).toHaveCount(4) // 3 matches (1, 10, 11) + header

    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'active')
    await expect(page.locator('tr')).toHaveCount(4) // 3 active keys + header
  })

  test('should handle concurrent operations', async ({ page }) => {
    // 1. Create multiple keys concurrently
    const createPromises = []
    for (let i = 1; i <= 3; i++) {
      createPromises.push(page.evaluate(async (name) => {
        const res = await fetch('/api/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            permissions: ['email:send'],
            expirationDays: 30
          })
        })
        return res.ok
      }, `Concurrent Key ${i}`))
    }
    const results = await Promise.all(createPromises)
    expect(results.every(r => r === true)).toBe(true)

    // 2. Refresh page and verify all keys exist
    await page.reload()
    for (let i = 1; i <= 3; i++) {
      await expect(page.locator(`text=Concurrent Key ${i}`)).toBeVisible()
    }

    // 3. Revoke multiple keys concurrently
    const rows = await page.locator('tr:has-text("Concurrent Key")').all()
    const revokePromises = rows.map(row => 
      row.locator('button[aria-label="Revoke API key"]').click()
        .then(() => page.locator('button:text("Confirm")').click())
    )
    await Promise.all(revokePromises)

    // 4. Verify all keys are revoked
    await page.reload()
    const revokedRows = await page.locator('tr:has-text("Concurrent Key")').all()
    for (const row of revokedRows) {
      await expect(row.locator('td:last-child')).toHaveText('Revoked')
    }
  })
}) 