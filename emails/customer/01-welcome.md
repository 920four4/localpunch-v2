---
key: customerWelcome
envVar: LOOPS_TX_CUSTOMER_WELCOME
from: LocalPunch <localpunch@920four.com>
subject: "Welcome — your punch cards live here"
previewText: "No app. No account hassle. Just rewards at the places you go."
trigger: Customer adds email in the wallet
dataVariables:
  - first_name
  - wallet_url
---

Hey {{first_name}},

Welcome to LocalPunch.

You don't need an app — your cards live right in your browser at [{{wallet_url}}]({{wallet_url}}). Bookmark it. We recommend adding it to your home screen so it opens like an app (tap the share icon → Add to Home Screen).

### How it works

1. **Scan** the QR at any LocalPunch shop
2. **Get punched** when you buy something
3. **Redeem** when you fill the card — show the screen, they give you the reward

### What we'll email you

Only the good stuff:
- When a card is ready to redeem
- When you're one punch away from a reward
- Nothing else

You can unsubscribe any time (link in every email).

Happy collecting 🎉

— LocalPunch
