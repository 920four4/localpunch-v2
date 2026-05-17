import { sendEvent } from '@/lib/loops'

/**
 * Fire a milestone email nudge after a successful punch. Fire-and-forget:
 * never throws, no-ops without LOOPS_API_KEY or when the customer has no
 * email (phone-only customers don't get these — Loops is email-only).
 *
 *   - one punch away  → customer_one_away
 *   - reward complete → customer_reward_ready
 */
export async function nudgeAfterPunch(opts: {
  email: string | null | undefined
  punchCount: number
  punchesRequired: number
  isComplete: boolean
  businessName: string
  rewardDescription: string | null
}): Promise<void> {
  const { email } = opts
  if (!email || !email.includes('@')) return

  const props = {
    business_name: opts.businessName,
    reward: opts.rewardDescription ?? '',
    punch_count: opts.punchCount,
    punches_required: opts.punchesRequired,
  }

  try {
    if (opts.isComplete) {
      await sendEvent(email, 'customer_reward_ready', props)
    } else if (opts.punchCount === opts.punchesRequired - 1) {
      await sendEvent(email, 'customer_one_away', props)
    }
  } catch {
    // sendEvent already swallows errors; this is belt-and-suspenders.
  }
}
