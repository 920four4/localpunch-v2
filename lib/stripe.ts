import Stripe from 'stripe'

/**
 * Lazy-init Stripe client. Throws at call-time (not module-load) so a missing
 * STRIPE_SECRET_KEY never crashes the build / unrelated routes.
 */
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to your environment (see STRIPE_SETUP.md).'
    )
  }
  _stripe = new Stripe(key, { typescript: true })
  return _stripe
}

export type PlanInterval = 'month' | 'year'

export function getPriceId(interval: PlanInterval): string {
  const id =
    interval === 'month'
      ? process.env.STRIPE_PRICE_MONTHLY
      : process.env.STRIPE_PRICE_YEARLY
  if (!id) {
    throw new Error(
      `Missing STRIPE_PRICE_${interval === 'month' ? 'MONTHLY' : 'YEARLY'} env var (see STRIPE_SETUP.md)`
    )
  }
  return id
}

/** Display labels used on the billing page and landing page. */
export const PLAN_INFO = {
  month: {
    label: 'Monthly',
    priceLabel: '$60',
    suffix: '/month',
    description: 'Unlimited cards, customers, and punches. Cancel anytime.',
    fullPrice: 60,
  },
  year: {
    label: 'Yearly',
    priceLabel: '$600',
    suffix: '/year',
    description: 'Same as monthly, two months free. Billed once a year.',
    savings: 'Save $120',
    fullPrice: 600,
  },
} as const

/** Stripe sub statuses that mean "business should be live". */
export function isLiveStatus(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing'
}
