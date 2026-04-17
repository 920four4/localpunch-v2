import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe, isLiveStatus } from '@/lib/stripe'
import {
  sendEvent,
  sendTransactional,
  syncContact,
  type ContactProperties,
} from '@/lib/loops'

/**
 * Stripe webhook endpoint.
 *
 * Configure this URL in the Stripe dashboard:
 *   https://<your-domain>/api/stripe/webhook
 *
 * Subscribe to at least these events:
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 *
 * Set STRIPE_WEBHOOK_SECRET to the signing secret shown after creating the endpoint.
 */

export const dynamic = 'force-dynamic'

type BusinessRow = {
  id: string
  name: string
  slug: string
  address: string | null
  owner_id: string
  is_active: boolean
  stripe_customer_id: string | null
  subscription_status: string | null
  created_at: string
}

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 })
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook_not_configured' }, { status: 500 })
  }

  let stripe: Stripe
  try {
    stripe = getStripe()
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json(
      { error: 'invalid_signature', message: (err as Error).message },
      { status: 400 }
    )
  }

  const admin = await createAdminClient()

  async function getBusinessByStripeIds(
    customerId: string
  ): Promise<{ business: BusinessRow; email: string | null; firstName: string | null } | null> {
    const { data: business } = (await admin
      .from('businesses')
      .select(
        'id, name, slug, address, owner_id, is_active, stripe_customer_id, subscription_status, created_at'
      )
      .eq('stripe_customer_id', customerId)
      .maybeSingle()) as { data: BusinessRow | null }
    if (!business) return null

    // Fetch owner email + display name for Loops contact sync.
    const { data: authUser } = await admin.auth.admin.getUserById(business.owner_id)
    const email = authUser?.user?.email ?? null
    const { data: profile } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', business.owner_id)
      .maybeSingle()
    return { business, email, firstName: profile?.display_name ?? null }
  }

  async function syncSubscriptionById(subscriptionId: string) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    await syncSubscription(sub)
  }

  async function syncSubscription(sub: Stripe.Subscription) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

    // Find the business: prefer metadata, fall back to customer ID lookup.
    let businessId = sub.metadata?.business_id
    if (!businessId) {
      const { data } = await admin
        .from('businesses')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle()
      businessId = data?.id
    }
    if (!businessId) {
      console.warn('[stripe webhook] no business found for subscription', sub.id)
      return
    }

    const item = sub.items.data[0]
    const interval = item?.price.recurring?.interval as 'month' | 'year' | undefined
    const priceCents = item?.price.unit_amount ?? null
    const periodEndSec = (sub as unknown as { current_period_end?: number }).current_period_end
    const periodEnd = periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null
    const nowActive = isLiveStatus(sub.status)

    // Grab the previous state so we can detect state transitions for emails.
    const { data: prev } = (await admin
      .from('businesses')
      .select('id, name, slug, address, owner_id, is_active, stripe_customer_id, subscription_status, created_at')
      .eq('id', businessId)
      .maybeSingle()) as { data: BusinessRow | null }

    await admin
      .from('businesses')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        plan_interval: interval ?? null,
        current_period_end: periodEnd,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        is_active: nowActive,
      })
      .eq('id', businessId)

    // --- Loops sync -------------------------------------------------------
    const owner = prev
      ? await getOwnerContactInfo(prev.owner_id)
      : null
    if (!owner?.email) return

    const contactProps: ContactProperties = {
      userId: prev?.owner_id,
      userGroup: 'merchant',
      firstName: owner.firstName ?? undefined,
      source: 'localpunch-stripe',
      businessId,
      businessName: prev?.name,
      businessSlug: prev?.slug,
      businessAddress: prev?.address ?? undefined,
      businessCreatedAt: prev?.created_at,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      planInterval: interval,
      planPriceCents: priceCents ?? undefined,
      currentPeriodEnd: periodEnd ?? undefined,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    }

    // Always sync contact properties so Loops segments stay fresh.
    await syncContact(owner.email, contactProps)

    // Detect transitions.
    const wasActive = isLiveStatus(prev?.subscription_status)
    if (!wasActive && nowActive) {
      // 🎉 First activation (or reactivation) — fire the onboarding drip.
      const isReactivation = prev?.subscription_status === 'past_due' ||
        prev?.subscription_status === 'canceled'
      contactProps.activatedAt = new Date().toISOString()
      if (!isReactivation) contactProps.subscriptionStartedAt = new Date().toISOString()
      await sendEvent(
        owner.email,
        isReactivation ? 'merchant_reactivated' : 'merchant_activated',
        {
          business_name: prev?.name ?? '',
          plan_interval: interval ?? 'month',
          plan_price: priceCents ? priceCents / 100 : 60,
        },
        contactProps
      )
      // Also send the immediate welcome transactional (day 0 of the drip).
      await sendTransactional('merchantWelcome', owner.email, {
        first_name: owner.firstName ?? 'there',
        business_name: prev?.name ?? 'your shop',
        plan_label: interval === 'year' ? 'Yearly ($600/yr)' : 'Monthly ($60/mo)',
        dashboard_url: 'https://localpunch-v2.vercel.app/merchant',
        qr_url: `https://localpunch-v2.vercel.app/merchant/qr`,
      })
    } else if (wasActive && !nowActive && sub.status === 'canceled') {
      // 🛑 Canceled
      await sendEvent(owner.email, 'merchant_churned', {
        business_name: prev?.name ?? '',
      }, { ...contactProps, churnedAt: new Date().toISOString() })
      await sendTransactional('merchantCanceled', owner.email, {
        first_name: owner.firstName ?? 'there',
        business_name: prev?.name ?? 'your shop',
      })
    }
  }

  async function getOwnerContactInfo(ownerId: string) {
    const { data: authUser } = await admin.auth.admin.getUserById(ownerId)
    const email = authUser?.user?.email ?? null
    const { data: profile } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', ownerId)
      .maybeSingle()
    return { email, firstName: profile?.display_name ?? null }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id
          await syncSubscriptionById(subId)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await syncSubscription(sub)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionRef = (invoice as unknown as { subscription?: string | { id: string } })
          .subscription
        const subId =
          typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id
        if (subId) await syncSubscriptionById(subId)

        // Extend LTV + last payment props on Loops
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id
        if (customerId) {
          const info = await getBusinessByStripeIds(customerId)
          if (info?.email) {
            await syncContact(info.email, {
              lastPaymentAt: new Date().toISOString(),
              lifetimeValueCents: invoice.amount_paid ?? undefined,
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionRef = (invoice as unknown as { subscription?: string | { id: string } })
          .subscription
        const subId =
          typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id
        if (subId) await syncSubscriptionById(subId)

        // Fire a transactional "update your card" email.
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id
        if (customerId) {
          const info = await getBusinessByStripeIds(customerId)
          if (info?.email) {
            await syncContact(info.email, {
              lastPaymentFailedAt: new Date().toISOString(),
            })
            await sendEvent(info.email, 'merchant_payment_failed', {
              business_name: info.business.name,
              amount_due: (invoice.amount_due ?? 0) / 100,
            })
            await sendTransactional('merchantPaymentFailed', info.email, {
              first_name: info.firstName ?? 'there',
              business_name: info.business.name,
              amount_due: ((invoice.amount_due ?? 0) / 100).toFixed(2),
              billing_portal_url: 'https://localpunch-v2.vercel.app/merchant/billing',
            })
          }
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[stripe webhook] handler error', event.type, err)
    return NextResponse.json({ error: 'handler_error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
