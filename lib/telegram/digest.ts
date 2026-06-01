/**
 * Reusable daily-digest cron skeleton.
 * ------------------------------------
 * Handles the boring, identical parts — Vercel Cron auth, the previous-UTC-day
 * window, and posting to Telegram — and lets each app plug in its own metrics
 * query. See ../api/daily-digest.ts for how to wire it into a route.
 */
import { NextRequest, NextResponse } from 'next/server'
import { notifyDigest } from './notify'

export interface DigestRange {
  /** Start of the previous full UTC day (inclusive). */
  start: Date
  /** End of the previous full UTC day == start of today UTC (exclusive). */
  end: Date
  /** "YYYY-MM-DD" for the day being summarized. */
  day: string
}

export interface DigestMetrics {
  visitors?: number
  signups?: number
  payments?: number
  revenue?: number
  currency?: string
  /** Any extra rows you want in the digest, e.g. { 'Trials started': 3 }. */
  extra?: Record<string, string | number | null | undefined>
}

/**
 * Build a Next.js route handler for the daily digest. Pass a function that
 * returns the numbers for the given day; everything else is handled for you.
 *
 *   export const GET = createDailyDigestHandler(async ({ start, end, day }) => {
 *     // ...your Supabase queries...
 *     return { visitors, signups, payments, revenue }
 *   })
 */
export function createDailyDigestHandler(
  getMetrics: (range: DigestRange) => Promise<DigestMetrics>
) {
  return async function GET(request: NextRequest) {
    if (
      process.env.CRON_SECRET &&
      request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Previous full UTC day.
    const now = new Date()
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
    const day = start.toISOString().slice(0, 10)

    let metrics: DigestMetrics = {}
    try {
      metrics = await getMetrics({ start, end, day })
    } catch (err) {
      console.error('Daily digest metrics failed:', err)
      return NextResponse.json({ error: 'metrics failed' }, { status: 500 })
    }

    await notifyDigest({ day, ...metrics })

    return NextResponse.json({ ok: true, day, ...metrics })
  }
}
