import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('stripe_customer_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'no_customer', message: 'Start a subscription first.' },
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

  const session = await stripe.billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: `${request.nextUrl.origin}/merchant/billing`,
  })

  return NextResponse.json({ url: session.url })
}
