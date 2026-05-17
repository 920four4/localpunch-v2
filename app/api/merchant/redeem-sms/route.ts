import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { signRedeemToken } from '@/lib/qr/tokens'
import { sendSms, isSmsConfigured } from '@/lib/sms'

// POST /api/merchant/redeem-sms  { card_id, phone }
// Merchant-initiated SMS fallback. The merchant (authenticated) chooses a
// completed card and texts the customer a one-tap confirm link. The token
// is bound to BOTH the card and this merchant, so the customer's tap can
// only redeem this card for this shop — it can't be forged or reused
// elsewhere. The customer tapping is just the confirmation gesture; the
// merchant already authorised it by initiating the send.
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  return raw.startsWith('+') ? raw : `+${digits}`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { card_id?: string; phone?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.card_id || !body.phone) {
    return NextResponse.json(
      { error: 'card_id and phone required' },
      { status: 400 },
    )
  }

  if (!isSmsConfigured()) {
    return NextResponse.json(
      {
        error: 'sms_not_configured',
        message:
          'Text confirm isn’t set up yet — use “Confirm now” instead.',
      },
      { status: 503 },
    )
  }

  // Verify this merchant owns the card's program and it's still complete.
  const admin = await createAdminClient()
  const { data: card } = await admin
    .from('punch_cards')
    .select(
      `id, is_complete,
       program:loyalty_programs!inner(
         name, reward_description,
         business:businesses!inner(name, owner_id, is_active)
       )`,
    )
    .eq('id', body.card_id)
    .maybeSingle()

  const prog = card?.program as unknown as
    | {
        name: string
        reward_description: string | null
        business: { name: string; owner_id: string; is_active: boolean }
      }
    | undefined

  if (!card || !prog || prog.business.owner_id !== user.id) {
    return NextResponse.json(
      { error: 'This card belongs to a different shop' },
      { status: 403 },
    )
  }
  if (!prog.business.is_active) {
    return NextResponse.json({ error: 'Your shop isn’t active' }, { status: 402 })
  }
  if (!card.is_complete) {
    return NextResponse.json(
      { error: 'Card isn’t complete yet' },
      { status: 409 },
    )
  }

  const token = await signRedeemToken({
    card_id: body.card_id,
    merchant_id: user.id,
  })
  const origin =
    request.nextUrl.origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://localpunch-v2.vercel.app'
  const link = `${origin.replace(/\/$/, '')}/r/${token}`

  const result = await sendSms(
    toE164(body.phone),
    `${prog.business.name}: tap to claim your reward — ${
      prog.reward_description ?? prog.name
    }. ${link}`,
  )

  if (!result.sent) {
    return NextResponse.json(
      {
        error:
          result.reason === 'not_configured'
            ? 'sms_not_configured'
            : 'Could not send the text — use “Confirm now” instead.',
      },
      { status: result.reason === 'not_configured' ? 503 : 502 },
    )
  }

  return NextResponse.json({ sent: true, card_id: body.card_id })
}
