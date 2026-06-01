import { NextRequest, NextResponse } from 'next/server'
import { getSvixHeaders, verifySvixSignature } from '@/lib/telegram/webhook-verify'
import { notifyEmailEvent } from '@/lib/telegram/notify'

/**
 * Turns Resend email events into Telegram alerts. Only the "you should know"
 * events (bounces, spam complaints, delivery delays, failures) are forwarded in
 * real time — opens/clicks/delivered would be noisy.
 *
 * Setup:
 *   1. Resend dashboard → Webhooks → add endpoint:
 *        https://www.localpunchcard.io/api/resend/webhook
 *      Subscribe to: email.bounced, email.complained,
 *                    email.delivery_delayed, email.failed
 *   2. Copy the signing secret (whsec_…) into env as RESEND_WEBHOOK_SECRET.
 */
export const dynamic = 'force-dynamic'

const ALERT_ON: Record<string, 'bounced' | 'complained' | 'delivery_delayed' | 'failed'> = {
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.delivery_delayed': 'delivery_delayed',
  'email.failed': 'failed',
}

export async function POST(request: NextRequest) {
  const raw = await request.text()
  const secret = process.env.RESEND_WEBHOOK_SECRET

  // Verify signature when a secret is configured (strongly recommended).
  if (secret && !verifySvixSignature(raw, getSvixHeaders(request.headers), secret)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 })
  }

  let event: {
    type?: string
    data?: {
      to?: string | string[]
      subject?: string
      reason?: string
      bounce?: { message?: string; type?: string }
    }
  }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const kind = event?.type ? ALERT_ON[event.type] : undefined
  if (kind) {
    const data = event.data || {}
    const to = Array.isArray(data.to) ? data.to.join(', ') : data.to
    const reason = data.bounce?.message || data.bounce?.type || data.reason || event.type
    await notifyEmailEvent({ type: kind, to, subject: data.subject, reason })
  }

  // Always 200 so Resend doesn't retry events we intentionally ignore.
  return NextResponse.json({ ok: true })
}
