import type { Metadata } from 'next'
import {
  MarketingFooter,
  MarketingHeader,
  JsonLd,
} from '@/components/marketing/shell'
import { ContactForm } from '@/components/marketing/contact-form'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact LocalPunch · Questions, Support & Sales',
  description:
    'Get in touch with the LocalPunch team. Questions about digital punch cards, billing, or setting up your shop — we’re happy to help.',
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: 'Contact LocalPunch',
    description: 'Questions about LocalPunch? Reach the team here.',
    url: `${SITE_URL}/contact`,
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <MarketingHeader />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact LocalPunch',
          url: `${SITE_URL}/contact`,
        }}
      />
      <main className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1a1a]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Get in touch
          </h1>
          <p className="mt-3 text-[#6B7280] max-w-md mx-auto">
            Questions about setup, billing, or whether LocalPunch fits your shop?
            Send us a note and we’ll get back to you fast.
          </p>
        </div>
        <ContactForm />
      </main>
      <MarketingFooter />
    </div>
  )
}
