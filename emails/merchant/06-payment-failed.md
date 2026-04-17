---
key: merchantPaymentFailed
envVar: LOOPS_TX_MERCHANT_PAYMENT_FAILED
from: LocalPunch <localpunch@920four.com>
subject: "Your card didn't go through — {{business_name}}"
previewText: "Quick — update it before your shop gets paused."
trigger: Stripe invoice.payment_failed
dataVariables:
  - first_name
  - business_name
  - amount_due
  - billing_portal_url
---

Hi {{first_name}},

Your card on file just declined a payment of **${{amount_due}}** for {{business_name}}.

Not a big deal — happens all the time, usually expired cards or a bank's fraud filter. But we need to get it sorted soon: Stripe will retry a few times, and if none go through, your shop will be paused and customers won't be able to use their cards.

### Fix it in 30 seconds

[Update your payment method]({{billing_portal_url}})

You'll land on your billing page. Click "Manage billing," add a new card, done.

If the payment goes through on retry before you do anything, ignore this email — you're good.

Questions? Just reply.

— LocalPunch
