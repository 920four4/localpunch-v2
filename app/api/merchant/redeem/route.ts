import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { verifyRedeemToken, extractRedeemToken } from '@/lib/qr/tokens'

// POST /api/merchant/redeem
// Merchant-authenticated (cookie session). Two ways in:
//   { token }   — scanned redeem QR (or raw localpunch:redeem:<jwt>)
//   { card_id } — chosen from the lookup-by-phone/email fallback
// Either way the SECURITY DEFINER RPC enforces that *this* merchant owns the
// program the card belongs to, and records redemptions.approved_by.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { token?: string; card_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  let cardId: string | undefined = body.card_id
  if (!cardId) {
    if (!body.token) {
      return NextResponse.json(
        { error: 'token or card_id required' },
        { status: 400 },
      )
    }
    try {
      const payload = await verifyRedeemToken(extractRedeemToken(body.token))
      cardId = payload.card_id
    } catch {
      return NextResponse.json(
        {
          error:
            'This redeem code expired or is invalid — ask the customer to refresh it.',
        },
        { status: 400 },
      )
    }
  }

  const admin = await createAdminClient()
  const { data, error } = await admin.rpc('redeem_card_for_merchant', {
    p_card_id: cardId,
    p_merchant_id: user.id,
    p_notes: null,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = data as {
    error?: string
    success?: boolean
    [k: string]: unknown
  }
  if (result?.error) {
    const status = result.error.includes('different shop')
      ? 403
      : result.error.includes('complete')
        ? 409
        : 400
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json(result)
}
