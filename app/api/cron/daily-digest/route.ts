import { createDailyDigestHandler } from '@/lib/telegram/digest'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyError } from '@/lib/telegram/notify'

/**
 * Daily 13:00 UTC rollup posted to the LocalPunch Telegram topic.
 *
 * Counts the previous full UTC day. All queries are cheap COUNT(*)s plus a
 * small select for revenue. Auth + date window + Telegram post are handled by
 * createDailyDigestHandler; this file only supplies the app-specific metrics.
 */
export const dynamic = 'force-dynamic'

const pct = (num: number, den: number) =>
  den > 0 ? `${Math.round((num / den) * 100)}%` : '—'

export const GET = createDailyDigestHandler(async ({ start, end, day }) => {
  const supabase = await createAdminClient()
  const startIso = start.toISOString()
  const endIso = end.toISOString()
  const head = { count: 'exact' as const, head: true }

  try {
    const [
      visitorsRes,
      newCustomersRes,
      newShopsRes,
      punchesRes,
      redemptionsRes,
      activeShopsRes,
      activatedRes,
    ] = await Promise.all([
      // Unique site visitors for the day.
      supabase.from('site_visits').select('*', head).eq('day', day),
      // New customer signups (profiles).
      supabase
        .from('profiles')
        .select('*', head)
        .eq('role', 'customer')
        .gte('created_at', startIso)
        .lt('created_at', endIso),
      // New shops created.
      supabase
        .from('businesses')
        .select('*', head)
        .gte('created_at', startIso)
        .lt('created_at', endIso),
      // Punches recorded — the core action this app exists for.
      supabase
        .from('punches')
        .select('*', head)
        .gte('punched_at', startIso)
        .lt('punched_at', endIso),
      // Rewards redeemed.
      supabase
        .from('redemptions')
        .select('*', head)
        .gte('redeemed_at', startIso)
        .lt('redeemed_at', endIso),
      // Active paying shops (running total — cheap, very telling).
      supabase
        .from('businesses')
        .select('*', head)
        .in('subscription_status', ['active', 'trialing']),
      // Shops that activated a paid plan during the window → new revenue.
      supabase
        .from('businesses')
        .select('plan_interval')
        .gte('subscription_activated_at', startIso)
        .lt('subscription_activated_at', endIso),
    ])

    const activated = (activatedRes.data ?? []) as { plan_interval: string | null }[]
    const revenue = activated.reduce(
      (sum, b) => sum + (b.plan_interval === 'year' ? 600 : 60),
      0
    )

    const visitors = visitorsRes.count ?? 0
    const newCustomers = newCustomersRes.count ?? 0

    return {
      visitors,
      signups: newCustomers,
      payments: activated.length,
      revenue,
      currency: 'USD',
      extra: {
        'New shops': newShopsRes.count ?? 0,
        'Punches recorded': punchesRes.count ?? 0,
        'Rewards redeemed': redemptionsRes.count ?? 0,
        'Active paying shops': activeShopsRes.count ?? 0,
        'Visitor→signup': pct(newCustomers, visitors),
      },
    }
  } catch (err) {
    void notifyError({
      where: 'cron/daily-digest',
      message: 'Digest metrics query failed',
      detail: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
})
