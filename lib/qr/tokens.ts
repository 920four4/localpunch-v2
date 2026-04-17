import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'crypto'
import type { QrTokenPayload } from '@/lib/types'

const TTL_SECONDS = 300 // 5 minutes

function getSecret(): Uint8Array {
  const secret = process.env.QR_SIGNING_SECRET
  if (!secret) throw new Error('QR_SIGNING_SECRET env var not set')
  return new TextEncoder().encode(secret)
}

export async function signQrToken(payload: Omit<QrTokenPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + TTL_SECONDS)
    .sign(secret)
}

export async function verifyQrToken(token: string): Promise<QrTokenPayload> {
  const secret = getSecret()
  const { payload } = await jwtVerify<QrTokenPayload>(token, secret)
  return payload as QrTokenPayload
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Build the public claim URL that gets encoded into the counter-side QR code.
// Scanning with any phone camera opens this URL directly in the browser —
// no app install, no in-app scanner required.
export function buildPunchUrl(token: string, origin?: string): string {
  const base =
    origin ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'https://localpunch-v2.vercel.app'
  return `${base.replace(/\/$/, '')}/p/${token}`
}

// Accepts either a raw JWT (old QR format) or a full /p/<token> URL (new
// format) and returns the JWT. Used by the in-app scanner for back-compat.
export function extractTokenFromScan(scanned: string): string {
  const trimmed = scanned.trim()
  if (trimmed.startsWith('http')) {
    try {
      const u = new URL(trimmed)
      const last = u.pathname.split('/').filter(Boolean).pop()
      if (last) return last
    } catch {
      // fall through
    }
  }
  return trimmed
}

export { TTL_SECONDS }
