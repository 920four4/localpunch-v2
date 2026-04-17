/**
 * Loops (https://loops.so) client — thin fetch wrapper.
 *
 * All calls are "fire and forget" from the caller's perspective: errors are
 * logged but never thrown, so a failing email never breaks a checkout webhook
 * or signup flow. If LOOPS_API_KEY is not set, every call no-ops with a
 * console warning — lets us deploy email plumbing ahead of a Loops account.
 *
 * Setup: see docs/LOOPS_SETUP.md.
 * Property schema: see scripts/loops-bootstrap.sh.
 */

const LOOPS_BASE = 'https://app.loops.so/api/v1'

export function isLoopsConfigured(): boolean {
  return Boolean(process.env.LOOPS_API_KEY)
}

type JsonBody = Record<string, unknown>

async function loopsFetch<T = unknown>(path: string, body: JsonBody): Promise<T | null> {
  const apiKey = process.env.LOOPS_API_KEY
  if (!apiKey) {
    console.warn(`[loops] ${path} skipped — LOOPS_API_KEY not set`)
    return null
  }

  try {
    const res = await fetch(`${LOOPS_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[loops] ${path} failed (${res.status}):`, text)
      return null
    }
    return (await res.json().catch(() => null)) as T | null
  } catch (err) {
    console.error(`[loops] ${path} threw:`, err)
    return null
  }
}

// ============================================================
// Contact properties — matches scripts/loops-bootstrap.sh
// ============================================================

export type ContactProperties = {
  // Defaults (Loops built-in)
  userId?: string
  userGroup?: UserGroup
  firstName?: string
  lastName?: string
  source?: string
  subscribed?: boolean

  // Business / merchant dimensions
  businessId?: string
  businessName?: string
  businessSlug?: string
  businessAddress?: string
  businessCreatedAt?: string // ISO
  programCount?: number

  // Billing / subscription
  planInterval?: 'month' | 'year'
  planPriceCents?: number
  subscriptionStatus?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStartedAt?: string
  activatedAt?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  churnedAt?: string
  lifetimeValueCents?: number
  lastPaymentAt?: string
  lastPaymentFailedAt?: string

  // Product usage
  totalCustomers?: number
  totalPunches?: number
  totalRedemptions?: number
  lastPunchAt?: string
  lastActiveAt?: string

  // Customer-specific
  phone?: string
  phoneVerified?: boolean
  marketingConsent?: boolean
  cardCount?: number
  completedCards?: number

  // Marketing attribution
  signupSource?: string
  referrerBusinessSlug?: string
}

export type UserGroup = 'merchant' | 'customer' | 'admin'

/**
 * Create or update a contact. Keyed by email. Optional mailing list toggles.
 */
export async function syncContact(
  email: string,
  properties: ContactProperties = {},
  options: { mailingLists?: Record<string, boolean> } = {}
): Promise<void> {
  if (!email || !email.includes('@')) return

  // Loops strips undefined but not null — clean up nulls so we don't clobber
  // existing values when callers pass partial data.
  const body: JsonBody = { email }
  for (const [k, v] of Object.entries(properties)) {
    if (v !== undefined && v !== null) body[k] = v
  }
  if (options.mailingLists && Object.keys(options.mailingLists).length > 0) {
    body.mailingLists = options.mailingLists
  }

  await loopsFetch('/contacts/update', body)
}

// ============================================================
// Events — trigger Loops (drips)
// ============================================================

/**
 * Event names. Each one corresponds to a Loop configured in the Loops UI.
 * See docs/LOOPS_SETUP.md for the triggers each should be wired to.
 */
export type LoopsEventName =
  | 'merchant_signed_up' // business created, not yet paid
  | 'merchant_activated' // first successful payment → starts 5-email drip
  | 'merchant_reactivated' // resumed after past_due or cancel
  | 'merchant_payment_failed'
  | 'merchant_subscription_canceled'
  | 'merchant_churned' // fully canceled and period ended
  | 'customer_signed_up'
  | 'customer_first_punch'
  | 'customer_reward_ready'

export async function sendEvent(
  email: string,
  eventName: LoopsEventName,
  properties: Record<string, string | number | boolean> = {},
  contactProperties: ContactProperties = {}
): Promise<void> {
  if (!email || !email.includes('@')) {
    console.warn(`[loops] sendEvent(${eventName}) skipped — no email`)
    return
  }
  const body: JsonBody = {
    email,
    eventName,
    eventProperties: properties,
  }
  // Sync contact props alongside the event. Loops supports this on the event
  // endpoint so we only do one network hop per trigger.
  const cleanProps: JsonBody = {}
  for (const [k, v] of Object.entries(contactProperties)) {
    if (v !== undefined && v !== null) cleanProps[k] = v
  }
  if (Object.keys(cleanProps).length > 0) {
    body.contactProperties = cleanProps
  }
  await loopsFetch('/events/send', body)
}

// ============================================================
// Transactional email — send a specific template by ID
// ============================================================

/**
 * Map of logical transactional email keys to their Loops template IDs.
 * IDs come from env vars populated after you create templates in the Loops UI.
 * See docs/LOOPS_SETUP.md for the list of templates + their expected vars.
 */
export const TRANSACTIONAL_IDS = {
  merchantWelcome: process.env.LOOPS_TX_MERCHANT_WELCOME,
  merchantDay1FirstPunch: process.env.LOOPS_TX_MERCHANT_DAY1,
  merchantDay3Growing: process.env.LOOPS_TX_MERCHANT_DAY3,
  merchantDay7QrPlacement: process.env.LOOPS_TX_MERCHANT_DAY7,
  merchantDay14PowerTips: process.env.LOOPS_TX_MERCHANT_DAY14,
  merchantPaymentFailed: process.env.LOOPS_TX_MERCHANT_PAYMENT_FAILED,
  merchantCanceled: process.env.LOOPS_TX_MERCHANT_CANCELED,
  customerWelcome: process.env.LOOPS_TX_CUSTOMER_WELCOME,
} as const

export type TransactionalKey = keyof typeof TRANSACTIONAL_IDS

export async function sendTransactional(
  key: TransactionalKey,
  email: string,
  dataVariables: Record<string, string | number | boolean> = {},
  options: { addToAudience?: boolean; idempotencyKey?: string } = {}
): Promise<void> {
  if (!email || !email.includes('@')) {
    console.warn(`[loops] sendTransactional(${key}) skipped — no email`)
    return
  }
  const transactionalId = TRANSACTIONAL_IDS[key]
  if (!transactionalId) {
    console.warn(
      `[loops] sendTransactional(${key}) skipped — LOOPS_TX_${String(key).toUpperCase()} not set`
    )
    return
  }
  const body: JsonBody = {
    transactionalId,
    email,
    dataVariables,
  }
  if (options.addToAudience) body.addToAudience = true
  await loopsFetch('/transactional', body)
}
