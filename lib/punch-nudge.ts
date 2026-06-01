import { sendTransactional } from '@/lib/email'

/**
 * Milestone emails after a punch (Resend). Fire-and-forget; skips phone-only users.
 */
export async function nudgeAfterPunch(opts: {
  email: string | null | undefined
  firstName?: string | null
  punchCount: number
  punchesRequired: number
  isComplete: boolean
  businessName: string
  rewardDescription: string | null
}): Promise<void> {
  const { email } = opts
  if (!email || !email.includes('@')) return

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.localpunchcard.io'
  const vars = {
    first_name: opts.firstName ?? 'there',
    business_name: opts.businessName,
    reward: opts.rewardDescription ?? 'your reward',
    wallet_url: `${site}/wallet`,
  }

  try {
    if (opts.isComplete) {
      await sendTransactional('customerRewardReady', email, vars)
    } else if (opts.punchCount === opts.punchesRequired - 1) {
      await sendTransactional('customerOneAway', email, vars)
    }
  } catch {
    // sendTransactional already logs errors
  }
}
