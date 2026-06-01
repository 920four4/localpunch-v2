/**
 * Visit-tracking helpers — privacy-friendly, cookie-less, zero external deps.
 * One unique visitor per UTC day = sha256(salt + day + ip + user-agent), so no
 * raw IPs are ever stored. Used by ../api/track-view.ts and the digest query.
 */
import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'

/** Salt for visitor hashes. Reuses the service-role key if ANALYTICS_SALT is unset. */
export function getAnalyticsSalt(): string {
  return (
    process.env.ANALYTICS_SALT ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'telegram-insights-dev-salt'
  )
}

/** One-way hash; first 32 hex chars are plenty for a daily-unique counter. */
export function hashAnalyticsValue(raw: string): string {
  return createHash('sha256').update(`${getAnalyticsSalt()}:${raw}`).digest('hex').slice(0, 32)
}

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Simple per-instance rate limit so the public beacon can't be hammered.
type Bucket = { count: number; reset: number }
const buckets = new Map<string, Bucket>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true }
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.reset - now) / 1000) }
  }
  bucket.count++
  return { ok: true }
}
