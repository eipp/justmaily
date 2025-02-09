import { test, expect } from '@playwright/test'

test.describe('Analytics and Search', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in and navigate to analytics page
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.goto('/analytics')
  })

  test('should display delivery metrics dashboard', async ({ page }) => {
    // 1. Verify dashboard components
    await expect(page.locator('[data-testid="metrics-overview"]')).toBeVisible()
    await expect(page.locator('[data-testid="delivery-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="engagement-chart"]')).toBeVisible()

    // 2. Test date range filter
    await page.click('[data-testid="date-range-picker"]')
    await page.click('text=Last 7 days')
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="metrics-overview"]')).toBeVisible()

    // 3. Test metrics breakdown
    await page.click('text=Breakdown by Provider')
    await expect(page.locator('table')).toBeVisible()
    const rows = await page.locator('tr').count()
    expect(rows).toBeGreaterThan(1)

    // 4. Test metric details
    await page.click('[data-testid="metric-card-delivered"]')
    await expect(page.locator('[data-testid="metric-details-modal"]')).toBeVisible()
    await expect(page.locator('text=Delivery Rate')).toBeVisible()
    await expect(page.locator('[data-testid="trend-indicator"]')).toBeVisible()
  })

  test('should perform time series analysis', async ({ page }) => {
    // 1. Navigate to time series view
    await page.click('text=Time Series')

    // 2. Configure analysis
    await page.selectOption('[data-testid="metric-select"]', 'opens')
    await page.selectOption('[data-testid="interval-select"]', 'hour')
    await page.click('text=Apply')

    // 3. Verify chart
    await expect(page.locator('[data-testid="time-series-chart"]')).toBeVisible()
    const dataPoints = await page.locator('[data-testid="chart-point"]').count()
    expect(dataPoints).toBeGreaterThan(0)

    // 4. Test comparison
    await page.click('text=Compare')
    await page.selectOption('[data-testid="compare-metric-select"]', 'clicks')
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible()

    // 5. Export data
    await page.click('text=Export')
    const download = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Download CSV')
    ])
    expect(download[0].suggestedFilename()).toContain('time-series-data')
  })

  test('should analyze funnel performance', async ({ page }) => {
    // 1. Navigate to funnel analysis
    await page.click('text=Funnel Analysis')

    // 2. Configure funnel steps
    await page.click('text=Add Step')
    await page.selectOption('[data-testid="step-1-event"]', 'email_delivered')
    await page.click('text=Add Step')
    await page.selectOption('[data-testid="step-2-event"]', 'email_opened')
    await page.click('text=Add Step')
    await page.selectOption('[data-testid="step-3-event"]', 'link_clicked')

    // 3. Set time window
    await page.selectOption('[data-testid="time-window"]', '7d')
    await page.click('text=Generate Funnel')

    // 4. Verify funnel visualization
    await expect(page.locator('[data-testid="funnel-viz"]')).toBeVisible()
    const steps = await page.locator('[data-testid="funnel-step"]').count()
    expect(steps).toBe(3)

    // 5. Check conversion rates
    await expect(page.locator('[data-testid="conversion-rate"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="drop-off-rate"]')).toHaveCount(2)
  })

  test('should perform cohort analysis', async ({ page }) => {
    // 1. Navigate to cohort analysis
    await page.click('text=Cohort Analysis')

    // 2. Configure cohort
    await page.selectOption('[data-testid="cohort-size"]', 'week')
    await page.selectOption('[data-testid="retention-event"]', 'email_opened')
    await page.click('text=Generate Cohorts')

    // 3. Verify cohort table
    await expect(page.locator('[data-testid="cohort-table"]')).toBeVisible()
    const cohortRows = await page.locator('tr[data-testid="cohort-row"]').count()
    expect(cohortRows).toBeGreaterThan(0)

    // 4. Test cohort filters
    await page.click('text=Filter')
    await page.selectOption('[data-testid="min-size"]', '100')
    await page.click('text=Apply')
    const filteredRows = await page.locator('tr[data-testid="cohort-row"]').count()
    expect(filteredRows).toBeLessThanOrEqual(cohortRows)
  })

  test('should handle search functionality', async ({ page }) => {
    // 1. Navigate to search
    await page.click('text=Search')

    // 2. Perform basic search
    await page.fill('[data-testid="search-input"]', 'test campaign')
    await page.press('[data-testid="search-input"]', 'Enter')
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()

    // 3. Test filters
    await page.click('text=Filters')
    await page.selectOption('[data-testid="type-filter"]', 'campaign')
    await page.click('text=Apply Filters')
    await expect(page.locator('[data-testid="result-card"]')).toHaveCount(3)

    // 4. Test sorting
    await page.selectOption('[data-testid="sort-select"]', 'date')
    const firstDate = await page.locator('[data-testid="result-date"]:first-child').textContent()
    const lastDate = await page.locator('[data-testid="result-date"]:last-child').textContent()
    expect(new Date(firstDate!)).toBeGreaterThan(new Date(lastDate!))

    // 5. Test advanced search
    await page.click('text=Advanced Search')
    await page.fill('[data-testid="subject-input"]', 'welcome')
    await page.selectOption('[data-testid="status-select"]', 'sent')
    await page.click('text=Search')
    await expect(page.locator('[data-testid="result-card"]')).toHaveCount(1)
  })

  test('should handle error states and loading', async ({ page }) => {
    // 1. Test loading states
    await page.route('**/api/analytics/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    await page.reload()
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible()

    // 2. Test error handling
    await page.route('**/api/analytics/metrics', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      })
    )
    await page.click('[data-testid="refresh-button"]')
    await expect(page.locator('text=Failed to load metrics')).toBeVisible()
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()

    // 3. Test empty states
    await page.route('**/api/analytics/funnel', route =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ steps: [] })
      })
    )
    await page.click('text=Funnel Analysis')
    await expect(page.locator('text=No funnel data available')).toBeVisible()
  })
}) 