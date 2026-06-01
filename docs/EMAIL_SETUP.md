# Email setup (Resend)

All LocalPunch email goes through **Resend** with the same branded design (yellow logo, white card, CTA buttons).

| Channel | How it sends |
| --- | --- |
| **Auth** (magic link, confirm, recovery, etc.) | Supabase Auth → Resend SMTP → HTML in `supabase/templates/*.html` |
| **Product** (welcome, drip, billing, wallet) | `lib/email.ts` → Resend API → markdown in `emails/` |

**From:** `LocalPunch <auth@localpunchcard.io>`

## Environment variables

```bash
# Resend API key (same key used for Supabase SMTP password)
RESEND_API_KEY=re_...
# or
RESEND_SMTP_PASSWORD=re_...

# Optional overrides
RESEND_FROM_EMAIL=auth@localpunchcard.io
RESEND_REPLY_TO=auth@localpunchcard.io

# Merchant drip cron
CRON_SECRET=...
```

## Auth templates (Supabase)

Push HTML to hosted Supabase:

```bash
python3 scripts/supabase-email-templates-push.py
python3 scripts/supabase-smtp-config.py
```

See `docs/AUTH_EMAIL_SETUP.md` for auth-specific steps.

## Merchant drip cron

Vercel Cron (daily) hits `/api/cron/merchant-drip` with `Authorization: Bearer $CRON_SECRET`. Sends day 1 / 3 / 7 / 14 emails after `subscription_activated_at`.

## Preview

```bash
node scripts/send-email-previews.mjs z@920four.com
```
