/**
 * GA4 event names and parameter helpers.
 * @see docs/ANALYTICS.md for dashboard setup (conversions, explorations).
 */

export const AnalyticsEvents = {
  // Standard GA4 recommended
  PAGE_VIEW: 'page_view',
  GENERATE_LEAD: 'generate_lead',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  SELECT_CONTENT: 'select_content',

  // Custom — product funnel
  CTA_CLICK: 'cta_click',
  BUSINESS_CREATED: 'business_created',
  PROGRAM_CREATED: 'program_created',
  MERCHANT_ACTIVATED: 'merchant_activated',
  SUBSCRIPTION_RENEWAL: 'subscription_renewal',
  SUBSCRIPTION_CHURNED: 'subscription_churned',
  PAYMENT_FAILED: 'payment_failed',
  CHECKOUT_CANCELED: 'checkout_canceled',

  // Engagement
  PUNCH_RECORDED: 'punch_recorded',
  PUNCH_REVERSED: 'punch_reversed',
  REDEEM_COMPLETED: 'redeem_completed',
  CARD_CLAIMED: 'card_claimed',
  WALLET_VIEW: 'wallet_view',
} as const

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]

export type UserRole = 'customer' | 'merchant' | 'admin' | 'anonymous'

export type GaParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | GaParamValue[]
  | { [key: string]: GaParamValue }

export type GaParams = Record<string, GaParamValue>

export function cleanParams(params: GaParams): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v
  }
  return out
}

/** E-commerce item for purchase events */
export function subscriptionItem(interval: 'month' | 'year', value: number) {
  const name = interval === 'year' ? 'LocalPunch Yearly' : 'LocalPunch Monthly'
  return {
    item_id: interval === 'year' ? 'plan_yearly' : 'plan_monthly',
    item_name: name,
    item_category: 'subscription',
    price: value,
    quantity: 1,
  }
}
