import { SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
  serviceKey: string
  tables: {
    users: string
    metrics: string
    events: string
    apiKeys: string
  }
}

export type SupabaseInstance = SupabaseClient 