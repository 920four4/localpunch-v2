/**
 * Branded LocalPunch email shell — matches supabase/templates/*.html (Resend auth).
 * Table-based, inline styles for Gmail/Outlook.
 */

const FONT = "'Helvetica Neue',Arial,sans-serif"
const BG = '#FAFAF8'
const CARD_BORDER = '#E7E6DF'
const TEXT = '#1a1a1a'
const MUTED = '#5A554C'
const FOOTER = '#9A9387'
const FOOTER_LIGHT = '#B0AB9E'
const YELLOW = '#FFE566'
const DIVIDER = '#EDEBE3'

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Yellow CTA — same markup as magic_link.html */
export function ctaButton(href: string, label: string): string {
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label).replace(/ →$/, '') + ' &rarr;'
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
<tr><td align="center" style="border-radius:10px;background-color:${YELLOW};">
<a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:700;color:${TEXT};text-decoration:none;border:1px solid ${TEXT};border-radius:10px;">${safeLabel}</a>
</td></tr></table>`
}

export function wrapBrandedEmail(opts: {
  previewText?: string
  heading: string
  bodyHtml: string
  footerNote?: string
  fromAddress?: string
  siteUrl?: string
}): string {
  const preheader = opts.previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(opts.previewText)}</div>`
    : ''
  const fromAddr = opts.fromAddress ?? 'auth@localpunchcard.io'
  const site = opts.siteUrl ?? 'https://www.localpunchcard.io'
  const siteLabel = site.replace(/^https?:\/\//, '')
  const trust = opts.footerNote
    ? `<p style="margin:0 0 6px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${FOOTER};">${opts.footerNote}</p>`
    : `<p style="margin:0 0 6px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${FOOTER};">
Questions? Reply to this email — it goes straight to our team.
</p>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
</head>
<body style="margin:0;padding:0;background-color:${BG};-webkit-text-size-adjust:100%;">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td style="padding:0 4px 20px 4px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:34px;height:34px;vertical-align:middle;"><img src="${site}/apple-icon" width="34" height="34" alt="LocalPunch" style="display:block;border-radius:8px;" /></td>
<td style="padding-left:10px;font-family:${FONT};font-size:18px;font-weight:700;color:${TEXT};letter-spacing:-0.01em;">LocalPunch</td>
</tr></table>
</td></tr>
<tr><td style="background-color:#FFFFFF;border:1px solid ${CARD_BORDER};border-radius:16px;padding:36px 32px;">
<h1 style="margin:0 0 12px 0;font-family:${FONT};font-size:24px;line-height:1.25;font-weight:700;color:${TEXT};letter-spacing:-0.02em;">${escapeHtml(opts.heading)}</h1>
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:24px 8px 0 8px;">
${trust}
<p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6;color:${FOOTER_LIGHT};">
LocalPunch &middot; Digital loyalty cards for local businesses<br />
Sent by ${escapeHtml(fromAddr)}
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

export const emailStyles = {
  p: `margin:0 0 16px 0;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};`,
  pLast: `margin:0;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};`,
  h3: `margin:24px 0 8px 0;font-family:${FONT};font-size:17px;line-height:1.3;font-weight:700;color:${TEXT};letter-spacing:-0.01em;`,
  ul: `margin:0 0 16px 0;padding-left:20px;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};`,
  li: `margin-bottom:8px;`,
  strong: `font-weight:700;color:${TEXT};`,
  link: `color:${MUTED};font-weight:600;`,
  divider: `margin:28px 0 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${FOOTER};border-top:1px solid ${DIVIDER};padding-top:20px;`,
  ol: `margin:0 0 16px 0;padding-left:20px;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED};`,
}
