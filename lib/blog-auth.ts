import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Authorizes a blog admin operation via one of:
//   1. Supabase session cookie belonging to a user with role=admin
//   2. Authorization: Bearer <BLOG_API_TOKEN> header — for programmatic use
//      (scripts, CI, agents). The admin API client returned bypasses RLS.
//
// Returns { ok: true, supabase } on success, or { ok: false, status, error }.
export async function authorizeBlogAdmin(
  request: NextRequest,
): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createAdminClient>> }
  | { ok: false; status: number; error: string }
> {
  // Bearer token path
  const bearer = request.headers.get('authorization')
  if (bearer?.startsWith('Bearer ')) {
    const token = bearer.slice('Bearer '.length).trim()
    const expected = process.env.BLOG_API_TOKEN
    if (!expected) {
      return {
        ok: false,
        status: 500,
        error: 'BLOG_API_TOKEN not configured on server',
      }
    }
    if (token !== expected) {
      return { ok: false, status: 401, error: 'Invalid bearer token' }
    }
    const supabase = await createAdminClient()
    return { ok: true, supabase }
  }

  // Session cookie path
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, status: 401, error: 'Not signed in' }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') {
    return { ok: false, status: 403, error: 'Admin only' }
  }
  const adminSupabase = await createAdminClient()
  return { ok: true, supabase: adminSupabase }
}
