import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MarketingCTA,
  MarketingFooter,
  MarketingHeader,
  JsonLd,
} from '@/components/marketing/shell'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'LocalPunch Pricing · $60/mo or $600/yr, Unlimited',
  description:
    'One flat plan: unlimited cards, customers, and punches. $60/month or $600/year (save $120). No setup fees. Cancel anytime.',
  alternates: { canonical: `${SITE_URL}/pricing` },
  openGraph: {
    title: 'LocalPunch Pricing',
    description: 'Flat $60/month unlimited loyalty for local businesses.',
    url: `${SITE_URL}/pricing`,
  },
}

const plans = [
  {
    name: 'Monthly',
    price: '$60',
    period: '/month',
    note: 'Billed monthly via Stripe',
    highlight: false,
  },
  {
    name: 'Yearly',
    price: '$600',
    period: '/year',
    note: 'Save $120 — two months free',
    highlight: true,
  },
]

const included = [
  'Unlimited loyalty programs',
  'Unlimited customers & punch cards',
  'Unlimited punches & redemptions',
  'Rotating QR fraud prevention',
  'Manual punch by phone number',
  'Customer export (CSV)',
  'Merchant analytics dashboard',
  'Email support',
]

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'LocalPunch',
    description: 'Digital punch card loyalty for local businesses',
    brand: { '@type': 'Brand', name: 'LocalPunch' },
    offers: [
      {
        '@type': 'Offer',
        price: '60.00',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        url: `${SITE_URL}/pricing`,
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        price: '600.00',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        url: `${SITE_URL}/pricing`,
        availability: 'https://schema.org/InStock',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a1a]">
      <JsonLd data={jsonLd} />
      <MarketingHeader active="pricing" />
      <main className="max-w-4xl mx-auto px-5 py-16 lg:py-24">
        <p className="lp-eyebrow text-center">Pricing</p>
        <h1
          className="mt-3 text-4xl sm:text-5xl font-bold text-center tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          One plan. Everything included.
        </h1>
        <p className="text-lg text-[#5A554C] text-center mt-4 max-w-2xl mx-auto">
          No per-location fees. No per-customer caps. No transaction fees. Build
          your program free — pay only when you flip the shop live.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-12">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`lp-card p-8 ${plan.highlight ? 'ring-2 ring-[#FFE566]' : ''}`}
            >
              {plan.highlight && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6457]">
                  Best value
                </span>
              )}
              <h2
                className="text-xl font-bold mt-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {plan.name}
              </h2>
              <p className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-[#6B7280]">{plan.period}</span>
              </p>
              <p className="text-sm text-[#6B7280] mt-2">{plan.note}</p>
            </div>
          ))}
        </div>

        <ul className="mt-12 grid sm:grid-cols-2 gap-3">
          {included.map(item => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#5A554C]">
              <span className="text-[#1a1a1a] font-bold">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <p className="text-center text-sm text-[#9CA3AF] mt-10">
          Compare with{' '}
          <Link href="/compare/stamp-me" className="underline hover:text-[#1a1a1a]">
            Stamp Me
          </Link>
          ,{' '}
          <Link href="/compare/square-loyalty" className="underline hover:text-[#1a1a1a]">
            Square Loyalty
          </Link>
          , and{' '}
          <Link href="/compare/paper-punch-cards" className="underline hover:text-[#1a1a1a]">
            paper cards
          </Link>
          .
        </p>
      </main>
      <MarketingCTA />
      <MarketingFooter />
    </div>
  )
}
