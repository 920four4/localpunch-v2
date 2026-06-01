---
key: merchantPaymentFailed
heading: "Payment didn't go through"
subject: "Your card didn't go through — {{business_name}}"
previewText: "Update it before your shop gets paused."
trigger: Stripe invoice.payment_failed
---

Hi {{first_name}},

Your card declined **${{amount_due}}** for **{{business_name}}**.

Stripe will retry a few times. If none succeed, your shop pauses and customers can't use their cards.

[Update payment method →]({{billing_portal_url}})

If a retry succeeds before you act, ignore this email.

Questions? Reply here.

— LocalPunch
