import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a1a]">
      <Header />

      <main>
        <Hero />
        <InStoreDemo />
        <SetupSteps />
        <ForBusinesses />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[#FAFAF8]/80 border-b border-[#1a1a1a]/10">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#FFE566] rounded-md text-sm">🥊</span>
          LocalPunch
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          <Link href="/login" className="text-[#6B7280] hover:text-[#1a1a1a] px-2 py-1.5">
            Sign in
          </Link>
          <Link
            href="/login?role=business"
            className="bg-[#1a1a1a] text-white rounded-full px-4 py-1.5 font-medium hover:bg-black"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="px-5 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-5">
          For local businesses
        </span>
        <h1
          className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Punch cards, <span className="bg-[#FFE566] px-2 rounded">without the paper.</span>
        </h1>
        <p className="mt-6 text-lg text-[#4B5563] max-w-xl mx-auto leading-relaxed">
          Reward your regulars with a digital loyalty card they can&rsquo;t lose.
          Set up your shop in two minutes — no hardware, no app downloads.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?role=business"
            className="w-full sm:w-auto bg-[#1a1a1a] text-white rounded-full px-6 py-3 font-semibold hover:bg-black transition"
          >
            Set up my business
          </Link>
          <Link
            href="#pricing"
            className="w-full sm:w-auto text-[#1a1a1a] rounded-full px-6 py-3 font-medium hover:bg-[#1a1a1a]/5 transition"
          >
            See pricing →
          </Link>
        </div>

        <p className="mt-5 text-xs text-[#9CA3AF]">
          $60/month or $600/year · Free to set up · Cancel anytime
        </p>
      </div>

      {/* Card preview */}
      <div className="max-w-md mx-auto mt-14">
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">Tony&rsquo;s Tacos</p>
              <p className="font-semibold mt-0.5" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                🌮 Free Taco Tuesday
              </p>
            </div>
            <span className="text-xs font-semibold bg-[#A8E6CF] text-[#1a1a1a] px-2 py-1 rounded-full">
              7/10
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-full border-2 flex items-center justify-center text-sm font-bold transition ${
                  i < 7
                    ? 'bg-[#FFE566] border-[#1a1a1a] text-[#1a1a1a]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#D1D5DB]'
                }`}
              >
                {i < 7 ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#6B7280] mt-4 text-center">
            3 more punches → 1 free taco of your choice
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   In-store demo: show the actual flow in plain language,
   with both the customer phone and your merchant view visible.
   ──────────────────────────────────────────────────────────── */

function InStoreDemo() {
  return (
    <section className="px-5 py-16 sm:py-20 bg-white border-y border-[#1a1a1a]/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
            A Tuesday at Tony&rsquo;s Tacos
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Here&rsquo;s what it looks like at your counter.
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-xl mx-auto leading-relaxed">
            Maria is one of your regulars. She signed up last week by scanning the QR on your
            counter. Today is her 7th visit. Watch how her 7th punch happens, start to finish.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Scene 1 — she shows her phone */}
          <Scene
            n="1"
            label="What Maria sees"
            title="She pulls up her card."
            body="No app to install. She tapped a link once last week and saved it to her home screen. She shows you her phone."
          >
            <CustomerPhone punches={6} headline="Hi Maria 👋" />
          </Scene>

          {/* Scene 2 — you add a punch */}
          <Scene
            n="2"
            label="What you see on your tablet"
            title="You tap one button."
            body="Your merchant view shows who it is and their current progress. One big button. One tap. Under two seconds."
            accent
          >
            <MerchantPhone />
          </Scene>

          {/* Scene 3 — her card updates */}
          <Scene
            n="3"
            label="What Maria sees"
            title="Her card fills up. Instantly."
            body="Her phone updates on the spot. At 10 punches, a ‘Redeem free taco’ button appears. You tap ‘Redeem’ together and she walks out happy."
          >
            <CustomerPhone punches={7} highlight={7} headline="+1 punch 🎉" />
          </Scene>
        </div>

        {/* footer strip under scenes */}
        <div className="mt-12 rounded-2xl border border-[#1a1a1a]/10 bg-[#FAFAF8] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#FFE566] text-lg">
              💬
            </span>
            <p className="text-[#4B5563]">
              <span className="font-semibold text-[#1a1a1a]">Forgot their phone?</span>{' '}
              Punch it by their phone number. They&rsquo;ll see it next time they open their card.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Scene({
  n,
  label,
  title,
  body,
  children,
  accent,
}: {
  n: string
  label: string
  title: string
  body: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 border ${
        accent ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-[#FAFAF8] border-[#E5E7EB]'
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold ${
            accent ? 'bg-[#FFE566] text-[#1a1a1a]' : 'bg-[#1a1a1a] text-white'
          }`}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {n}
        </span>
        <p
          className={`text-[11px] uppercase tracking-widest font-semibold ${
            accent ? 'text-[#FFE566]' : 'text-[#6B7280]'
          }`}
        >
          {label}
        </p>
      </div>

      <div className="flex justify-center mb-6">{children}</div>

      <h3
        className="font-bold text-lg mb-2"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed ${accent ? 'text-white/75' : 'text-[#6B7280]'}`}
      >
        {body}
      </p>
    </div>
  )
}

/* Mini phone mockup used inside demo scenes */
function PhoneFrame({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div className="mx-auto w-full max-w-[220px]">
      <div className="bg-[#1a1a1a] rounded-[2rem] p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.18)]">
        <div
          className={`rounded-[1.6rem] p-4 ${
            tone === 'dark' ? 'bg-[#FAFAF8]' : 'bg-white'
          }`}
        >
          <div className="mx-auto w-12 h-1 bg-[#E5E7EB] rounded-full mb-3" />
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
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
        {headline}
      </p>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider font-medium">
            Tony&rsquo;s Tacos
          </p>
          <p
            className="text-xs font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            🌮 Free Taco
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
              className={`aspect-square rounded-full border flex items-center justify-center text-[10px] font-bold ${
                filled
                  ? isNew
                    ? 'bg-[#FFE566] border-[#1a1a1a] text-[#1a1a1a] ring-2 ring-[#1a1a1a]/20'
                    : 'bg-[#FFE566] border-[#1a1a1a] text-[#1a1a1a]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#D1D5DB]'
              }`}
            >
              {filled ? '✓' : i + 1}
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-[#9CA3AF] mt-3 text-center">
        {10 - punches} more → free taco
      </p>
    </PhoneFrame>
  )
}

function MerchantPhone() {
  return (
    <PhoneFrame tone="dark">
      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
        Merchant view
      </p>
      <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider font-medium">
        Customer
      </p>
      <p
        className="text-sm font-bold mb-3"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        Maria · (415) ••• 0142
      </p>

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-2.5 mb-3">
        <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider font-medium">
          Current progress
        </p>
        <p
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          6 / 10 punches
        </p>
        <div className="mt-1.5 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div className="h-full bg-[#FFE566]" style={{ width: '60%' }} />
        </div>
      </div>

      <button
        className="w-full bg-[#1a1a1a] text-white text-xs font-bold py-3 rounded-lg shadow-[0_2px_0_#000] active:translate-y-[1px]"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        + Add a punch
      </button>
      <p className="text-[9px] text-[#9CA3AF] mt-2 text-center">Taps once. Done.</p>
    </PhoneFrame>
  )
}

/* ─────────────────────────────────────────────────────────────
   Setup steps: what the business owner does to get going.
   ──────────────────────────────────────────────────────────── */

function SetupSteps() {
  const steps = [
    {
      n: '1',
      title: 'Create your card',
      body: 'Name it, pick a reward, choose how many punches. 60 seconds.',
    },
    {
      n: '2',
      title: 'Print the QR',
      body: 'We give you a QR poster. Tape it to your counter or window.',
    },
    {
      n: '3',
      title: 'Start punching',
      body: 'New customers scan the QR to join. Regulars show their card. You tap once.',
    },
  ]
  return (
    <section className="px-5 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
            Setup
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            You&rsquo;re running it in under 2 minutes.
          </h2>
          <p className="text-[#6B7280] mt-3">Three things, nothing technical.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map(s => (
            <div key={s.n} className="text-center sm:text-left">
              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFE566] font-bold text-[#1a1a1a] mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.n}
              </div>
              <h3
                className="font-semibold text-lg mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.title}
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ForBusinesses() {
  const features = [
    { icon: '⚡', title: 'No hardware', body: 'Just a phone or tablet on your counter.' },
    { icon: '📱', title: 'No customer app', body: 'They scan with their camera. That&rsquo;s it.' },
    { icon: '🛡️', title: 'Hard to cheat', body: 'QR codes rotate. One punch per visit, per customer.' },
    { icon: '📊', title: 'Real numbers', body: 'See active customers, redemptions, and repeat visits.' },
  ]
  return (
    <section className="px-5 py-16 bg-white border-y border-[#1a1a1a]/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Built for the way you actually run things.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div
              key={f.title}
              className="rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] p-5 hover:border-[#1a1a1a]/30 transition"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <p
                className="font-semibold mb-1"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {f.title}
              </p>
              <p
                className="text-sm text-[#6B7280] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: f.body }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Pricing: one flat plan, monthly or yearly. No free tier —
   you can sign up and set up for free, activation requires payment.
   ──────────────────────────────────────────────────────────── */

function Pricing() {
  const features = [
    'Unlimited loyalty cards',
    'Unlimited customers',
    'Unlimited punches & redemptions',
    'Anti-fraud rotating QR codes',
    'Analytics & CSV exports',
    'Customer portal + email support',
  ]
  return (
    <section id="pricing" className="px-5 py-20 bg-white border-y border-[#1a1a1a]/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
            Pricing
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            One plan. Everything unlimited.
          </h2>
          <p className="text-[#6B7280] mt-3 max-w-xl mx-auto">
            Sign up and set up for free. You only pay when you&rsquo;re ready to go live.
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
            subline="Billed once a year · save $120"
            cta="Start yearly"
            features={features}
            highlight
            badge="2 months free"
          />
        </div>

        <p className="text-xs text-[#9CA3AF] text-center mt-6">
          All prices in USD. Secure checkout via Stripe. No setup fees, no hidden costs.
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
      className={`rounded-2xl p-7 flex flex-col ${
        highlight
          ? 'bg-[#1a1a1a] text-white border border-[#1a1a1a]'
          : 'bg-[#FAFAF8] text-[#1a1a1a] border border-[#E5E7EB]'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </p>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FFE566] text-[#1a1a1a] px-2 py-0.5 rounded-full">
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
        <span className={`text-base font-medium ${highlight ? 'text-white/70' : 'text-[#6B7280]'}`}>
          {suffix}
        </span>
      </div>
      <p className={`text-xs mt-1 ${highlight ? 'text-white/60' : 'text-[#9CA3AF]'}`}>
        {subline}
      </p>

      <ul className="mt-6 space-y-2 text-sm flex-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2">
            <span
              className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold ${
                highlight ? 'bg-[#FFE566] text-[#1a1a1a]' : 'bg-[#1a1a1a] text-white'
              }`}
            >
              ✓
            </span>
            <span className={highlight ? 'text-white/85' : 'text-[#4B5563]'}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/login?role=business"
        className={`mt-7 block text-center font-semibold py-3 rounded-full transition ${
          highlight
            ? 'bg-[#FFE566] text-[#1a1a1a] hover:bg-yellow-300'
            : 'bg-[#1a1a1a] text-white hover:bg-black'
        }`}
      >
        {cta} →
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FAQ: answer the "but what if..." questions every
   non-tech owner asks before signing up.
   ──────────────────────────────────────────────────────────── */

function FAQ() {
  const items = [
    {
      q: 'Do I need a new iPad or register?',
      a: 'No. Any phone or tablet with a web browser works. Most owners use their own phone at the counter.',
    },
    {
      q: 'Do my customers need to download an app?',
      a: 'Never. They scan a QR code, type their phone number, and get a card that lives in their browser. Most save it to their home screen.',
    },
    {
      q: 'What if someone tries to cheat?',
      a: 'The QR code on your counter rotates every few minutes, so no one can screenshot it and punch themselves from home. One punch per customer, per visit.',
    },
    {
      q: 'What if a customer forgets their phone?',
      a: 'You can punch by phone number from your merchant view. Their card updates the next time they open it.',
    },
    {
      q: 'How much does it cost?',
      a: '$60 per month or $600 per year (two months free). One flat price, everything unlimited \u2014 cards, customers, punches, redemptions, analytics. No setup fees. Cancel anytime from your billing portal.',
    },
    {
      q: 'What if I\u2019m not "techy"?',
      a: 'If you can send a text message, you can run LocalPunch. The whole merchant screen is one button most of the time.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-medium text-[#6B7280] tracking-widest uppercase mb-3">
            Questions other owners asked
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Yeah, but what if&hellip;
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <details
              key={i}
              className="group rounded-xl bg-white border border-[#E5E7EB] open:border-[#1a1a1a]/30 transition"
            >
              <summary
                className="flex items-center justify-between cursor-pointer list-none p-5 text-[15px] font-semibold"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span>{it.q}</span>
                <span className="text-[#9CA3AF] text-xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[#4B5563] leading-relaxed">{it.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="px-5 py-20">
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#1a1a1a] text-white p-10 sm:p-14 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Ready in two minutes.
        </h2>
        <p className="mt-3 text-white/70 max-w-md mx-auto">
          Set up your shop, create your first reward, and put a QR on the counter today.
        </p>
        <Link
          href="/login?role=business"
          className="inline-block mt-7 bg-[#FFE566] text-[#1a1a1a] rounded-full px-7 py-3 font-semibold hover:bg-yellow-300 transition"
        >
          Get started
        </Link>
        <p className="mt-4 text-xs text-white/50">
          $60/month or $600/year · Cancel anytime
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a]/10 py-8 px-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-[#FFE566] rounded text-xs">🥊</span>
          <span className="font-medium text-[#1a1a1a]">LocalPunch</span>
          <span className="text-[#9CA3AF]">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/privacy-policy" className="hover:text-[#1a1a1a]">Privacy</Link>
          <Link href="/terms" className="hover:text-[#1a1a1a]">Terms</Link>
          <Link href="/login" className="hover:text-[#1a1a1a]">Sign in</Link>
        </div>
      </div>
    </footer>
  )
}
