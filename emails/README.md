# LocalPunch emails (Resend)

Copy lives in `emails/**/*.md`. `lib/email.ts` renders branded HTML (same shell as auth emails in `supabase/templates/`) and sends via the Resend API.

**From address:** `auth@localpunchcard.io` (Supabase Auth SMTP + transactional API).

| Key | File | Trigger |
| --- | --- | --- |
| `merchantWelcome` | `merchant/01-welcome.md` | First subscription activation |
| `merchantDay1FirstPunch` | `merchant/02-day1-first-punch.md` | Drip day 1 (`/api/cron/merchant-drip`) |
| `merchantDay3Growing` | `merchant/03-day3-growing.md` | Drip day 3 |
| `merchantDay7QrPlacement` | `merchant/04-day7-qr-placement.md` | Drip day 7 |
| `merchantDay14PowerTips` | `merchant/05-day14-power-tips.md` | Drip day 14 |
| `merchantPaymentFailed` | `merchant/06-payment-failed.md` | Stripe `invoice.payment_failed` |
| `merchantCanceled` | `merchant/07-canceled.md` | Subscription canceled |
| `customerWelcome` | `customer/01-welcome.md` | Customer adds email in wallet |
| `customerOneAway` | `customer/02-one-away.md` | One punch from reward |
| `customerRewardReady` | `customer/03-reward-ready.md` | Card completed |

### Markdown conventions

- `heading` in frontmatter → large title in the white card (like auth emails).
- Link alone on its own line → yellow CTA button.
- `###` → section subheading inside the card.

### Preview all emails

```bash
node scripts/send-email-previews.mjs you@example.com
```

See `docs/EMAIL_SETUP.md`.
