// lib/supabase/admin.ts
// Admin client using service-role key — NEVER import in browser/client components
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// This module must only be imported in server-side code (API routes, server actions, middleware)
if (typeof window !== 'undefined') {
  throw new Error('lib/supabase/admin.ts must not be used in browser code')
}

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
