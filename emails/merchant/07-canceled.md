---
key: merchantCanceled
envVar: LOOPS_TX_MERCHANT_CANCELED
from: LocalPunch <localpunch@920four.com>
subject: "{{business_name}} — your subscription is canceled"
previewText: "Come back any time. Your data is safe."
trigger: Stripe subscription fully canceled
dataVariables:
  - first_name
  - business_name
---

Hi {{first_name}},

Your LocalPunch subscription for **{{business_name}}** has been canceled. No more charges.

Your customer data is safe. If you ever want to turn {{business_name}} back on, your shop, programs, and every punch card are still there — just resubscribe and it all lights back up. Nothing is deleted.

### A real ask

If you have 30 seconds, I'd love to know *why* you left. Reply with one line:

- Price?
- Didn't get traction?
- Tried something else?
- Closed the shop?

No pitch, no "are you sure," I just want to build a better product. I read every reply.

Thanks for giving us a shot.

— LocalPunch
