/**
 * SMS sender — thin Twilio REST wrapper, no SDK dependency.
 *
 * Mirrors lib/loops.ts: "fire and forget" from the caller's view. If the
 * Twilio env vars aren't set, sendSms() no-ops and returns
 * { sent: false, reason: 'not_configured' } with a console warning — so the
 * SMS-confirm redemption path can ship ahead of a Twilio account and the
 * merchant simply falls back to lookup-confirm.
 *
 * Note: customer auth OTP SMS is sent by Supabase using its own configured
 * provider. This wrapper is for app-initiated transactional SMS (the
 * merchant-sent redemption confirm link), which Supabase does not expose.
 *
 * Required env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  )
}

type SmsResult =
  | { sent: true }
  | { sent: false; reason: 'not_configured' | 'error'; detail?: string }

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER

  if (!sid || !token || !from) {
    console.warn('[sms] send skipped — Twilio env not set')
    return { sent: false, reason: 'not_configured' }
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    )
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[sms] Twilio error', res.status, detail)
      return { sent: false, reason: 'error', detail }
    }
    return { sent: true }
  } catch (err) {
    console.error('[sms] send failed', err)
    return { sent: false, reason: 'error' }
  }
}
