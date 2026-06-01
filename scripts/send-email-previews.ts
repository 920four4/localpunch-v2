#!/usr/bin/env npx tsx
/**
 * Send preview copies of every email via Resend.
 *   npm run email:preview -- z@920four.com
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  getResendApiKey,
  merchantEmailVars,
  sendTransactional,
  type TransactionalKey,
} from '../lib/email'

function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let val = trimmed.slice(eq + 1)
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

async function main() {
loadEnvLocal()

const to = process.argv[2] || 'z@920four.com'
const apiKey = getResendApiKey()
if (!apiKey) {
  console.error('Missing RESEND_API_KEY or RESEND_SMTP_PASSWORD in .env.local')
  process.exit(1)
}

const keys: TransactionalKey[] = [
  'merchantWelcome',
  'merchantDay1FirstPunch',
  'merchantDay3Growing',
  'merchantDay7QrPlacement',
  'merchantDay14PowerTips',
  'merchantPaymentFailed',
  'merchantCanceled',
  'customerWelcome',
  'customerOneAway',
  'customerRewardReady',
]

const vars = merchantEmailVars({
  first_name: 'Zlatko',
  business_name: 'Demo Coffee Roasters',
  plan_label: 'Pro',
  reward: 'Free coffee',
})

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

console.log(`Sending ${keys.length} branded previews to ${to}\n`)

for (const key of keys) {
  await sendTransactional(key, to, vars)
  console.log(`✓ ${key}`)
  await sleep(500)
}

const sampleUrl =
  'https://www.localpunchcard.io/auth/callback?token=preview-not-valid'
const authTemplates = [
  'magic_link.html',
  'confirm_signup.html',
  'recovery.html',
  'email_change.html',
  'invite.html',
  'reauthentication.html',
]

for (const file of authTemplates) {
  let html = readFileSync(join(process.cwd(), 'supabase/templates', file), 'utf8')
  html = html
    .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, sampleUrl)
    .replace(/\{\{\s*\.Token\s*\}\}/g, '847291')
    .replace(/\{\{\s*\.Email\s*\}\}/g, to)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'LocalPunch <auth@localpunchcard.io>',
      to: [to],
      subject: `[Preview] ${file.replace('.html', '')}`,
      html,
    }),
  })
  if (!res.ok) console.error(`✗ auth ${file}`, await res.text())
  else console.log(`✓ auth ${file}`)
  await sleep(500)
}

console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
