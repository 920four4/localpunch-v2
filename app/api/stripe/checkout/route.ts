import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getPriceId, getStripe, type PlanInterval } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  let interval: PlanInterval
  try {
    const body = await request.json()
    interval = body?.interval
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (interval !== 'month' && interval !== 'year') {
    return NextResponse.json({ error: 'invalid_interval' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name, stripe_customer_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (bizErr) return NextResponse.json({ error: bizErr.message }, { status: 500 })
  if (!business) {
    return NextResponse.json(
      { error: 'no_business', message: 'Finish shop setup first.' },
      { status: 400 }
    )
  }

  let stripe: Stripe
  try {
    stripe = getStripe()
  } catch (err) {
    return NextResponse.json(
      { error: 'stripe_not_configured', message: (err as Error).message },
      { status: 500 }
    )
  }

  // Reuse or create the Stripe customer so we always have a stable handle.
  let customerId = business.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: business.name,
      metadata: {
        business_id: business.id,
        user_id: user.id,
      },
    })
    customerId = customer.id
    const admin = await createAdminClient()
    await admin
      .from('businesses')
      .update({ stripe_customer_id: customerId })
      .eq('id', business.id)
  }

  const origin = request.nextUrl.origin
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: getPriceId(interval), quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/merchant/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/merchant/billing?status=canceled`,
    subscription_data: {
      metadata: { business_id: business.id, user_id: user.id },
    },
    metadata: { business_id: business.id, user_id: user.id },
  })

  if (!session.url) {
    return NextResponse.json({ error: 'no_checkout_url' }, { status: 500 })
  }
  return NextResponse.json({ url: session.url })
}
