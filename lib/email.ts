/**
 * Resend — all product transactional email (auth uses Supabase SMTP → Resend).
 * Branded shell matches supabase/templates/*.html. See docs/EMAIL_SETUP.md.
 */

import fs from 'node:fs'
import path from 'node:path'
import { markdownToEmailBody } from '@/lib/email-markdown'
import { wrapBrandedEmail } from '@/lib/email-layout'

const RESEND_API = 'https://api.resend.com/emails'

const TEMPLATE_FILES = {
  merchantWelcome: 'emails/merchant/01-welcome.md',
  merchantDay1FirstPunch: 'emails/merchant/02-day1-first-punch.md',
  merchantDay3Growing: 'emails/merchant/03-day3-growing.md',
  merchantDay7QrPlacement: 'emails/merchant/04-day7-qr-placement.md',
  merchantDay14PowerTips: 'emails/merchant/05-day14-power-tips.md',
  merchantPaymentFailed: 'emails/merchant/06-payment-failed.md',
  merchantCanceled: 'emails/merchant/07-canceled.md',
  customerWelcome: 'emails/customer/01-welcome.md',
  customerOneAway: 'emails/customer/02-one-away.md',
  customerRewardReady: 'emails/customer/03-reward-ready.md',
} as const

export type TransactionalKey = keyof typeof TEMPLATE_FILES

export const MERCHANT_DRIP_SCHEDULE: { key: TransactionalKey; days: number }[] = [
  { key: 'merchantDay1FirstPunch', days: 1 },
  { key: 'merchantDay3Growing', days: 3 },
  { key: 'merchantDay7QrPlacement', days: 7 },
  { key: 'merchantDay14PowerTips', days: 14 },
]

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.localpunchcard.io'

export function getEmailFrom(): string {
  const addr = process.env.RESEND_FROM_EMAIL ?? 'auth@localpunchcard.io'
  return `LocalPunch <${addr}>`
}

export function getReplyTo(): string | undefined {
  return (
    process.env.RESEND_REPLY_TO ??
    process.env.RESEND_FROM_EMAIL ??
    'auth@localpunchcard.io'
  )
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendApiKey())
}

export function getResendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY || process.env.RESEND_SMTP_PASSWORD
}

function readTemplate(relPath: string): {
  subject: string
  heading?: string
  previewText?: string
  body: string
} {
  const filePath = path.join(process.cwd(), relPath)
  const raw = fs.readFileSync(filePath, 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error(`Invalid email template frontmatter: ${relPath}`)

  const fm: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    fm[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return {
    subject: fm.subject ?? 'LocalPunch',
    heading: fm.heading,
    previewText: fm.previewText,
    body: match[2].trim(),
  }
}

function substitute(
  template: string,
  vars: Record<string, string | number | boolean>
): string {
  let out = template
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v))
  }
  return out
}

export async function sendTransactional(
  key: TransactionalKey,
  email: string,
  dataVariables: Record<string, string | number | boolean> = {}
): Promise<void> {
  if (!email || !email.includes('@')) {
    console.warn(`[email] sendTransactional(${key}) skipped — no email`)
    return
  }

  const apiKey = getResendApiKey()
  if (!apiKey) {
    console.warn(`[email] sendTransactional(${key}) skipped — Resend API key not set`)
    return
  }

  const relPath = TEMPLATE_FILES[key]
  if (!relPath) {
    console.warn(`[email] sendTransactional(${key}) skipped — unknown key`)
    return
  }

  try {
    const tpl = readTemplate(relPath)
    const subject = substitute(tpl.subject, dataVariables)
    const heading = substitute(tpl.heading ?? tpl.subject, dataVariables)
    const bodyMd = substitute(tpl.body, dataVariables)
    const bodyHtml = markdownToEmailBody(bodyMd)
    const html = wrapBrandedEmail({
      previewText: tpl.previewText,
      heading,
      bodyHtml,
      fromAddress: process.env.RESEND_FROM_EMAIL ?? 'auth@localpunchcard.io',
      siteUrl: SITE,
    })

    const payload: Record<string, unknown> = {
      from: getEmailFrom(),
      to: [email],
      subject,
      html,
    }
    const replyTo = getReplyTo()
    if (replyTo) payload.reply_to = replyTo

    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[email] sendTransactional(${key}) failed (${res.status}):`, text)
    }
  } catch (err) {
    console.error(`[email] sendTransactional(${key}) threw:`, err)
  }
}

/** Team inbox that receives contact-form submissions. */
export function getContactInbox(): string {
  return process.env.CONTACT_INBOX_EMAIL ?? 'localpunchcard@920four.com'
}

/** Reply-to placed on the customer's auto-acknowledgment so replies reach the team. */
export function getContactReplyTo(): string {
  return process.env.CONTACT_REPLY_TO ?? 'localpunchcard@920four.com'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Low-level Resend send for one-off (non-templated) HTML emails. Best-effort. */
async function sendResendEmail(payload: {
  from: string
  to: string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<boolean> {
  const apiKey = getResendApiKey()
  if (!apiKey) {
    console.warn('[email] sendResendEmail skipped — Resend API key not set')
    return false
  }
  try {
    const body: Record<string, unknown> = {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }
    if (payload.replyTo) body.reply_to = payload.replyTo

    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[email] sendResendEmail failed (${res.status}):`, text)
      return false
    }
    return true
  } catch (err) {
    console.error('[email] sendResendEmail threw:', err)
    return false
  }
}

export interface ContactSubmission {
  name: string
  email: string
  subject?: string
  message: string
}

/**
 * Handle a contact-form submission: email the team (reply goes straight to the
 * customer) and send the customer a branded acknowledgment (reply-to is the
 * team inbox). Sent from the verified localpunchcard.io domain. Best-effort.
 */
export async function sendContactEmails(sub: ContactSubmission): Promise<void> {
  const from = `LocalPunch Contact <${
    process.env.RESEND_CONTACT_FROM ?? 'contact@localpunchcard.io'
  }>`
  const subjectLine = sub.subject?.trim() || 'New contact request'
  const safeName = escapeHtml(sub.name)
  const safeEmail = escapeHtml(sub.email)
  const safeSubject = escapeHtml(subjectLine)
  const safeMessage = escapeHtml(sub.message).replace(/\n/g, '<br>')

  // 1. Notify the team — replying goes directly back to the customer.
  const teamHtml = wrapBrandedEmail({
    previewText: `New contact request from ${sub.name}`,
    heading: 'New contact request',
    bodyHtml: `
      <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
    fromAddress: process.env.RESEND_CONTACT_FROM ?? 'contact@localpunchcard.io',
    siteUrl: SITE,
  })
  await sendResendEmail({
    from,
    to: [getContactInbox()],
    subject: `[Contact] ${subjectLine} — ${sub.name}`,
    html: teamHtml,
    replyTo: sub.email,
  })

  // 2. Acknowledge the customer — replies route to the team inbox.
  const ackHtml = wrapBrandedEmail({
    previewText: 'We got your message — the LocalPunch team will be in touch.',
    heading: 'Thanks for reaching out',
    bodyHtml: `
      <p>Hi ${safeName},</p>
      <p>Thanks for contacting LocalPunch — we got your message and someone on the team will get back to you shortly.</p>
      <p style="color:#6B7280"><strong>Your message:</strong><br>${safeMessage}</p>
    `,
    fromAddress: process.env.RESEND_CONTACT_FROM ?? 'contact@localpunchcard.io',
    siteUrl: SITE,
  })
  await sendResendEmail({
    from,
    to: [sub.email],
    subject: 'We got your message — LocalPunch',
    html: ackHtml,
    replyTo: getContactReplyTo(),
  })
}

export function merchantEmailVars(
  overrides: Record<string, string | number | boolean> = {}
) {
  return {
    first_name: 'there',
    business_name: 'your shop',
    plan_label: 'Monthly ($60/mo)',
    dashboard_url: `${SITE}/merchant`,
    qr_url: `${SITE}/merchant/qr`,
    billing_portal_url: `${SITE}/merchant/billing`,
    amount_due: '60.00',
    wallet_url: `${SITE}/wallet`,
    reward: 'your reward',
    ...overrides,
  }
}
