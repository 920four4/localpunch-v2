# LocalPunch emails

This folder is the source of truth for the copy of every Loops email. The
Loops CLI/API cannot yet create template content — you'll paste each email's
body into the Loops email editor manually. Once created, copy the template
ID back into `.env.local` / Vercel (see `.env.local` for the variable names).

| Key in `lib/loops.ts`         | Env var                         | File                                        | Trigger                                    |
| ----------------------------- | ------------------------------- | ------------------------------------------- | ------------------------------------------ |
| `merchantWelcome`             | `LOOPS_TX_MERCHANT_WELCOME`     | `merchant/01-welcome.md`                    | Sent immediately on first activation       |
| `merchantDay1FirstPunch`      | `LOOPS_TX_MERCHANT_DAY1`        | `merchant/02-day1-first-punch.md`           | Day 1 of drip (via Loop Builder)           |
| `merchantDay3Growing`         | `LOOPS_TX_MERCHANT_DAY3`        | `merchant/03-day3-growing.md`               | Day 3 of drip                              |
| `merchantDay7QrPlacement`     | `LOOPS_TX_MERCHANT_DAY7`        | `merchant/04-day7-qr-placement.md`          | Day 7 of drip                              |
| `merchantDay14PowerTips`      | `LOOPS_TX_MERCHANT_DAY14`       | `merchant/05-day14-power-tips.md`           | Day 14 of drip                             |
| `merchantPaymentFailed`       | `LOOPS_TX_MERCHANT_PAYMENT_FAILED` | `merchant/06-payment-failed.md`          | Stripe `invoice.payment_failed`            |
| `merchantCanceled`            | `LOOPS_TX_MERCHANT_CANCELED`    | `merchant/07-canceled.md`                   | Subscription fully canceled                |
| `customerWelcome`             | `LOOPS_TX_CUSTOMER_WELCOME`     | `customer/01-welcome.md`                    | Customer adds an email to their wallet     |

### How to wire the 5-email merchant drip

Two options:

**Option A — Loop Builder (recommended).** Create ONE Loop triggered by the
event `merchant_activated`. Add 5 emails in sequence with delays:

- Email 1: immediately (the welcome)
- Wait 1 day
- Email 2: first-punch guide
- Wait 2 days
- Email 3: growing your list
- Wait 4 days
- Email 4: QR placement
- Wait 7 days
- Email 5: power tips + feedback

In this mode the transactional IDs for day 1–14 are optional (the Loop
sends them automatically). The code still fires `sendTransactional('merchantWelcome', ...)`
so the welcome lands instantly without waiting for the event queue.

**Option B — Send all 5 as transactional on schedule.** Use a scheduled
worker/cron that reads `businesses` with `subscription_status='active'` and
sends the matching email after N days. Only use this if you don't want to
maintain a Loop in the UI. More moving parts — not recommended.

### Sending settings (set per-email in Loops)

- **From name:** `LocalPunch`
- **From address:** `localpunch@920four.com`
- **Reply-to:** `localpunch@920four.com`
- **Preview text:** see each file's front-matter

### Dynamic variables

Each email's `dataVariables` block documents what the template expects. In the
Loops editor, use `{{variable_name}}` syntax.
