/** GA4 measurement ID — override with NEXT_PUBLIC_GA_MEASUREMENT_ID */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-1M5B0X50Z8'

/** Measurement Protocol API secret (server-only). Create in GA4 → Admin → Data streams → MP API secrets */
export const GA_API_SECRET = process.env.GA4_API_SECRET ?? ''

export const GA_MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect'

export function isGaEnabled(): boolean {
  return Boolean(GA_MEASUREMENT_ID)
}

export function isServerGaEnabled(): boolean {
  return Boolean(GA_MEASUREMENT_ID && GA_API_SECRET)
}
