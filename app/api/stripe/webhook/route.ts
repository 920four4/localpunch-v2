import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import {
  trackServerChurn,
  trackServerPaymentFailed,
  trackServerPurchase,
} from '@/lib/analytics/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe, isLiveStatus } from '@/lib/stripe'
import { merchantEmailVars, sendTransactional } from '@/lib/email'
import {
  notifyDispute,
  notifyFailedPayment,
  notifyPayment,
  notifyRefund,
  notifySubscription,
} from '@/lib/telegram/notify'

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

    // Fetch owner email + display name for transactional email.
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

    const owner = prev
      ? await getOwnerContactInfo(prev.owner_id)
      : null
    if (!owner?.email) return

    const wasActive = isLiveStatus(prev?.subscription_status)
    if (!wasActive && nowActive) {
      const isReactivation =
        prev?.subscription_status === 'past_due' ||
        prev?.subscription_status === 'canceled'
      if (!isReactivation) {
        await admin
          .from('businesses')
          .update({
            subscription_activated_at: new Date().toISOString(),
            merchant_drip_sent: {},
          })
          .eq('id', businessId)
      }
      const planLabel =
        interval === 'year' ? 'Yearly ($600/yr)' : 'Monthly ($60/mo)'
      await sendTransactional(
        'merchantWelcome',
        owner.email,
        merchantEmailVars({
          first_name: owner.firstName ?? 'there',
          business_name: prev?.name ?? 'your shop',
          plan_label: planLabel,
        })
      )
      void notifySubscription({
        plan: planLabel,
        account: `${prev?.name ?? 'shop'} · ${owner.email}`,
        kind: 'started',
      })
    } else if (wasActive && !nowActive && sub.status === 'canceled') {
      await sendTransactional(
        'merchantCanceled',
        owner.email,
        merchantEmailVars({
          first_name: owner.firstName ?? 'there',
          business_name: prev?.name ?? 'your shop',
        })
      )
      void notifySubscription({
        plan: interval === 'year' ? 'Yearly' : 'Monthly',
        account: `${prev?.name ?? 'shop'} · ${owner.email}`,
        kind: 'canceled',
      })
      await trackServerChurn({
        stripeCustomerId: customerId,
        userId: prev?.owner_id,
        businessId: prev?.id,
        businessName: prev?.name,
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

          const customerId =
            typeof session.customer === 'string'
              ? session.customer
              : session.customer?.id
          const interval =
            session.metadata?.interval === 'year' ? 'year' : 'month'
          const valueCents = session.amount_total ?? (interval === 'year' ? 60000 : 6000)
          if (customerId) {
            await trackServerPurchase({
              transactionId: session.id,
              valueCents,
              interval,
              stripeCustomerId: customerId,
              userId: session.metadata?.user_id,
              businessId: session.metadata?.business_id,
              isRenewal: false,
            })
            // Shared Stripe account: only ping for OUR merchants (those in the
            // businesses table). Ignores client/other-app revenue.
            const info = await getBusinessByStripeIds(customerId)
            if (info) {
              void notifyPayment({
                amount: valueCents / 100,
                currency: (session.currency || 'usd').toUpperCase(),
                customer:
                  info.email || session.customer_details?.email || info.business.name,
                item: interval === 'year' ? 'Yearly plan' : 'Monthly plan',
              })
            }
          }
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

        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id

        if (customerId) {
          const info = await getBusinessByStripeIds(customerId)

          // Renewals only — initial purchase tracked on checkout.session.completed
          const billingReason = (invoice as Stripe.Invoice & { billing_reason?: string })
            .billing_reason
          if (billingReason === 'subscription_cycle' && invoice.amount_paid) {
            const line0 = invoice.lines?.data[0] as
              | { price?: { recurring?: { interval?: string } } }
              | undefined
            const interval =
              line0?.price?.recurring?.interval === 'year' ? 'year' : 'month'
            await trackServerPurchase({
              transactionId: invoice.id,
              valueCents: invoice.amount_paid,
              interval,
              stripeCustomerId: customerId,
              userId: info?.business.owner_id,
              businessId: info?.business.id,
              isRenewal: true,
            })
            // Only ping for OUR merchants — this Stripe account is shared.
            if (info) {
              void notifyPayment({
                amount: invoice.amount_paid / 100,
                currency: (invoice.currency || 'usd').toUpperCase(),
                customer: info.email || info.business.name,
                item: `Renewal · ${interval === 'year' ? 'Yearly' : 'Monthly'}`,
              })
            }
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
            await sendTransactional(
              'merchantPaymentFailed',
              info.email,
              merchantEmailVars({
                first_name: info.firstName ?? 'there',
                business_name: info.business.name,
                amount_due: ((invoice.amount_due ?? 0) / 100).toFixed(2),
              })
            )
            await trackServerPaymentFailed({
              stripeCustomerId: customerId,
              userId: info.business.owner_id,
              businessId: info.business.id,
              amountDueCents: invoice.amount_due ?? 0,
            })
            void notifyFailedPayment({
              amount: (invoice.amount_due ?? 0) / 100,
              currency: (invoice.currency || 'usd').toUpperCase(),
              customer: info.email || info.business.name,
              reason: 'Invoice payment failed (card declined / past_due)',
            })
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const customerId =
          typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
        // Shared Stripe account: only surface refunds for OUR merchants.
        const info = customerId ? await getBusinessByStripeIds(customerId) : null
        if (info) {
          void notifyRefund({
            amount: (charge.amount_refunded ?? 0) / 100,
            currency: (charge.currency || 'usd').toUpperCase(),
            customer: info.email || charge.billing_details?.email || info.business.name,
            reason: charge.refunds?.data?.[0]?.reason ?? undefined,
          })
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeId =
          typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id
        // Only surface disputes tied to OUR merchants — this Stripe account is shared.
        let info: Awaited<ReturnType<typeof getBusinessByStripeIds>> = null
        let billingEmail: string | undefined
        try {
          if (chargeId) {
            const charge = await stripe.charges.retrieve(chargeId)
            const customerId =
              typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
            info = customerId ? await getBusinessByStripeIds(customerId) : null
            billingEmail = charge.billing_details?.email ?? undefined
          }
        } catch {
          // best-effort lookup
        }
        if (info) {
          void notifyDispute({
            amount: (dispute.amount ?? 0) / 100,
            currency: (dispute.currency || 'usd').toUpperCase(),
            customer: info.email || billingEmail || info.business.name,
            reason: dispute.reason,
          })
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
