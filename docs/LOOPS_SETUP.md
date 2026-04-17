# Loops setup for LocalPunch

One-time setup. Takes ~45 minutes end to end. The Loops CLI automates the
tedious part (contact properties); the rest is clicking around the dashboard.

Sending address: `localpunch@920four.com`.

---

## 1. Create the Loops account + team

1. Sign up at https://loops.so.
2. Create a team called **localpunch** (different from `sportscal`, if that's
   your existing team).
3. Subscribe to a plan that includes custom domains (Pro or higher).

## 2. Verify the sending domain `920four.com`

Loops needs to prove you own the domain before it will send from it.

1. Dashboard → **Settings → Sending domains → Add domain**.
2. Enter `920four.com`.
3. Loops gives you **3 DNS records** to add (1 SPF TXT, 2 DKIM CNAMEs).
4. Add them in whoever hosts DNS for `920four.com` (Cloudflare, Namecheap,
   Route 53, etc.).
5. Come back to Loops and click **Verify**. Propagation can take 5–60 minutes.
6. Once green, you can send from anything `@920four.com`.

> Tip: also set a DMARC record (`_dmarc.920four.com` TXT:
> `v=DMARC1; p=none; rua=mailto:postmaster@920four.com`) so Gmail/Outlook
> don't tag you as suspicious.

## 3. Default sending settings (account-level)

Dashboard → **Settings → Sending settings**:

- **Default from name:** `LocalPunch`
- **Default from address:** `localpunch@920four.com`
- **Default reply-to:** `localpunch@920four.com`

Each transactional template inherits this, so you won't need to set it per
email (unless you want to override).

## 4. Generate an API key

Dashboard → **Settings → API → Create API key**. Name it "Production".
Copy the key (starts with `loops_*`).

Paste it into two places:

```bash
# Local dev
echo 'LOOPS_API_KEY="loops_xxx"' >> .env.local

# Production
vercel env add LOOPS_API_KEY production
# paste when prompted; repeat with `preview` if you want preview envs to send
```

## 5. Bootstrap contact properties via CLI

Authenticate the CLI for the new team:

```bash
loops auth login --name localpunch
# paste the same API key when prompted
```

Then run the bootstrap script:

```bash
./scripts/loops-bootstrap.sh
```

This creates ~35 custom contact properties across identity, billing, usage,
and attribution dimensions. Verify:

```bash
loops contact-properties list --custom
```

If you see all of them, you're good. The script is idempotent — run it again
any time we add a new property.

## 6. Create mailing lists (UI, one-time)

Dashboard → **Audience → Mailing lists → New list**. Create these three:

| Name                          | Purpose                                         | Default subscribed? |
| ----------------------------- | ----------------------------------------------- | ------------------- |
| `merchants-product-updates`   | Newsletter for merchants only                   | Yes (opt-out)       |
| `customers-product-updates`   | Newsletter for customers who provided an email  | Yes                 |
| `merchants-onboarding-drip`   | Internal list for the 5-email drip audience     | No (managed by app) |

Copy each list ID (it's in the URL after `/lists/`). If you want the app to
auto-manage list memberships later, drop them into `.env.local` as
`LOOPS_LIST_*` vars — not required for v1.

## 7. Create the 8 transactional templates

Dashboard → **Transactional → New transactional email**. For each one:

1. Title it with the `key` from the matching markdown file (e.g.
   `merchantWelcome`).
2. Copy subject + preview text from the front-matter.
3. Paste the body into the editor. Replace each `{{var}}` with a Loops
   dynamic tag (type `{` to pop the inserter).
4. Sending settings: leave defaults — they inherit `localpunch@920four.com`.
5. Click **Publish**.
6. Copy the transactional ID from the URL (`/transactional/<ID>`). Paste into
   `.env.local` + Vercel as the matching `LOOPS_TX_*` var.

The 8 templates map to:

| Env var                              | Source file                                   |
| ------------------------------------ | --------------------------------------------- |
| `LOOPS_TX_MERCHANT_WELCOME`          | `emails/merchant/01-welcome.md`               |
| `LOOPS_TX_MERCHANT_DAY1`             | `emails/merchant/02-day1-first-punch.md`      |
| `LOOPS_TX_MERCHANT_DAY3`             | `emails/merchant/03-day3-growing.md`          |
| `LOOPS_TX_MERCHANT_DAY7`             | `emails/merchant/04-day7-qr-placement.md`     |
| `LOOPS_TX_MERCHANT_DAY14`            | `emails/merchant/05-day14-power-tips.md`      |
| `LOOPS_TX_MERCHANT_PAYMENT_FAILED`   | `emails/merchant/06-payment-failed.md`        |
| `LOOPS_TX_MERCHANT_CANCELED`         | `emails/merchant/07-canceled.md`              |
| `LOOPS_TX_CUSTOMER_WELCOME`          | `emails/customer/01-welcome.md`               |

## 8. Build the 5-email merchant drip as a Loop (recommended)

Dashboard → **Loops → New Loop**.

- **Trigger:** Event → `merchant_activated`
- **Audience filter:** `userGroup` is `merchant`

Then add 5 email steps:

| Step | Delay       | Email template              |
| ---- | ----------- | --------------------------- |
| 1    | Immediately | `merchantWelcome`           |
| 2    | 1 day       | `merchantDay1FirstPunch`    |
| 3    | 2 days      | `merchantDay3Growing`       |
| 4    | 4 days      | `merchantDay7QrPlacement`   |
| 5    | 7 days      | `merchantDay14PowerTips`    |

Click **Publish**. The drip now fires automatically whenever the Stripe
webhook sends a `merchant_activated` event.

> Our code also sends `merchantWelcome` as a transactional directly from the
> webhook so the welcome lands in < 5 seconds (doesn't wait for the Loop
> queue). The Loop's email 1 is redundant — turn it off, or remove step 1
> entirely. The Day 1+ emails are what you want the Loop to handle.

## 9. One-off event-triggered emails

Besides the drip, our webhook fires these events:

| Event                          | Suggested setup                         |
| ------------------------------ | --------------------------------------- |
| `merchant_signed_up`           | Internal Slack notification via Zapier  |
| `merchant_activated`           | Triggers the drip (see step 8)          |
| `merchant_reactivated`         | Short "welcome back" Loop (optional)    |
| `merchant_payment_failed`      | Already sent via transactional          |
| `merchant_churned`             | Already sent via transactional          |
| `customer_signed_up`           | Already sent via transactional          |

If you want Slack pings on signup/churn, the cleanest path is:
Loops → Integrations → Zapier → Slack, filtered on event name.

## 10. Test

After everything is wired, force a test event to confirm:

```bash
# Send yourself the merchant welcome to verify domain + rendering
loops transactional send \
  --id "$LOOPS_TX_MERCHANT_WELCOME" \
  --email you@yourdomain.com \
  --var first_name=Z \
  --var business_name="Test Coffee Co" \
  --var plan_label="Monthly (\$60/mo)" \
  --var dashboard_url="https://localpunch-v2.vercel.app/merchant" \
  --var qr_url="https://localpunch-v2.vercel.app/merchant/qr"
```

If it arrives from `localpunch@920four.com` with the right content, you're
done. Now trigger a live Stripe checkout in test mode and confirm the real
flow fires.

## 11. Where things are in code

- `lib/loops.ts` — client + type definitions
- `scripts/loops-bootstrap.sh` — property creation
- `app/api/stripe/webhook/route.ts` — fires merchant events from Stripe
- `app/api/merchant/signup-event/route.ts` — fires `merchant_signed_up`
- `app/api/customer/add-email/route.ts` — fires `customer_signed_up` +
  `customerWelcome` transactional
- `emails/` — source-of-truth copy for every template
