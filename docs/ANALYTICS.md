# LocalPunch — Google Analytics 4 (GA4)

Measurement ID: **G-1M5B0X50Z8**

This app sends **client-side** events via `gtag.js` and **server-side** revenue events via the GA4 Measurement Protocol (Stripe webhooks).

---

## 1. Vercel environment variables

| Variable | Where | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Production, Preview | Optional (defaults to `G-1M5B0X50Z8`) |
| `GA4_API_SECRET` | Production, Preview | **Required for server revenue** |

### Create `GA4_API_SECRET`

1. Open [Google Analytics](https://analytics.google.com/) → **Admin**
2. Under **Property**, open **Data streams** → select your web stream
3. Scroll to **Measurement Protocol API secrets** → **Create**
4. Copy the secret value
5. In Vercel → Project → **Settings** → **Environment Variables**:
   - Name: `GA4_API_SECRET`
   - Value: (paste secret)
   - Environments: Production + Preview
6. Redeploy after saving

Without `GA4_API_SECRET`, browser events still work; **purchase / renewal / churn from Stripe will not appear in GA**.

---

## 2. Events tracked

### Marketing & engagement (browser)

| Event | When |
|-------|------|
| `page_view` | Every route change (SPA) |
| `cta_click` | Clicks on elements with `data-ga-event` (header, hero, pricing, etc.) |
| `generate_lead` | Fired with CTA clicks (GA4 lead signal) |

### Auth & onboarding (browser)

| Event | When |
|-------|------|
| `login` | SMS OTP sent, magic link sent, SMS verify success |
| `sign_up` | Onboard complete (customer or merchant) |
| `business_created` | Merchant setup or onboard with business |

### Merchant product (browser)

| Event | When |
|-------|------|
| `program_created` | New loyalty program saved |
| `begin_checkout` | Monthly/yearly plan clicked before Stripe redirect |
| `purchase` | Billing success page (client backup, deduped) |
| `checkout_canceled` | Return from Stripe cancel URL |
| `punch_recorded` | Manual merchant punch or customer QR punch |
| `punch_reversed` | Merchant undoes last punch |
| `redeem_completed` | Merchant redeems a completed card |

### Customer (browser)

| Event | When |
|-------|------|
| `card_claimed` | Customer collects a punch via QR |
| `wallet_view` | Customer opens wallet |

### Revenue & lifecycle (server — Measurement Protocol)

| Event | When |
|-------|------|
| `purchase` | Stripe `checkout.session.completed` (new subscription) |
| `purchase` + `subscription_renewal` | Stripe `invoice.payment_succeeded` (renewal cycle) |
| `merchant_activated` | First successful subscription (with purchase) |
| `subscription_churned` | Subscription canceled |
| `payment_failed` | Invoice payment failed |
| `sign_up` / `business_created` | Merchant signup API after setup |

**User properties** (logged-in users): `user_role`, `business_active`, `plan_interval`

---

## 3. GA4 console setup (recommended)

### Mark key events as conversions

**Admin → Events → Mark as conversion:**

- `purchase` — revenue
- `begin_checkout` — checkout intent
- `sign_up` — new accounts
- `business_created` — merchant funnel
- `merchant_activated` — paying customer
- `generate_lead` — marketing CTAs

### Monetization reports

- **Reports → Monetization → Ecommerce purchases** — `purchase` with `value` (USD)
- **Reports → Monetization → Purchase journey** — `begin_checkout` → `purchase`

### Custom explorations

**Funnel (merchant acquisition):**

1. `generate_lead` or `cta_click`
2. `sign_up`
3. `business_created`
4. `begin_checkout`
5. `purchase`

**Engagement:**

- `punch_recorded` by `source` (`customer_qr` vs `merchant_manual`)
- `redeem_completed` count over time

### DebugView (testing)

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) or add `?debug_mode=true` via GA4 debug endpoint
2. **Admin → DebugView** — see events in real time while testing locally/production

### Realtime

**Reports → Realtime** — confirm `page_view`, `cta_click`, and test `purchase` after a Stripe test checkout.

---

## 4. Code locations

| File | Purpose |
|------|---------|
| `components/analytics/google-analytics.tsx` | Loads gtag.js |
| `components/analytics/analytics-provider.tsx` | Page views, CTA delegation, user ID |
| `lib/analytics/client.ts` | Browser `trackEvent` helpers |
| `lib/analytics/server.ts` | Measurement Protocol (Stripe revenue) |
| `app/api/stripe/webhook/route.ts` | Server purchase / renewal / churn |

---

## 5. Declarative CTA tracking

Add to any link or button:

```html
data-ga-event="cta_click"
data-ga-location="hero"
data-ga-label="start_free"
```

The global click listener in `AnalyticsProvider` picks these up automatically.

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| No page views | Check ad blockers; confirm `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| No revenue in GA | Set `GA4_API_SECRET` and redeploy; verify Stripe webhook fires |
| Duplicate purchases | Client + server both fire `purchase` once; dedupe key `ga_purchase_{session_id}` in sessionStorage |
| Events missing on `/admin` | Expected — same gtag loads; admin routes still get `page_view` |
