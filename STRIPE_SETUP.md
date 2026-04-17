# Stripe setup

Everything you need to wire Stripe to LocalPunch. Should take ~10 minutes.

## 1. Create the product and prices

Stripe dashboard → **Products** → **+ Add product**.

- **Name:** LocalPunch Merchant
- **Description:** Digital loyalty cards for local businesses.

Under **Pricing**, click **+ Add another price** to get two recurring prices:

| Price      | Amount | Billing period    |
| ---------- | ------ | ----------------- |
| Monthly    | $60.00 | Recurring · Monthly |
| Yearly     | $600.00 | Recurring · Yearly |

Save. On the product page, copy the price IDs (they start with `price_...`). You'll need both.

## 2. Grab your API keys

Dashboard → **Developers → API keys**.

- Copy the **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live).
- You don't need the publishable key — all Stripe interactions in this app are server-side.

## 3. Set env vars

Locally, add to `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...      # the $60/mo price ID
STRIPE_PRICE_YEARLY=price_...       # the $600/yr price ID
STRIPE_WEBHOOK_SECRET=whsec_...     # set after step 4
```

On Vercel, add the same vars in **Project Settings → Environment Variables** (Production + Preview + Development). Don't forget to **redeploy** so the new vars take effect.

## 4. Set up the webhook

The webhook tells us when payment succeeds, renews, or fails.

Dashboard → **Developers → Webhooks → + Add endpoint**.

- **Endpoint URL:** `https://your-domain.com/api/stripe/webhook`
  - Production: `https://localpunch-v2.vercel.app/api/stripe/webhook`
  - Local dev: use the Stripe CLI (see below)
- **Listen to:** Events on your account
- **Select events** (click "+ Select events"):
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

Save. On the endpoint page, click **Reveal signing secret** and copy it — that's `STRIPE_WEBHOOK_SECRET`. Add it to your env vars and redeploy.

### Testing webhooks locally

```
brew install stripe/stripe-cli/stripe   # or download from stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a `whsec_...` for local use — set it as `STRIPE_WEBHOOK_SECRET` in `.env.local` while developing.

## 5. Configure the Customer Portal

Dashboard → **Settings → Billing → Customer portal**.

- Turn **Customer portal** **on**.
- Under **Functionality**:
  - ✅ Customers can update their payment method
  - ✅ Customers can update their billing / shipping info
  - ✅ Customers can view invoices
  - ✅ Customers can cancel subscriptions (pick "At end of billing period" — avoids refund hassle)
  - ✅ Customers can switch plans (add both the monthly and yearly prices to the allowed plan list)

Save.

## 6. Run the DB migration

In Supabase, apply the new migration:

```
supabase/migrations/20260417_001_billing.sql
```

This adds billing columns to `businesses` and flips the `is_active` default to `FALSE`. Existing businesses keep their current `is_active` value (your test data stays usable).

## 7. Sanity check

1. Sign up as a new merchant in your app → complete `/merchant/setup`.
2. You should land on `/merchant/billing` with the "shop isn't live yet" card.
3. Click **Start monthly** → you get redirected to Stripe Checkout.
4. Use test card `4242 4242 4242 4242`, any future expiry, any CVC.
5. After payment, you come back to `/merchant/billing?status=success`. Within a few seconds the page flips to "Active."
6. Click **Open billing portal →** — you should see the Stripe-hosted portal with invoices, card management, and cancel.
7. Visit `/merchant/qr` → QR generation works.

### Things to verify in webhook logs

In Supabase, after a successful checkout the business row should have:

```
is_active              = true
subscription_status    = 'active'
plan_interval          = 'month' | 'year'
stripe_customer_id     = 'cus_...'
stripe_subscription_id = 'sub_...'
current_period_end     = <a future timestamp>
```

If it doesn't update, check Vercel function logs for `/api/stripe/webhook` — signature verification is the usual culprit. Make sure `STRIPE_WEBHOOK_SECRET` matches the one shown in the Stripe dashboard for this specific endpoint.

## Going from test to live

When you're ready for real money:

1. Repeat all steps above in **Live mode** (toggle top-right of Stripe dashboard).
2. Create a new product + prices (test mode products don't carry over).
3. Create a new webhook endpoint pointing at production.
4. Swap every env var (`STRIPE_SECRET_KEY`, both price IDs, and the new `STRIPE_WEBHOOK_SECRET`) to the live-mode values on Vercel. Redeploy.

## Failure modes to be aware of

- **Sub lapses / card fails repeatedly:** Stripe moves the sub to `past_due` → our webhook sets `is_active = false`. The merchant sees the banner + a red status in `/merchant/billing` telling them to update their card. Customers immediately stop seeing the shop (RLS). They can fix it in the portal.
- **Merchant cancels:** `cancel_at_period_end = true` until the period ends. Shop stays live until then.
- **Merchant changes plans in portal:** webhook updates `plan_interval` automatically. Nothing else to do.
