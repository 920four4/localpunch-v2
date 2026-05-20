import type { Metadata } from 'next'
import {
  MarketingCTA,
  MarketingFooter,
  MarketingHeader,
  JsonLd,
} from '@/components/marketing/shell'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'How Digital Punch Cards Work · LocalPunch',
  description:
    'See the full customer and merchant flow: scan QR, collect punches, redeem rewards. No app download. Works on any phone or tablet.',
  alternates: { canonical: `${SITE_URL}/how-it-works` },
}

const customerSteps = [
  { n: '1', title: 'Scan your QR', body: 'Customer scans the counter poster with their phone camera.' },
  { n: '2', title: 'Verify by text', body: 'One-time SMS code — no password, no app store.' },
  { n: '3', title: 'Collect punches', body: 'Card lives in their browser. They can save it to their home screen.' },
  { n: '4', title: 'Redeem reward', body: 'When the card is full, they redeem in-store with your staff.' },
]

const merchantSteps = [
  { n: '1', title: 'Create your reward', body: 'Pick punches required and what the free item is.' },
  { n: '2', title: 'Print the QR poster', body: 'Download from the dashboard and tape it to the counter.' },
  { n: '3', title: 'Punch in one tap', body: 'Open merchant mode on any phone, scan customer QR, tap punch.' },
  { n: '4', title: 'Go live', body: 'Flip billing on when you are ready for customers to collect punches.' },
]

export default function HowItWorksPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to run a digital punch card with LocalPunch',
    step: merchantSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <JsonLd data={jsonLd} />
      <MarketingHeader />
      <main className="max-w-4xl mx-auto px-5 py-16 lg:py-24">
        <p className="lp-eyebrow text-center">How it works</p>
        <h1
          className="mt-3 text-4xl sm:text-5xl font-bold text-center tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          From QR scan to free reward
        </h1>
        <p className="text-lg text-[#5A554C] text-center mt-4 max-w-2xl mx-auto">
          Two flows — customer and merchant — both designed to finish in under a
          minute.
        </p>

        <section className="mt-14">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            For your customers
          </h2>
          <ol className="space-y-4">
            {customerSteps.map(s => (
              <li key={s.n} className="lp-card p-5 flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#FFE566] border-2 border-[#1a1a1a] flex items-center justify-center font-bold">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-sm text-[#5A554C] mt-1">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            For you (the owner)
          </h2>
          <ol className="space-y-4">
            {merchantSteps.map(s => (
              <li key={s.n} className="lp-card p-5 flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#A8E6CF] border-2 border-[#1a1a1a] flex items-center justify-center font-bold">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="text-sm text-[#5A554C] mt-1">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <MarketingCTA headline="Set up in about 10 minutes" />
      <MarketingFooter />
    </div>
  )
}
