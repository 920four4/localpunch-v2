import { createClient } from '@/lib/supabase/server'
import { signRedeemToken, REDEEM_TTL_SECONDS } from '@/lib/qr/tokens'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/redeem-token
// Customer-authenticated. Issues a short-lived signed token for one of the
// caller's *own* completed cards. The customer shows this as a QR; only the
// merchant Redeem scanner can act on it. The customer can no longer redeem
// their own reward — that check now lives entirely merchant-side.
export async function POST(request: NextRequest) {
  try {
    const { card_id } = (await request.json()) as { card_id?: string }
    if (!card_id) {
      return NextResponse.json({ error: 'card_id required' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: card } = await supabase
      .from('punch_cards')
      .select('id, is_complete')
      .eq('id', card_id)
      .eq('customer_id', user.id)
      .maybeSingle()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    if (!card.is_complete) {
      return NextResponse.json(
        { error: 'This card isn’t complete yet' },
        { status: 400 },
      )
    }

    const token = await signRedeemToken({ card_id })

    return NextResponse.json({
      token,
      qr_payload: `localpunch:redeem:${token}`,
      ttl_seconds: REDEEM_TTL_SECONDS,
    })
  } catch (err) {
    console.error('Redeem token error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
