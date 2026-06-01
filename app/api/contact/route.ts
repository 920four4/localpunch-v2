import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactEmails } from '@/lib/email'
import { notifyContact } from '@/lib/telegram/notify'
import { clientIp, rateLimit } from '@/lib/telegram/visits'

/**
 * Public contact form endpoint. Validates the submission, emails the team +
 * acknowledges the customer via Resend, and pings the Telegram group. Rate
 * limited per IP. Honeypot field (`company`) silently drops bots.
 */
export const dynamic = 'force-dynamic'

const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(200),
  subject: z.string().trim().max(160).optional(),
  message: z.string().trim().min(1, 'Message is required').max(4000),
  // Honeypot — real users never fill this.
  company: z.string().max(0).optional().or(z.literal('')),
})

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  if (!rateLimit(`contact:${ip}`, 5, 60 * 1000).ok) {
    return NextResponse.json({ error: 'Too many requests, try again shortly.' }, { status: 429 })
  }

  const json = await request.json().catch(() => null)
  const parsed = ContactSchema.safeParse(json)
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Invalid submission'
    return NextResponse.json({ error: first }, { status: 400 })
  }

  // Honeypot tripped — pretend success, do nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true })
  }

  const { name, email, subject, message } = parsed.data

  try {
    await sendContactEmails({ name, email, subject, message })
  } catch (err) {
    console.error('[contact] email send failed', err)
    return NextResponse.json(
      { error: 'Could not send your message. Please email us directly.' },
      { status: 502 }
    )
  }

  // Best-effort Telegram ping — never blocks the response.
  const base = process.env.NEXT_PUBLIC_SITE_URL
  void notifyContact({
    name,
    email,
    subject,
    message,
    url: base ? { label: 'Open site', href: base } : undefined,
  })

  return NextResponse.json({ ok: true })
}
