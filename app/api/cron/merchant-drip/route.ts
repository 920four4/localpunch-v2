import { NextResponse, type NextRequest } from 'next/server'
import {
  MERCHANT_DRIP_SCHEDULE,
  merchantEmailVars,
  sendTransactional,
} from '@/lib/email'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyError } from '@/lib/telegram/notify'

export const dynamic = 'force-dynamic'

const MS_PER_DAY = 86_400_000

type BusinessRow = {
  id: string
  name: string
  owner_id: string
  subscription_activated_at: string
  merchant_drip_sent: Record<string, boolean> | null
}

/**
 * Daily cron: send merchant drip emails (day 1 / 3 / 7 / 14) via Resend.
 * Configure in Vercel Cron with CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const admin = await createAdminClient()
  const { data: businesses, error } = await admin
    .from('businesses')
    .select('id, name, owner_id, subscription_activated_at, merchant_drip_sent')
    .in('subscription_status', ['active', 'trialing'])
    .not('subscription_activated_at', 'is', null)
    .returns<BusinessRow[]>()

  if (error) {
    console.error('[cron merchant-drip]', error)
    void notifyError({
      where: 'cron/merchant-drip',
      message: 'Query failed loading businesses',
      detail: error.message,
    })
    return NextResponse.json({ error: 'query_failed' }, { status: 500 })
  }

  const now = Date.now()
  let sent = 0

  for (const biz of businesses ?? []) {
    const activated = new Date(biz.subscription_activated_at).getTime()
    const daysSince = Math.floor((now - activated) / MS_PER_DAY)
    const dripSent = { ...(biz.merchant_drip_sent ?? {}) }

    const { data: authUser } = await admin.auth.admin.getUserById(biz.owner_id)
    const email = authUser?.user?.email
    if (!email) continue

    const { data: profile } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', biz.owner_id)
      .maybeSingle()

    const vars = merchantEmailVars({
      first_name: profile?.display_name ?? 'there',
      business_name: biz.name,
    })

    for (const { key, days } of MERCHANT_DRIP_SCHEDULE) {
      if (daysSince < days || dripSent[key]) continue

      await sendTransactional(key, email, vars)
      dripSent[key] = true
      sent += 1

      await admin
        .from('businesses')
        .update({ merchant_drip_sent: dripSent })
        .eq('id', biz.id)
    }
  }

  return NextResponse.json({ ok: true, sent })
}
