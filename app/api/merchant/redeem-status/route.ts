import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// GET /api/merchant/redeem-status?card_id=...&since=<iso>
// Merchant-authenticated. After texting a confirm link, the merchant screen
// polls this to see whether the customer tapped it. Returns the most recent
// redemption time for the card (ownership enforced) so the UI can flip to
// "Redeemed ✓" live.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cardId = request.nextUrl.searchParams.get('card_id')
  const since = request.nextUrl.searchParams.get('since')
  if (!cardId) {
    return NextResponse.json({ error: 'card_id required' }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Confirm the card's program belongs to this merchant.
  const { data: card } = await admin
    .from('punch_cards')
    .select('id, program:loyalty_programs!inner(business:businesses!inner(owner_id))')
    .eq('id', cardId)
    .maybeSingle()
  const ownerId = (
    card?.program as unknown as { business: { owner_id: string } } | undefined
  )?.business.owner_id
  if (!card || ownerId !== user.id) {
    return NextResponse.json({ error: 'Not your card' }, { status: 403 })
  }

  let query = admin
    .from('redemptions')
    .select('id, redeemed_at')
    .eq('card_id', cardId)
    .order('redeemed_at', { ascending: false })
    .limit(1)
  if (since) query = query.gt('redeemed_at', since)

  const { data: redemption } = await query.maybeSingle()

  return NextResponse.json({
    redeemed: Boolean(redemption),
    redeemed_at: redemption?.redeemed_at ?? null,
  })
}
