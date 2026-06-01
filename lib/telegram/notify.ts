/**
 * Telegram Insights — drop-in notifier (topic-aware, zero dependencies).
 * ---------------------------------------------------------------------
 * One shared bot posts every app's events into a single Telegram group, with
 * each app routed to its own forum *topic*. Copy this file into an app, set the
 * env vars below, and call `notify(...)` or one of the typed helpers anywhere.
 *
 *   TELEGRAM_BOT_TOKEN   from @BotFather — SAME token in every app
 *   TELEGRAM_CHAT_ID     the group id, e.g. -1001234567890 — SAME in every app
 *   TELEGRAM_TOPIC_ID    this app's topic (message_thread_id) — DIFFERENT per app
 *   NOTIFY_APP_NAME      label shown on each message, e.g. "ProposalKit"
 *
 * If TELEGRAM_TOPIC_ID is unset the message lands in the group's General topic.
 * Run `node scripts/telegram-setup.mjs` to discover your chat id + topic ids.
 *
 * Always best-effort: never throws, no-ops when env is missing, so it can sit
 * inline in any request handler without risk of breaking the request.
 */

type Field = string | number | null | undefined

export interface NotifyOptions {
  /** Headline, e.g. "New signup" or "Payment received". */
  title: string
  /** Small detail rows shown under the title. */
  fields?: Record<string, Field>
  /** Leading emoji for quick scanning in a busy group. */
  emoji?: string
  /** Override the app label (defaults to NOTIFY_APP_NAME). */
  app?: string
  /** Override the topic (defaults to TELEGRAM_TOPIC_ID). */
  topicId?: string | number
  /** Optional link rendered as a tappable line. */
  url?: { label: string; href: string }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildMessage(opts: NotifyOptions, app: string): string {
  const lines: string[] = []
  const head = `${opts.emoji ? `${opts.emoji} ` : ''}<b>${escapeHtml(opts.title)}</b>`
  lines.push(head)
  lines.push(`<i>${escapeHtml(app)}</i>`)

  const fields = opts.fields || {}
  const rows = Object.entries(fields).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== ''
  )
  if (rows.length) {
    lines.push('')
    for (const [k, v] of rows) {
      lines.push(`<b>${escapeHtml(k)}:</b> ${escapeHtml(String(v))}`)
    }
  }
  if (opts.url) {
    lines.push('')
    lines.push(`<a href="${escapeHtml(opts.url.href)}">${escapeHtml(opts.url.label)}</a>`)
  }
  return lines.join('\n')
}

/** Send a notification to this app's Telegram topic. Best-effort. */
export async function notify(opts: NotifyOptions): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const app = opts.app || process.env.NOTIFY_APP_NAME || 'app'
  const topicId = opts.topicId ?? process.env.TELEGRAM_TOPIC_ID

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: buildMessage(opts, app),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }
  // Route into a forum topic when configured; omit for the General topic.
  if (topicId !== undefined && topicId !== null && String(topicId).trim() !== '') {
    body.message_thread_id = Number(topicId)
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('Telegram notify failed:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('Telegram notify error:', err)
  }
}

/** Quick connectivity check — returns ok/error without throwing. */
export async function testTelegram(): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token) return { ok: false, error: 'TELEGRAM_BOT_TOKEN not set' }
  if (!chatId) return { ok: false, error: 'TELEGRAM_CHAT_ID not set' }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    if (!res.ok) return { ok: false, error: `Telegram API returned ${res.status}` }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Connection failed' }
  }
}

// ───────────────────────────── Typed event helpers ─────────────────────────────
// Thin wrappers so every app reports the same events with the same shape. Use
// these instead of raw notify() so your group reads consistently across apps.

function formatMoney(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toLocaleString('en-US')} ${currency}`
  }
}

/** A new user / workspace signed up. */
export function notifySignup(p: {
  email?: string
  name?: string
  plan?: string
  url?: { label: string; href: string }
}): Promise<void> {
  return notify({
    title: 'New signup',
    emoji: '🎉',
    fields: { Email: p.email, Name: p.name, Plan: p.plan },
    url: p.url,
  })
}

/** A payment was received (one-off or invoice). `amount` is in major units (e.g. dollars). */
export function notifyPayment(p: {
  amount: number
  currency?: string
  customer?: string
  item?: string
  url?: { label: string; href: string }
}): Promise<void> {
  return notify({
    title: 'Payment received',
    emoji: '💰',
    fields: {
      Amount: formatMoney(p.amount, p.currency),
      Customer: p.customer,
      Item: p.item,
    },
    url: p.url,
  })
}

/** A subscription started, changed plan, or canceled. */
export function notifySubscription(p: {
  plan: string
  account?: string
  kind?: 'started' | 'upgraded' | 'downgraded' | 'canceled'
}): Promise<void> {
  const kind = p.kind || 'started'
  const titles: Record<string, string> = {
    started: 'New subscription',
    upgraded: 'Plan upgraded',
    downgraded: 'Plan downgraded',
    canceled: 'Subscription canceled',
  }
  return notify({
    title: titles[kind] || 'Subscription update',
    emoji: kind === 'canceled' ? '👋' : '⭐',
    fields: { Plan: p.plan, Account: p.account },
  })
}

/** Something broke — surface it so you hear about it in the group. */
export function notifyError(p: {
  message: string
  where?: string
  detail?: string
}): Promise<void> {
  return notify({
    title: 'Error',
    emoji: '🚨',
    fields: { Where: p.where, Message: p.message, Detail: p.detail },
  })
}

/** Daily rollup. Used by the digest cron; safe to call directly too. */
export function notifyDigest(p: {
  day: string
  visitors?: number
  signups?: number
  payments?: number
  revenue?: number
  currency?: string
  extra?: Record<string, Field>
}): Promise<void> {
  return notify({
    title: `Daily digest — ${p.day}`,
    emoji: '📊',
    fields: {
      'Site visitors': p.visitors,
      'New signups': p.signups,
      Payments: p.payments,
      Revenue: p.revenue != null ? formatMoney(p.revenue, p.currency) : undefined,
      ...(p.extra || {}),
    },
  })
}

/** A contact / lead / support form was submitted. */
export function notifyContact(p: {
  name?: string
  email?: string
  subject?: string
  message?: string
  url?: { label: string; href: string }
}): Promise<void> {
  // Trim long messages so the chat stays scannable.
  const msg = p.message && p.message.length > 500 ? `${p.message.slice(0, 500)}…` : p.message
  return notify({
    title: 'New contact request',
    emoji: '📩',
    fields: { Name: p.name, Email: p.email, Subject: p.subject, Message: msg },
    url: p.url,
  })
}

/**
 * An email-provider event worth knowing about — Resend bounces, spam
 * complaints, delivery delays, hard failures. (Don't pipe every delivered/open
 * event here; those belong in the daily digest. See api/resend-webhook.ts.)
 */
export function notifyEmailEvent(p: {
  type: 'bounced' | 'complained' | 'delivery_delayed' | 'failed' | (string & {})
  to?: string
  subject?: string
  reason?: string
}): Promise<void> {
  const meta: Record<string, { title: string; emoji: string }> = {
    bounced: { title: 'Email bounced', emoji: '📭' },
    complained: { title: 'Spam complaint', emoji: '🚫' },
    delivery_delayed: { title: 'Email delivery delayed', emoji: '🐢' },
    failed: { title: 'Email failed', emoji: '⚠️' },
  }
  const m = meta[p.type] || { title: `Email: ${p.type}`, emoji: '✉️' }
  return notify({
    title: m.title,
    emoji: m.emoji,
    fields: { To: p.to, Subject: p.subject, Reason: p.reason },
  })
}

/** A payment failed — card declined, dunning, subscription past_due. */
export function notifyFailedPayment(p: {
  amount?: number
  currency?: string
  customer?: string
  reason?: string
}): Promise<void> {
  return notify({
    title: 'Payment failed',
    emoji: '❌',
    fields: {
      Amount: p.amount != null ? formatMoney(p.amount, p.currency) : undefined,
      Customer: p.customer,
      Reason: p.reason,
    },
  })
}

/** A refund was issued. */
export function notifyRefund(p: {
  amount: number
  currency?: string
  customer?: string
  reason?: string
}): Promise<void> {
  return notify({
    title: 'Refund issued',
    emoji: '↩️',
    fields: { Amount: formatMoney(p.amount, p.currency), Customer: p.customer, Reason: p.reason },
  })
}

/** A chargeback / dispute was opened — usually needs a fast response. */
export function notifyDispute(p: {
  amount?: number
  currency?: string
  customer?: string
  reason?: string
}): Promise<void> {
  return notify({
    title: 'Dispute opened',
    emoji: '🚨',
    fields: {
      Amount: p.amount != null ? formatMoney(p.amount, p.currency) : undefined,
      Customer: p.customer,
      Reason: p.reason,
    },
  })
}

/** A milestone was hit — 100th signup, $10k revenue, etc. Worth celebrating. */
export function notifyMilestone(p: { label: string; value?: string | number }): Promise<void> {
  return notify({ title: p.label, emoji: '🏆', fields: { Reached: p.value } })
}
