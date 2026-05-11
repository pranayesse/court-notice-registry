import { createClient as createBrowserClientFn } from '@/utils/supabase/client'
import { createClient } from '@supabase/supabase-js'

// Service-role client for API routes (server-side only, uses service_role key)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Browser singleton for 'use client' components
let _browser: ReturnType<typeof createBrowserClientFn> | null = null
function getBrowserClient() {
  if (!_browser) _browser = createBrowserClientFn()
  return _browser
}

// Named `supabase` export used by client components (login, register, forms)
export const supabase = {
  auth: {
    getSession: () => getBrowserClient().auth.getSession(),
    getUser: () => getBrowserClient().auth.getUser(),
    signInWithOtp: (
      opts: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['signInWithOtp']>[0]
    ) => getBrowserClient().auth.signInWithOtp(opts),
    signInWithOAuth: (
      opts: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['signInWithOAuth']>[0]
    ) => getBrowserClient().auth.signInWithOAuth(opts),
  },
}
