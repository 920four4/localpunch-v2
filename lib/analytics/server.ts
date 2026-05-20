import {
  GA_API_SECRET,
  GA_MEASUREMENT_ID,
  GA_MP_ENDPOINT,
  isServerGaEnabled,
} from '@/lib/analytics/config'
import {
  AnalyticsEvents,
  cleanParams,
  subscriptionItem,
  type GaParams,
} from '@/lib/analytics/events'

type MpEvent = {
  name: string
  params?: Record<string, unknown>
}

type MpPayload = {
  client_id: string
  user_id?: string
  timestamp_micros?: string
  events: MpEvent[]
}

/**
 * Send events to GA4 via Measurement Protocol (server-side).
 * Use for revenue, renewals, and webhook-driven conversions.
 */
export async function sendGaEvent(
  clientId: string,
  eventName: string,
  params?: GaParams,
  userId?: string,
): Promise<boolean> {
  if (!isServerGaEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ga/mp skip]', eventName, params)
    }
    return false
  }

  const payload: MpPayload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: cleanParams({
          ...params,
          engagement_time_msec: '100',
        }),
      },
    ],
  }
  if (userId) payload.user_id = userId

  const url = `${GA_MP_ENDPOINT}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('[ga/mp]', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[ga/mp]', err)
    return false
  }
}

export async function trackServerPurchase(args: {
  transactionId: string
  valueCents: number
  interval: 'month' | 'year'
  stripeCustomerId: string
  userId?: string
  businessId?: string
  isRenewal?: boolean
}) {
  const value = args.valueCents / 100
  const item = subscriptionItem(args.interval, value)

  await sendGaEvent(
    args.stripeCustomerId,
    AnalyticsEvents.PURCHASE,
    {
      transaction_id: args.transactionId,
      currency: 'USD',
      value,
      plan_interval: args.interval,
      business_id: args.businessId,
      purchase_type: args.isRenewal ? 'renewal' : 'subscription',
      items: [item],
    },
    args.userId,
  )

  if (!args.isRenewal) {
    await sendGaEvent(
      args.stripeCustomerId,
      AnalyticsEvents.MERCHANT_ACTIVATED,
      {
        business_id: args.businessId,
        plan_interval: args.interval,
        value,
      },
      args.userId,
    )
  } else {
    await sendGaEvent(
      args.stripeCustomerId,
      AnalyticsEvents.SUBSCRIPTION_RENEWAL,
      {
        transaction_id: args.transactionId,
        value,
        plan_interval: args.interval,
        business_id: args.businessId,
      },
      args.userId,
    )
  }
}

export async function trackServerChurn(args: {
  stripeCustomerId: string
  userId?: string
  businessId?: string
  businessName?: string
}) {
  await sendGaEvent(
    args.stripeCustomerId,
    AnalyticsEvents.SUBSCRIPTION_CHURNED,
    {
      business_id: args.businessId,
      business_name: args.businessName,
    },
    args.userId,
  )
}

export async function trackServerPaymentFailed(args: {
  stripeCustomerId: string
  userId?: string
  businessId?: string
  amountDueCents: number
}) {
  await sendGaEvent(
    args.stripeCustomerId,
    AnalyticsEvents.PAYMENT_FAILED,
    {
      business_id: args.businessId,
      value: args.amountDueCents / 100,
      currency: 'USD',
    },
    args.userId,
  )
}

export async function trackServerSignUp(args: {
  userId: string
  businessId: string
  businessName: string
}) {
  await sendGaEvent(args.userId, AnalyticsEvents.SIGN_UP, {
    method: 'merchant_setup',
    user_role: 'merchant',
    business_id: args.businessId,
    business_name: args.businessName,
  })

  await sendGaEvent(args.userId, AnalyticsEvents.BUSINESS_CREATED, {
    business_id: args.businessId,
    business_name: args.businessName,
  })
}
