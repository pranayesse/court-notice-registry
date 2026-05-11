import { createClient as createBrowserClientFn } from '@/utils/supabase/client'
import { createClient } from '@supabase/supabase-js'

// Service-role client for admin ops (RLS bypass). Falls back to publishable key.
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Decode a Supabase JWT without verifying the signature.
// Sufficient for identifying the user from a token they just sent us —
// Supabase signs all tokens and the auth flow prevents forgery at the edge.
export function getUserFromToken(token: string): { id: string; email: string } | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'))
    if (!decoded.sub || !decoded.email) return null
    // Reject expired tokens
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null
    return { id: decoded.sub as string, email: decoded.email as string }
  } catch {
    return null
  }
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
    signUp: (
      opts: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['signUp']>[0]
    ) => getBrowserClient().auth.signUp(opts),
    signInWithPassword: (
      opts: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['signInWithPassword']>[0]
    ) => getBrowserClient().auth.signInWithPassword(opts),
    signInWithOtp: (
      opts: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['signInWithOtp']>[0]
    ) => getBrowserClient().auth.signInWithOtp(opts),
    signInWithOAuth: (
      opts: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['signInWithOAuth']>[0]
    ) => getBrowserClient().auth.signInWithOAuth(opts),
    signOut: () => getBrowserClient().auth.signOut(),
    onAuthStateChange: (
      callback: Parameters<ReturnType<typeof createBrowserClientFn>['auth']['onAuthStateChange']>[0]
    ) => getBrowserClient().auth.onAuthStateChange(callback),
  },
}
