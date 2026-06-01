/**
 * Verify a Svix-signed webhook (Resend uses Svix) without the `svix` package.
 * Resend sends three headers — svix-id, svix-timestamp, svix-signature — and a
 * signing secret that looks like `whsec_…`. This recomputes the HMAC and does a
 * constant-time compare, with a timestamp tolerance to blunt replay attacks.
 */
import { createHmac, timingSafeEqual } from 'crypto'

export interface SvixHeaders {
  id: string | null
  timestamp: string | null
  signature: string | null
}

export function getSvixHeaders(headers: Headers): SvixHeaders {
  return {
    id: headers.get('svix-id') || headers.get('webhook-id'),
    timestamp: headers.get('svix-timestamp') || headers.get('webhook-timestamp'),
    signature: headers.get('svix-signature') || headers.get('webhook-signature'),
  }
}

/**
 * @param payload  the RAW request body string (do not JSON.parse first)
 * @param headers  the svix-* headers
 * @param secret   your `whsec_…` signing secret
 * @param toleranceSec  reject timestamps older/newer than this (default 5 min)
 */
export function verifySvixSignature(
  payload: string,
  headers: SvixHeaders,
  secret: string,
  toleranceSec = 300
): boolean {
  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature || !secret) return false

  // Replay window.
  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > toleranceSec) return false

  // Secret is base64 after the `whsec_` prefix.
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${payload}`).digest('base64')

  // Header is a space-separated list of "v1,<sig>" entries.
  const expectedBuf = Buffer.from(expected)
  return signature
    .split(' ')
    .map((part) => part.split(',')[1] || part)
    .some((sig) => {
      const sigBuf = Buffer.from(sig)
      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)
    })
}
