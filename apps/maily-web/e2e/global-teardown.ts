import { FullConfig } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'

async function globalTeardown(config: FullConfig) {
  const supabase = createClient(
    process.env.TEST_SUPABASE_URL!,
    process.env.TEST_SUPABASE_ANON_KEY!
  )

  const redis = new Redis({
    url: process.env.TEST_REDIS_URL!,
    token: process.env.TEST_REDIS_TOKEN!
  })

  try {
    // Get test user
    const { data: { user } } = await supabase.auth.admin.getUserByEmail(
      process.env.TEST_USER_EMAIL!
    )

    if (user) {
      // Clean up test data
      await Promise.all([
        // Delete test projects
        supabase.from('projects')
          .delete()
          .eq('owner_id', user.id),

        // Delete test API keys
        redis.del(`apikey:test-key`),

        // Delete test analytics data
        redis.del('analytics:test-project:delivery'),

        // Delete test user
        supabase.auth.admin.deleteUser(user.id)
      ])
    }

    // Clean up any remaining test data
    const testKeys = await redis.keys('test:*')
    if (testKeys.length > 0) {
      await redis.del(...testKeys)
    }

  } catch (error) {
    console.error('Error in global teardown:', error)
    throw error
  } finally {
    await redis.disconnect()
  }
}

export default globalTeardown 