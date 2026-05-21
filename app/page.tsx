import Link from 'next/link'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/marketing/shell'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Digital Punch Cards for Small Businesses · LocalPunch',
  description:
    'Replace paper punch cards with a QR loyalty program customers cannot lose. $60/mo unlimited everything, no app downloads. Set up in 2 minutes.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Digital Punch Cards for Small Businesses · LocalPunch',
    description:
      'QR loyalty for local shops. No app, no hardware, flat $60/month unlimited.',
    url: SITE_URL,
    siteName: 'LocalPunch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Punch Cards for Small Businesses',
    description: 'No app downloads. Flat $60/mo. Built for coffee shops, taquerias, barbershops, and more.',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Do I need a new iPad or register?',
    a: 'No. Any phone or tablet with a web browser works. Most owners just use their own phone at the counter.',
  },
  {
    q: 'Do my customers have to download an app?',
    a: 'Never. They scan a QR code, enter their phone number, and get a card that lives in their browser. Most save it to their home screen so it acts like an app without being one.',
  },
  {
    q: 'What stops people from cheating the punches?',
    a: 'The QR code on your counter rotates every 5 minutes, so a screenshot is useless within minutes. Each customer can only collect one punch per day, per program.',
  },
  {
    q: 'What if a customer forgets their phone?',
    a: 'You can add a punch by phone number from your merchant screen. Their card updates the next time they open it.',
  },
  {
    q: 'Is there a free trial or free plan?',
    a: 'Signing up and building your entire program is free. You only pay once you flip the shop live. It is $60/month or $600/year, everything unlimited, cancel anytime.',
  },
  {
    q: 'What if I am not techy?',
    a: 'If you can send a text message, you can run LocalPunch. At the counter the merchant screen is basically one button.',
  },
]

export default function LandingPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LocalPunch',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '60',
      priceCurrency: 'USD',
    },
    description:
      'Digital punch card loyalty for local businesses. No customer app download required.',
    url: SITE_URL,
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a1a]">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={appJsonLd} />
      <Header />
      <main>
        <Hero />
        <ValuePillars />
        <NoHeadache />
        <HowItWorks />
        <ValueMath />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Small stroke-icon set — calmer and more trustworthy than emoji
   ──────────────────────────────────────────────────────────── */

type IconProps = { className?: string }

const iconBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const Icons = {
  repeat: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  chart: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  ),
  spark: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
    </svg>
  ),
  phone: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  ),
  shield: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9.5 12l1.8 1.8 3.5-3.8" />
    </svg>
  ),
  tag: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M3 12l8.6-8.6a2 2 0 0 1 1.4-.6H20a1 1 0 0 1 1 1v7a2 2 0 0 1-.6 1.4L12 21a2 2 0 0 1-2.8 0L3 14.8a2 2 0 0 1 0-2.8z" />
      <circle cx="16.5" cy="7.5" r="1.4" />
    </svg>
  ),
  check: (p: IconProps) => (
    <svg {...iconBase} className={p.className}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  ),
}

/* ─────────────────────────────────────────────────────────────
   Hero — lead with the outcome, dissolve the "is this a hassle" fear
   ──────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="px-5 pt-16 pb-16 sm:pt-24 sm:pb-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
        <div className="text-center lg:text-left">
          <span className="lp-eyebrow">Loyalty for local businesses</span>
          <h1
            className="mt-5 text-[2.5rem] sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.06]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Digital punch cards for
            <br className="hidden sm:block" /> local businesses &mdash;{' '}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">without the busywork.</span>
              <span className="absolute left-0 right-0 bottom-1 h-3 bg-[#FFE566] -z-0 rounded-sm" />
            </span>
          </h1>
          <p className="mt-6 text-lg text-[#5A554C] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            LocalPunch is a digital punch card that lives on the phone your
            customers already carry. Nothing for them to download, nothing for
            you to install, nothing new to learn. Set it up in a few minutes and
            let the rewards do what they&rsquo;ve always done &mdash; bring
            people back.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
            <Link
              href="/login?role=business"
              className="nb-btn-primary w-full sm:w-auto text-base font-semibold px-7 py-3.5"
              data-ga-event="cta_click"
              data-ga-location="home_hero"
              data-ga-label="setup_my_shop"
            >
              Set up my shop &mdash; free to start
            </Link>
            <Link
              href="/how-it-works"
              className="lp-btn-quiet w-full sm:w-auto text-base px-7 py-3.5"
              data-ga-event="cta_click"
              data-ga-location="home_hero"
              data-ga-label="how_it_works"
            >
              See how it works
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-[#6B6457]">
            {[
              'Free to build',
              'Pay only when you go live',
              'Cancel anytime',
            ].map(t => (
              <li key={t} className="flex items-center gap-1.5">
                <Icons.check className="w-4 h-4 text-[#1a1a1a]" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Card preview — the real thing, presented calmly */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="lp-card p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-[#9A9387] font-semibold uppercase tracking-wider">
                  Tony&rsquo;s Tacos
                </p>
                <p
                  className="font-bold text-lg mt-0.5"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Free Taco Tuesday
                </p>
              </div>
              <span className="text-xs font-bold bg-[#A8E6CF] text-[#1a1a1a] px-2.5 py-1 rounded-full">
                7 / 10
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm font-bold ${
                    i < 7
                      ? 'bg-[#FFE566] text-[#1a1a1a]'
                      : 'bg-[#F5F4EF] text-[#C9C5BA] border border-[#E7E6DF]'
                  }`}
                >
                  {i < 7 ? <Icons.check className="w-3.5 h-3.5" /> : i + 1}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[#EDEBE3]">
              <p className="text-sm text-[#5A554C] text-center">
                3 more visits &rarr;{' '}
                <span className="font-bold text-[#1a1a1a]">1 free taco</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-[#9A9387]">
            This is what your customer sees on their phone &mdash; no app
            required.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Value pillars — why this is worth doing at all
   ──────────────────────────────────────────────────────────── */

function ValuePillars() {
  const pillars = [
    {
      icon: Icons.repeat,
      title: 'Customers come back more',
      body: 'A reward halfway finished is a reason to choose you over the place next door. That’s repeat business you’re not paying for ads to get.',
    },
    {
      icon: Icons.chart,
      title: 'You finally know your regulars',
      body: 'Real numbers instead of a shoebox of stamped cards: who’s coming back, how often, and what’s actually getting redeemed.',
    },
    {
      icon: Icons.spark,
      title: 'It runs itself',
      body: 'Once the code is on your counter, customers join on their own and a punch is one tap. No staff training, no daily upkeep.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20 border-y border-[#E7E6DF] bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="lp-eyebrow">Why owners do this</span>
          <h2
            className="mt-3 text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            The simplest marketing there is
          </h2>
          <p className="text-[#5A554C] mt-4 leading-relaxed">
            Give people a reason to come back, and they do. A punch card has
            always worked &mdash; LocalPunch just keeps it going without the
            paper, the reprints, or the guesswork.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {pillars.map(p => (
            <div key={p.title} className="lp-card p-6 sm:p-7">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#FFF7CC] text-[#1a1a1a] mb-4">
                <p.icon className="w-5 h-5" />
              </span>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {p.title}
              </h3>
              <p className="text-sm text-[#5A554C] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   No headache — answer the real fear of "one more piece of software"
   ──────────────────────────────────────────────────────────── */

function NoHeadache() {
  const items = [
    {
      no: 'No app for customers to download',
      yes: 'They scan a code and the card opens right in their phone’s browser. Most save it to their home screen.',
    },
    {
      no: 'No hardware or new register to buy',
      yes: 'It works on the phone or tablet you already keep at the counter. Nothing to plug in.',
    },
    {
      no: 'No contract and no setup fee',
      yes: 'Build the whole thing for free. You only pay when you flip it live, and you can cancel anytime.',
    },
    {
      no: 'No learning curve',
      yes: 'If you can send a text message, you can run this. At the counter it’s one button.',
    },
    {
      no: 'No data for you to manage',
      yes: 'Customers sign themselves up and their cards update on their own. You just tap to add a punch.',
    },
    {
      no: 'No getting stuck on your own',
      yes: 'Real email support from a person who built this — not a forum and a help center.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="lp-eyebrow">The honest part</span>
          <h2
            className="mt-3 text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Worried it&rsquo;s one more thing to deal with?
          </h2>
          <p className="text-[#5A554C] mt-4 leading-relaxed">
            That&rsquo;s the real reason most owners put this off. So
            here&rsquo;s every one of those reasons &mdash; and why it
            doesn&rsquo;t apply here.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(it => (
            <div
              key={it.no}
              className="lp-card p-5 sm:p-6 flex gap-4 items-start"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#A8E6CF] shrink-0 mt-0.5">
                <Icons.check className="w-4 h-4 text-[#1a1a1a]" />
              </span>
              <div>
                <p
                  className="font-bold text-[15px]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {it.no}
                </p>
                <p className="text-sm text-[#5A554C] leading-relaxed mt-1">
                  {it.yes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   How it works — setup steps + what the counter actually looks like
   ──────────────────────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Create your reward',
      body: 'Name the program, write the reward, choose how many punches. About a minute.',
    },
    {
      n: '2',
      title: 'Put the code on your counter',
      body: 'We make a QR code for you. Show it on a phone or tablet, or print it for the window.',
    },
    {
      n: '3',
      title: 'Start punching',
      body: 'New customers scan to join themselves. Regulars show their card, you tap once.',
    },
  ]
  return (
    <section
      id="how-it-works"
      className="px-5 py-16 sm:py-20 border-y border-[#E7E6DF] bg-white"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="lp-eyebrow">How it works</span>
          <h2
            className="mt-3 text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            From zero to running in about two minutes
          </h2>
          <p className="text-[#5A554C] mt-4 leading-relaxed">
            Three steps, nothing technical. Here&rsquo;s the setup &mdash; then
            what it looks like at the counter.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-14">
          {steps.map(s => (
            <div key={s.n} className="lp-card p-6 sm:p-7">
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] text-white font-bold mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.n}
              </div>
              <h3
                className="font-bold text-lg mb-1.5"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.title}
              </h3>
              <p className="text-[#5A554C] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="lp-card p-6 sm:p-9">
          <div className="text-center mb-9 max-w-xl mx-auto">
            <p
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              A regular&rsquo;s 7th visit, start to finish
            </p>
            <p className="text-sm text-[#5A554C] mt-2 leading-relaxed">
              Maria joined last week by scanning the code on your counter. No
              app, no signup form. This is the whole interaction.
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-3">
            <Scene
              label="What Maria sees"
              title="She pulls up her card"
              body="It’s saved to her home screen from last week. She taps it and shows you her phone."
            >
              <CustomerPhone punches={6} headline="Hi Maria" />
            </Scene>
            <Scene
              label="What you see"
              title="You tap one button"
              body="Your screen shows who it is and where they’re at. One tap. Under two seconds, even at a rush."
              accent
            >
              <MerchantPhone />
            </Scene>
            <Scene
              label="What Maria sees"
              title="Her card fills up"
              body="It updates on the spot. At 10 punches a Redeem button appears and she walks out a regular who’ll be back."
            >
              <CustomerPhone punches={7} highlight={7} headline="+1 punch" />
            </Scene>
          </div>

          <div className="mt-8 rounded-lg bg-[#FFF7CC] p-5 flex items-start gap-3 text-sm">
            <Icons.phone className="w-5 h-5 shrink-0 mt-0.5 text-[#1a1a1a]" />
            <p className="text-[#5A554C]">
              <span className="font-semibold text-[#1a1a1a]">
                Customer forgot their phone?
              </span>{' '}
              Add the punch by their phone number from your screen. They&rsquo;ll
              see it the next time they open their card.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Scene({
  label,
  title,
  body,
  children,
  accent,
}: {
  label: string
  title: string
  body: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-5 sm:p-6 border ${
        accent
          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
          : 'bg-[#FAFAF8] border-[#E7E6DF]'
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.12em] font-semibold mb-5 ${
          accent ? 'text-[#FFE566]' : 'text-[#9A9387]'
        }`}
      >
        {label}
      </p>
      <div className="flex justify-center mb-6">{children}</div>
      <h3
        className="font-bold text-base mb-1.5"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed ${
          accent ? 'text-white/70' : 'text-[#5A554C]'
        }`}
      >
        {body}
      </p>
    </div>
  )
}

function PhoneFrame({
  children,
  tone = 'light',
}: {
  children: React.ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <div className="mx-auto w-full max-w-[210px]">
      <div className="bg-[#1a1a1a] rounded-[2rem] p-1.5 shadow-[0_12px_28px_-12px_rgba(0,0,0,0.4)]">
        <div
          className={`rounded-[1.6rem] p-4 ${
            tone === 'dark' ? 'bg-[#FAFAF8]' : 'bg-white'
          }`}
        >
          <div className="mx-auto w-12 h-1 bg-[#E5E3DA] rounded-full mb-3" />
          {children}
        </div>
      </div>
    </div>
  )
}

function CustomerPhone({
  punches,
  highlight,
  headline,
}: {
  punches: number
  highlight?: number
  headline: string
}) {
  return (
    <PhoneFrame>
      <p className="text-[10px] font-bold text-[#9A9387] uppercase tracking-wider mb-1">
        {headline}
      </p>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] text-[#B0AB9E] uppercase tracking-wider font-semibold">
            Tony&rsquo;s Tacos
          </p>
          <p
            className="text-xs font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Free Taco
          </p>
        </div>
        <span className="text-[10px] font-bold bg-[#A8E6CF] text-[#1a1a1a] px-1.5 py-0.5 rounded-full">
          {punches}/10
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < punches
          const isNew = highlight !== undefined && i === highlight - 1
          return (
            <div
              key={i}
              className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-bold ${
                filled
                  ? isNew
                    ? 'bg-[#FFE566] text-[#1a1a1a] ring-2 ring-[#1a1a1a]/20'
                    : 'bg-[#FFE566] text-[#1a1a1a]'
                  : 'bg-[#F5F4EF] border border-[#E7E6DF] text-[#C9C5BA]'
              }`}
            >
              {filled ? <Icons.check className="w-2.5 h-2.5" /> : i + 1}
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-[#B0AB9E] mt-3 text-center">
        {10 - punches} more &rarr; free taco
      </p>
    </PhoneFrame>
  )
}

function MerchantPhone() {
  return (
    <PhoneFrame tone="dark">
      <p className="text-[10px] font-bold text-[#9A9387] uppercase tracking-wider mb-1">
        Merchant view
      </p>
      <p className="text-[9px] text-[#B0AB9E] uppercase tracking-wider font-semibold">
        Customer
      </p>
      <p
        className="text-sm font-bold mb-3"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        Maria &middot; (415) ••• 0142
      </p>
      <div className="bg-white border border-[#E7E6DF] rounded-lg p-2.5 mb-3">
        <p className="text-[9px] text-[#B0AB9E] uppercase tracking-wider font-semibold">
          Current progress
        </p>
        <p
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          6 / 10 punches
        </p>
        <div className="mt-1.5 h-1.5 rounded-full bg-[#F0EFE8] overflow-hidden">
          <div className="h-full bg-[#FFE566]" style={{ width: '60%' }} />
        </div>
      </div>
      <div
        className="w-full bg-[#FFE566] text-[#1a1a1a] text-xs font-bold py-3 rounded-lg text-center"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        + Add a punch
      </div>
      <p className="text-[9px] text-[#B0AB9E] mt-2 text-center">
        One tap. Done.
      </p>
    </PhoneFrame>
  )
}

/* ─────────────────────────────────────────────────────────────
   Value math — make the price feel obviously worth it
   ──────────────────────────────────────────────────────────── */

function ValueMath() {
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <span className="lp-eyebrow">The math</span>
        <h2
          className="mt-3 text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          $60 a month is{' '}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">one returning customer</span>
            <span className="absolute left-0 right-0 bottom-1 h-3 bg-[#FFE566] -z-0 rounded-sm" />
          </span>{' '}
          a week
        </h2>
        <p className="text-[#5A554C] mt-5 leading-relaxed text-lg">
          A returning customer is the cheapest sale you&rsquo;ll ever make
          &mdash; no ad spend, no discounting, they already like you. If
          LocalPunch brings back even a handful of people who&rsquo;d otherwise
          have drifted, it has more than paid for itself. And most owners are
          trying to bring back a lot more than a handful.
        </p>
        <div className="mt-9">
          <Link
            href="/login?role=business"
            className="nb-btn-primary text-base font-semibold px-7 py-3.5"
            data-ga-event="cta_click"
            data-ga-location="home_value_math"
            data-ga-label="setup_my_shop"
          >
            Set up my shop &mdash; free to start
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Pricing
   ──────────────────────────────────────────────────────────── */

function Pricing() {
  const features = [
    'Unlimited loyalty programs',
    'Unlimited customers & punches',
    'Anti-fraud rotating QR codes',
    'Manual punch by phone number',
    'Analytics & redemption rates',
    'CSV customer export',
    'Customer card portal + email support',
  ]
  return (
    <section
      id="pricing"
      className="px-5 py-16 sm:py-20 border-y border-[#E7E6DF] bg-white"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="lp-eyebrow">Pricing</span>
          <h2
            className="mt-3 text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            One plan. Everything included.
          </h2>
          <p className="text-[#5A554C] mt-4 leading-relaxed">
            Build the whole thing for free. You only pay when you&rsquo;re ready
            to let customers start collecting punches.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <PricingCard
            title="Monthly"
            price="$60"
            suffix="/month"
            subline="Billed monthly · cancel anytime"
            cta="Start monthly"
            features={features}
          />
          <PricingCard
            title="Yearly"
            price="$600"
            suffix="/year"
            subline="Billed once a year · two months free"
            cta="Start yearly"
            features={features}
            highlight
            badge="Best value"
          />
        </div>

        <p className="text-xs text-[#9A9387] text-center mt-6">
          Prices in USD. Secure checkout and billing via Stripe. No setup fees,
          no hidden costs, cancel from your portal anytime.
        </p>
      </div>
    </section>
  )
}

function PricingCard({
  title,
  price,
  suffix,
  subline,
  cta,
  features,
  highlight,
  badge,
}: {
  title: string
  price: string
  suffix: string
  subline: string
  cta: string
  features: string[]
  highlight?: boolean
  badge?: string
}) {
  return (
    <div
      className={`rounded-xl p-7 flex flex-col border ${
        highlight
          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
          : 'lp-card text-[#1a1a1a]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-sm font-bold uppercase tracking-[0.12em]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </p>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] bg-[#FFE566] text-[#1a1a1a] px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <p
          className="text-5xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {price}
        </p>
        <span
          className={`text-base font-medium ${
            highlight ? 'text-white/70' : 'text-[#9A9387]'
          }`}
        >
          {suffix}
        </span>
      </div>
      <p
        className={`text-xs mt-1 ${highlight ? 'text-white/60' : 'text-[#9A9387]'}`}
      >
        {subline}
      </p>

      <ul className="mt-6 space-y-2.5 text-sm flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className={`inline-flex w-5 h-5 rounded-full items-center justify-center shrink-0 mt-0.5 ${
                highlight ? 'bg-[#FFE566] text-[#1a1a1a]' : 'bg-[#A8E6CF] text-[#1a1a1a]'
              }`}
            >
              <Icons.check className="w-3 h-3" />
            </span>
            <span className={highlight ? 'text-white/85' : 'text-[#5A554C]'}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/login?role=business"
        className={`mt-7 ${
          highlight ? 'nb-btn-primary' : 'nb-btn-dark'
        } font-semibold py-3`}
        data-ga-event="cta_click"
        data-ga-location="home_pricing"
        data-ga-label={highlight ? 'pricing_yearly' : 'pricing_monthly'}
      >
        {cta} &rarr;
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FAQ
   ──────────────────────────────────────────────────────────── */

function FAQ() {
  const items = FAQ_ITEMS
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="lp-eyebrow">Questions other owners asked</span>
          <h2
            className="mt-3 text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Yeah, but what if&hellip;
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <details key={i} className="group lp-card overflow-hidden">
              <summary
                className="flex items-center justify-between cursor-pointer list-none p-5 text-[15px] font-bold"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span>{it.q}</span>
                <span className="text-[#9A9387] text-xl leading-none transition-transform group-open:rotate-45 shrink-0 ml-4">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[#5A554C] leading-relaxed">
                {it.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Final CTA
   ──────────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="px-5 pb-20">
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#1a1a1a] text-white p-10 sm:p-14 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Your regulars are already coming in.
        </h2>
        <p className="mt-3 text-white/70 max-w-md mx-auto leading-relaxed">
          Give them a reason to come back sooner. Build your first reward and put
          a code on the counter today &mdash; it&rsquo;s free until you go live.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?role=business"
            className="nb-btn-primary w-full sm:w-auto text-base font-semibold px-7 py-3.5"
            data-ga-event="cta_click"
            data-ga-location="home_final_cta"
            data-ga-label="setup_my_shop"
          >
            Set up my shop &mdash; free to start
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-white/80 hover:text-white font-medium px-7 py-3.5 underline underline-offset-4"
            data-ga-event="cta_click"
            data-ga-location="home_final_cta"
            data-ga-label="sign_in"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-5 text-xs text-white/50">
          $60/month or $600/year &middot; No setup fee &middot; Cancel anytime
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#E7E6DF] py-8 px-5 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9A9387]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-[#FFE566] border border-[#E0CF4A] rounded text-xs">
            🥊
          </span>
          <span className="font-bold text-[#1a1a1a]">LocalPunch</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/for/coffee-shops" className="hover:text-[#1a1a1a]">
            Coffee shops
          </Link>
          <Link href="/blog" className="hover:text-[#1a1a1a]">
            Blog
          </Link>
          <Link href="/pricing" className="hover:text-[#1a1a1a]">
            Pricing
          </Link>
          <Link href="/privacy-policy" className="hover:text-[#1a1a1a]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#1a1a1a]">
            Terms
          </Link>
          <Link href="/login" className="hover:text-[#1a1a1a]">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  )
}
