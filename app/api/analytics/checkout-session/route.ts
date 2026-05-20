import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

/** Returns checkout amounts for client-side purchase confirmation (deduped with webhook). */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'missing_session_id' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price'],
    })

    const businessId = session.metadata?.business_id
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
    }

    const amountTotal = (session.amount_total ?? 0) / 100
    const interval =
      session.metadata?.interval === 'year' ||
      session.line_items?.data[0]?.price?.recurring?.interval === 'year'
        ? 'year'
        : 'month'

    return NextResponse.json({
      ok: true,
      transaction_id: session.id,
      value: amountTotal || (interval === 'year' ? 600 : 60),
      interval,
      business_id: businessId,
    })
  } catch (err) {
    console.error('[analytics/checkout-session]', err)
    return NextResponse.json({ ok: false, error: 'stripe_error' }, { status: 500 })
  }
}
