import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyRedeemToken } from '@/lib/qr/tokens'

// POST /api/redeem-confirm  { token }
// Public — reached when the customer taps the merchant-sent SMS link and
// presses "Claim my reward". Security: the token is a signed JWT minted
// only inside an authenticated merchant request (/api/merchant/redeem-sms)
// and carries the merchant_id. The customer can't forge it, and it only
// works for the exact card + shop the merchant chose. Redemption still runs
// through the same ownership-enforcing RPC with approved_by = that merchant.
export async function POST(request: NextRequest) {
  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }

  let payload
  try {
    payload = await verifyRedeemToken(body.token)
  } catch {
    return NextResponse.json(
      { error: 'This link expired. Ask the cashier to resend it.' },
      { status: 400 },
    )
  }

  if (!payload.merchant_id) {
    // A bare QR token must be scanned by the merchant, not self-confirmed.
    return NextResponse.json(
      { error: 'This link can’t be used to self-confirm.' },
      { status: 403 },
    )
  }

  const admin = await createAdminClient()
  const { data, error } = await admin.rpc('redeem_card_for_merchant', {
    p_card_id: payload.card_id,
    p_merchant_id: payload.merchant_id,
    p_notes: 'sms_confirm',
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = data as { error?: string; [k: string]: unknown }
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }
  return NextResponse.json(result)
}
