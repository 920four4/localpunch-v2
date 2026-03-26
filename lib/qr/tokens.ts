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

export { TTL_SECONDS }
