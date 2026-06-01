import { NextResponse, type NextRequest } from 'next/server'
import { trackServerSignUp } from '@/lib/analytics/server'
import { createClient } from '@/lib/supabase/server'
import { notifySignup } from '@/lib/telegram/notify'

/**
 * Fired from the client after merchant setup — analytics only (email on activation).
 */
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { business_id } = await request.json().catch(() => ({}))
  if (!business_id) {
    return NextResponse.json({ error: 'missing_business_id' }, { status: 400 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', business_id)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  await trackServerSignUp({
    userId: user.id,
    businessId: business.id,
    businessName: business.name,
  })

  // Ping the team Telegram on a fresh merchant setup (best-effort).
  const base = process.env.NEXT_PUBLIC_SITE_URL
  void notifySignup({
    email: user.email,
    name: business.name,
    plan: 'Merchant (setup complete — not yet activated)',
    url: base ? { label: 'Open admin', href: `${base}/admin` } : undefined,
  })

  return NextResponse.json({ ok: true })
}
