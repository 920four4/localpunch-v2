import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEvent, syncContact } from '@/lib/loops'

/**
 * Fired from the client right after a merchant finishes `app/merchant/setup`.
 *
 * We do it server-side so the Loops API key never ships to the browser, and
 * we fetch the owner's email from auth (not from the client) so it can't be
 * spoofed.
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
    .select('id, name, slug, address, created_at')
    .eq('id', business_id)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  await syncContact(user.email, {
    userId: user.id,
    userGroup: 'merchant',
    firstName: profile?.display_name ?? undefined,
    source: 'localpunch-merchant-signup',
    businessId: business.id,
    businessName: business.name,
    businessSlug: business.slug,
    businessAddress: business.address ?? undefined,
    businessCreatedAt: business.created_at,
    subscriptionStatus: 'none',
  })

  await sendEvent(user.email, 'merchant_signed_up', {
    business_name: business.name,
    business_slug: business.slug,
  })

  return NextResponse.json({ ok: true })
}
