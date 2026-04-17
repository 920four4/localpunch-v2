---
key: merchantDay1FirstPunch
envVar: LOOPS_TX_MERCHANT_DAY1
from: LocalPunch <localpunch@920four.com>
subject: "The 30-second first-punch guide"
previewText: "One button. That's the whole thing."
trigger: Day 1 of merchant_activated Loop (or transactional after 1 day)
dataVariables:
  - first_name
  - business_name
  - dashboard_url
---

Hi {{first_name}},

Quick one today. Here's exactly what you do the first time a customer joins {{business_name}}:

### The 30-second guide

1. Customer points their phone camera at your QR code
2. Phone opens a link — they enter their number, tap verify
3. Your tablet/phone is open to **Dashboard → QR → Tap to punch**
4. Tap the big green button once = one punch added

That's it.

### Two things that trip people up

**"My customer doesn't have the camera app working."**
No problem. Any phone with a browser works — just have them go to `localpunch.app/scan` and point it at the QR. Takes 5 seconds longer, same result.

**"What if I punch twice by accident?"**
We built in a 60-second cooldown per customer, per card. Tap the button 50 times — only the first one counts. You won't accidentally ruin their card.

### Want to see what customers see?

Pull out your own phone, scan your own QR. You'll get a card at your own shop. Now you know the whole experience.

— LocalPunch

P.S. Punching customers today? [Open the dashboard]({{dashboard_url}})
