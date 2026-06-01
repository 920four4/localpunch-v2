import { NextRequest, NextResponse } from 'next/server'
import { clientIp, rateLimit, hashAnalyticsValue } from '@/lib/telegram/visits'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Cookie-less site-visit beacon. Counts one unique visitor per UTC day
 * (hashed IP+UA). Always returns ok — never blocks the page. <TrackView />
 * POSTs here on each navigation.
 */
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const rl = rateLimit(`view:${ip}`, 120, 60 * 1000)
  if (!rl.ok) return NextResponse.json({ ok: true })

  const { path } = await request.json().catch(() => ({}))
  const ua = request.headers.get('user-agent') || ''
  const day = new Date().toISOString().slice(0, 10)
  const visitorHash = hashAnalyticsValue(`${day}:${ip}:${ua}`)

  try {
    const supabase = await createAdminClient()
    await supabase.from('site_visits').upsert(
      {
        day,
        visitor_hash: visitorHash,
        first_path: typeof path === 'string' ? path.slice(0, 200) : null,
      },
      { onConflict: 'day,visitor_hash', ignoreDuplicates: true }
    )
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true })
}
