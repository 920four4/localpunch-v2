---
key: merchantWelcome
envVar: LOOPS_TX_MERCHANT_WELCOME
from: LocalPunch <localpunch@920four.com>
subject: "{{business_name}} is live on LocalPunch 🎉"
previewText: "You're all set. Here's how to get your first punch today."
trigger: Fires immediately from the Stripe webhook on first subscription activation
dataVariables:
  - first_name
  - business_name
  - plan_label
  - dashboard_url
  - qr_url
---

Hey {{first_name}},

Your shop **{{business_name}}** is live on LocalPunch. You're on the {{plan_label}} plan.

### What happens next

You have one job today: get your first punch. It takes about 90 seconds.

1. Open your dashboard: [{{dashboard_url}}]({{dashboard_url}})
2. Tap **QR Code** in the left menu
3. Print it, tape it to the counter — or just show your phone to the first customer who walks in

When they scan it with their phone and enter their number, they get a loyalty card. That's it. No app to install, nothing to download.

### You'll also get

- A simple dashboard showing who's coming back
- Full control over your reward (10 punches → free coffee, 8 punches → 20% off, whatever you want)
- Your customer list, downloadable, ever — you own it

Tomorrow I'll send you the 2-minute guide to handing out your first punch smoothly.

Until then — welcome.

— The LocalPunch team

P.S. Need help? Just reply to this email. It goes straight to us.
