export type IndustryPage = {
  slug: string
  title: string
  metaDescription: string
  h1: string
  subtitle: string
  painPoints: string[]
  benefits: { title: string; body: string }[]
  exampleReward: string
  relatedBlogSlugs?: string[]
}

export type ComparisonPage = {
  slug: string
  competitor: string
  title: string
  metaDescription: string
  h1: string
  summary: string
  rows: { label: string; localpunch: string; them: string }[]
  whenPickUs: string[]
  whenPickThem: string[]
}

export const INDUSTRIES: Record<string, IndustryPage> = {
  'coffee-shops': {
    slug: 'coffee-shops',
    title: 'Coffee Shop Loyalty Program',
    metaDescription:
      'Turn regulars into repeat visits with a digital punch card your baristas can run in one tap. No app, no POS upgrade. $60/mo unlimited.',
    h1: 'Loyalty programs built for coffee shops',
    subtitle:
      'Your regulars are 80% of revenue. Give them a reason to pick you when another shop opens on the next block.',
    painPoints: [
      'Paper cards get lost in coat pockets by punch five',
      'You have no list when you want to promote a new seasonal drink',
      'Square Loyalty means changing how you already run the register',
    ],
    benefits: [
      {
        title: 'One tap at the counter',
        body: 'Barista scans the customer QR, taps punch, done. No iPad mount required.',
      },
      {
        title: 'No customer app',
        body: 'Regulars scan once, verify by text, and keep the card in their browser.',
      },
      {
        title: 'Unlimited everything',
        body: 'One flat $60/month. No per-location fees, no punch caps.',
      },
    ],
    exampleReward: 'Buy 9 drinks, get the 10th free',
    relatedBlogSlugs: ['coffee-shop-loyalty-program-setup', 'digital-punch-cards-vs-paper'],
  },
  taquerias: {
    slug: 'taquerias',
    title: 'Taqueria Loyalty Program',
    metaDescription:
      'Replace lost paper cards with a QR punch card that follows your regulars. 10th taco free, unlimited customers, flat $60/month.',
    h1: 'Loyalty that works for taquerias and taco shops',
    subtitle:
      'Thin margins and fierce lunch competition make a simple punch reward the cheapest ad you can run.',
    painPoints: [
      'Lunch crowds try you once and never come back',
      'Paper punch cards don’t survive a hot sauce spill',
      'You can’t text anyone when Tuesday is slow',
    ],
    benefits: [
      {
        title: 'Built for high-volume lunch',
        body: 'Punch in seconds while the line moves. Manual punch by phone if they forgot their phone.',
      },
      {
        title: 'Spanish-friendly flow',
        body: 'Simple QR + SMS — no app store, no account password.',
      },
      {
        title: 'See who your regulars are',
        body: 'Every sign-up is a contact you can reach for specials.',
      },
    ],
    exampleReward: 'Buy 9 tacos, get the 10th free',
    relatedBlogSlugs: ['taqueria-repeat-customer-guide'],
  },
  'boba-shops': {
    slug: 'boba-shops',
    title: 'Boba Shop Loyalty Program',
    metaDescription:
      'Gen-Z customers expect phone-based loyalty. Digital punch cards with no app download. Set up in minutes.',
    h1: 'Boba shop loyalty that doesn’t feel dated',
    subtitle:
      'A paper card on the counter tells Gen-Z customers you’re behind. A browser card on their phone doesn’t.',
    painPoints: [
      'Wallet pass apps are a pain to set up and maintain',
      'Instagram promos don’t build a owned customer list',
      'Stamp fraud from screenshot QR codes',
    ],
    benefits: [
      {
        title: 'Phone-native, not app-native',
        body: 'Customers save to home screen — feels like an app without the download.',
      },
      {
        title: 'Rotating QR',
        body: 'Counter QR refreshes every few minutes so screenshots don’t work.',
      },
      {
        title: 'Flat pricing',
        body: 'Busy weekend lines don’t mean higher software bills.',
      },
    ],
    exampleReward: 'Buy 8 drinks, get one free topping upgrade',
  },
  barbershops: {
    slug: 'barbershops',
    title: 'Barbershop Loyalty Program',
    metaDescription:
      'Reward the 4-week haircut cycle with a digital punch card. One tap at the chair, no app for clients, $60/mo flat.',
    h1: 'Barbershop loyalty tied to the haircut cycle',
    subtitle:
      'Your client books every 4 weeks somewhere. Make sure that somewhere is you.',
    painPoints: [
      'Clients try the new shop across the street once',
      'Paper cards live in wallets that get replaced',
      'You don’t know who to call when you have an open chair',
    ],
    benefits: [
      {
        title: 'Punch from the chair',
        body: 'Phone in hand while they pay — one tap, no checkout integration.',
      },
      {
        title: 'Works for 1-chair shops',
        body: 'No enterprise minimums or multi-location pricing.',
      },
      {
        title: 'Referral-ready',
        body: 'Reward structure can include “bring a friend” punch bonuses.',
      },
    ],
    exampleReward: 'Buy 5 cuts, get the 6th $10 off',
    relatedBlogSlugs: ['barbershop-loyalty-strategy'],
  },
  'nail-salons': {
    slug: 'nail-salons',
    title: 'Nail Salon Loyalty Program',
    metaDescription:
      'Keep high-frequency clients coming back with a digital stamp card. No app download, unlimited customers, one flat price.',
    h1: 'Nail salon loyalty for repeat bookings',
    subtitle: 'The salon that remembers them wins — even when every shop does great work.',
    painPoints: [
      'Clients bounce between salons based on whoever has an opening',
      'Paper stamp cards fade and tear',
      'No way to fill last-minute cancellations',
    ],
    benefits: [
      {
        title: 'High-frequency friendly',
        body: 'Works for clients who come every 2–3 weeks.',
      },
      {
        title: 'Staff-light setup',
        body: 'Front desk punches in one tap between appointments.',
      },
      {
        title: 'Unlimited programs',
        body: 'Run manicure and pedicure rewards separately if you want.',
      },
    ],
    exampleReward: 'Buy 5 visits, get $15 off the 6th',
  },
  'food-trucks': {
    slug: 'food-trucks',
    title: 'Food Truck Loyalty Program',
    metaDescription:
      'Your loyalty program moves with you. Digital punch cards via QR — no hardware, no app, unlimited punches for $60/month.',
    h1: 'Loyalty that follows your food truck',
    subtitle:
      'You change locations every week. Your punch card shouldn’t be stuck at one address.',
    painPoints: [
      'Paper cards only work if customers find you again',
      'POS loyalty ties you to one payment system',
      'Event-only crowds don’t justify expensive software',
    ],
    benefits: [
      {
        title: 'Location-independent',
        body: 'Same QR on the truck window — customers keep the same card.',
      },
      {
        title: 'Fast line punching',
        body: 'One tap while you hand over food.',
      },
      {
        title: 'Instagram-ready',
        body: 'Post your QR story every time you announce a new spot.',
      },
    ],
    exampleReward: 'Buy 8 meals, get the 9th free',
  },
}

export const COMPARISONS: Record<string, ComparisonPage> = {
  'stamp-me': {
    slug: 'stamp-me',
    competitor: 'Stamp Me',
    title: 'LocalPunch vs Stamp Me',
    metaDescription:
      'Flat $60/mo unlimited vs Stamp Me pricing. No customer app required. Honest comparison for small local shops.',
    h1: 'LocalPunch vs Stamp Me',
    summary:
      'Stamp Me is a capable platform with a large feature set. LocalPunch is narrower on purpose: digital punch cards for local shops that want simple, flat pricing.',
    rows: [
      { label: 'Monthly cost', localpunch: '$60 flat, unlimited', them: 'Tiered plans + location fees' },
      { label: 'Customer app', localpunch: 'No download — browser wallet', them: 'Customer app encouraged' },
      { label: 'Setup time', localpunch: '~10 minutes', them: 'Often longer onboarding' },
      { label: 'POS required', localpunch: 'No', them: 'No, but more configuration' },
      { label: 'Best for', localpunch: 'Single-location punch-card shops', them: 'Multi-location brands wanting marketing automation' },
    ],
    whenPickUs: [
      'You want punch cards only, not a full marketing suite',
      'You hate per-location or per-customer pricing surprises',
      'Your customers won’t download another app',
    ],
    whenPickThem: [
      'You need advanced campaigns across many locations',
      'You want deeper integrations with enterprise tooling',
    ],
  },
  'loopy-loyalty': {
    slug: 'loopy-loyalty',
    competitor: 'Loopy Loyalty',
    title: 'LocalPunch vs Loopy Loyalty',
    metaDescription:
      'Web-wallet punch cards vs Apple/Google Wallet passes. Compare pricing, setup, and fraud prevention for local shops.',
    h1: 'LocalPunch vs Loopy Loyalty',
    summary:
      'Loopy focuses on wallet passes. LocalPunch uses a web wallet — faster for customers who won’t install Wallet passes.',
    rows: [
      { label: 'Card type', localpunch: 'Web wallet + home screen', them: 'Apple/Google Wallet passes' },
      { label: 'Customer friction', localpunch: 'Scan + SMS', them: 'Add to Wallet flow' },
      { label: 'Pricing', localpunch: '$60/mo unlimited', them: 'Stamp-based tiers' },
      { label: 'Fraud prevention', localpunch: 'Rotating counter QR', them: 'Varies by setup' },
      { label: 'Best for', localpunch: 'Quick launch, no Wallet IT', them: 'Brands invested in pass design' },
    ],
    whenPickUs: [
      'You want live this week, not after pass design review',
      'Your customers are mixed iPhone/Android and skip Wallet',
    ],
    whenPickThem: [
      'You already invested in beautiful Wallet pass creative',
    ],
  },
  fivestars: {
    slug: 'fivestars',
    competitor: 'Fivestars',
    title: 'LocalPunch vs Fivestars',
    metaDescription:
      'Simple punch cards vs full marketing platform. When a $60/mo flat-fee tool beats enterprise loyalty software.',
    h1: 'LocalPunch vs Fivestars',
    summary:
      'Fivestars (now SumUp) targets automated marketing at scale. LocalPunch is for owners who want a punch card, not a growth team.',
    rows: [
      { label: 'Complexity', localpunch: 'Punch + redeem only', them: 'Campaigns, automation, CRM-like tools' },
      { label: 'Sales process', localpunch: 'Self-serve signup', them: 'Often sales-assisted' },
      { label: 'Pricing', localpunch: 'Public flat $60/mo', them: 'Quote-based / bundled' },
      { label: 'Best for', localpunch: 'Owner-operators', them: 'Chains and growth-focused SMBs' },
    ],
    whenPickUs: [
      'You’ll never use 80% of the features',
      'You want transparent pricing on the website',
    ],
    whenPickThem: [
      'You need enterprise-grade marketing automation',
    ],
  },
  'square-loyalty': {
    slug: 'square-loyalty',
    competitor: 'Square Loyalty',
    title: 'LocalPunch vs Square Loyalty',
    metaDescription:
      'Standalone digital punch cards that work without switching your POS. Flat pricing, unlimited customers.',
    h1: 'LocalPunch vs Square Loyalty',
    summary:
      'Square Loyalty is excellent if you’re all-in on Square. LocalPunch works alongside whatever you already use.',
    rows: [
      { label: 'POS lock-in', localpunch: 'None', them: 'Square POS' },
      { label: 'Pricing model', localpunch: '$60/mo flat', them: 'Per-visit fees on top of software' },
      { label: 'Customer app', localpunch: 'No', them: 'Square ecosystem' },
      { label: 'Best for', localpunch: 'Non-Square or multi-tool shops', them: 'Square-only merchants' },
    ],
    whenPickUs: [
      'You use Clover, Toast, cash, or a mix',
      'You want unlimited visits without per-visit fees',
    ],
    whenPickThem: [
      'Square is your only system and you want one bill',
    ],
  },
  'paper-punch-cards': {
    slug: 'paper-punch-cards',
    competitor: 'Paper punch cards',
    title: 'Digital vs Paper Punch Cards',
    metaDescription:
      'Lost cards, forged stamps, no customer list. An honest breakdown of paper vs digital punch cards for local businesses.',
    h1: 'Digital punch cards vs paper',
    summary:
      'Paper still works for tiny shops. Digital wins when you care about completion rates, fraud, and having a contact list.',
    rows: [
      { label: 'Upfront cost', localpunch: '$60/mo', them: '~$50 one-time' },
      { label: 'Lost cards', localpunch: 'Rare (phone-based)', them: '30–50% lost mid-card' },
      { label: 'Customer list', localpunch: 'Yes (SMS opt-in)', them: 'No' },
      { label: 'Fraud', localpunch: 'Rotating QR', them: 'Amazon stamper risk' },
      { label: 'Best for', localpunch: 'Growing repeat-visit base', them: 'Ultra-low-frequency shops' },
    ],
    whenPickUs: [
      'You want to text slow-Tuesday promos to regulars',
      'You’re tired of re-stamping lost cards',
    ],
    whenPickThem: [
      'You see a customer 4× per year and don’t need a list',
    ],
  },
}
