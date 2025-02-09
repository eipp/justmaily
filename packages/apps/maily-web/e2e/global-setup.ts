import { chromium, FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Initialize test data
  const supabase = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_ANON_KEY!
  )

  const redis = new Redis({
    url: process.env.TEST_REDIS_URL!,
    token: process.env.TEST_REDIS_TOKEN!
  })

  try {
    // Create test user if doesn't exist
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(
      process.env.TEST_USER_EMAIL!
    )

    if (!existingUser) {
      const { data: { user } } = await supabase.auth.admin.createUser({
        email: process.env.TEST_USER_EMAIL!,
        password: process.env.TEST_USER_PASSWORD!,
        email_confirm: true
      })

      // Set up test data for the user
      await Promise.all([
        // Create test project
        supabase.from('projects').insert({
          id: 'test-project',
          name: 'Test Project',
          owner_id: user!.id
        }),

        // Create test API key
        redis.set(`apikey:test-key`, JSON.stringify({
          id: 'test-key',
          ownerId: user!.id,
          name: 'Test API Key',
          permissions: ['email:send', 'email:track'],
          createdAt: new Date().toISOString()
        })),

        // Create test analytics data
        redis.zadd('analytics:test-project:delivery', {
          score: Date.now(),
          member: JSON.stringify({
            type: 'email_delivered',
            projectId: 'test-project',
            timestamp: new Date().toISOString()
          })
        })
      ])
    }

    // Sign in and save authentication state
    await page.goto(baseURL + '/auth/signin')
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.context().storageState({ path: storageState as string })

  } catch (error) {
    console.error('Error in global setup:', error)
    throw error
  } finally {
    await browser.close()
    await redis.disconnect()
  }
}

export default globalSetup 