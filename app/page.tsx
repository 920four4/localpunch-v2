import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LocalPunch — Digital Punch Cards That Bring Regulars Back',
  description:
    'Replace lost paper punch cards with a digital loyalty program your customers can’t lose. No hardware, no app downloads, set up in two minutes. $60/mo or $600/yr.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a1a]">
      <Header />

      <main>
        <Hero />
        <PainPoints />
        <InStoreDemo />
        <SetupSteps />
        <ForBusinesses />
        <SocialProof />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Header
   ──────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[#FAFAF8]/85 border-b-2 border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-5 h-15 py-2.5 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-md text-sm shadow-[2px_2px_0_#1a1a1a]">
            🥊
          </span>
          LocalPunch
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            href="#pricing"
            className="hidden sm:inline text-[#4B5563] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="hidden sm:inline text-[#4B5563] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="text-[#4B5563] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            Sign in
          </Link>
          <Link href="/login?role=business" className="nb-btn-dark text-sm px-4 py-2">
            Start free →
          </Link>
        </nav>
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────
   Hero — strong value prop + the real product front and center
   ──────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="px-5 pt-14 pb-16 sm:pt-20 sm:pb-24">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="inline-block text-xs font-bold text-[#1a1a1a] bg-[#A8E6CF] border-2 border-[#1a1a1a] px-3 py-1 rounded-full tracking-wide uppercase mb-6 shadow-[2px_2px_0_#1a1a1a]">
            Loyalty for local businesses
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.04]"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Your regulars forget the card.
            <br />
            <span className="bg-[#FFE566] box-decoration-clone px-2 rounded">
              They never forget their phone.
            </span>
          </h1>
          <p className="mt-6 text-lg text-[#4B5563] max-w-xl mx-auto lg:mx-0 leading-relaxed">
            LocalPunch turns the paper punch card you keep reprinting into a digital
            one your customers can&rsquo;t lose &mdash; and finally shows you who&rsquo;s
            actually coming back. No hardware. No app downloads. Live in two minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
            <Link
              href="/login?role=business"
              className="nb-btn-primary w-full sm:w-auto text-base font-semibold px-7 py-3.5"
            >
              Set up my shop &mdash; free
            </Link>
            <Link
              href="#how-it-works"
              className="nb-btn-ghost w-full sm:w-auto text-base font-medium px-7 py-3.5"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-5 text-xs text-[#6B7280]">
            Free to sign up and set up &middot; You only pay when you go live &middot;
            Cancel anytime
          </p>
        </div>

        {/* Card preview */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -top-3 -right-2 z-10 hidden sm:block rotate-6">
            <span className="inline-block text-xs font-bold bg-[#FF6B6B] text-white border-2 border-[#1a1a1a] px-3 py-1.5 rounded-full shadow-[2px_2px_0_#1a1a1a]">
              No app to install
            </span>
          </div>
          <div className="nb-card-flat p-6 bg-white">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-[#6B7280] font-semibold uppercase tracking-wider">
                  Tony&rsquo;s Tacos
                </p>
                <p
                  className="font-bold text-lg mt-0.5"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  🌮 Free Taco Tuesday
                </p>
              </div>
              <span className="text-xs font-bold bg-[#A8E6CF] text-[#1a1a1a] border-2 border-[#1a1a1a] px-2.5 py-1 rounded-full">
                7/10
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-sm font-bold ${
                    i < 7
                      ? 'bg-[#FFE566] text-[#1a1a1a]'
                      : 'bg-[#F9FAFB] text-[#D1D5DB] border-[#D1D5DB]'
                  }`}
                >
                  {i < 7 ? '✓' : i + 1}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t-2 border-dashed border-[#E5E7EB]">
              <p className="text-sm text-[#4B5563] text-center font-medium">
                3 more punches &rarr;{' '}
                <span className="font-bold text-[#1a1a1a]">1 free taco</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Pain points — name the problem before selling the fix
   ──────────────────────────────────────────────────────────── */

function PainPoints() {
  const pains = [
    {
      icon: '🗑️',
      bad: 'Paper cards get lost.',
      good: 'Customers lose the card, lose the streak, and stop coming back. A digital card lives on their phone — it never ends up in the wash.',
    },
    {
      icon: '👻',
      bad: 'You have no idea who your regulars are.',
      good: 'A stack of stamped cards tells you nothing. LocalPunch shows you customers, repeat visits, and redemptions in plain numbers.',
    },
    {
      icon: '✏️',
      bad: 'Anyone can draw a stamp.',
      good: 'A pen and a photocopier defeat a paper card. Our QR rotates every few minutes and counts one punch per customer, per day.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20 bg-white border-y-2 border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-3">
            The problem with paper
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Punch cards work. The paper doesn&rsquo;t.
          </h2>
          <p className="text-[#4B5563] mt-3 max-w-xl mx-auto leading-relaxed">
            Loyalty cards bring people back &mdash; that&rsquo;s why every café has
            them. The cardboard is the part that keeps failing you.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {pains.map(p => (
            <div key={p.bad} className="nb-card-flat p-6 bg-[#FAFAF8]">
              <div className="text-3xl mb-4">{p.icon}</div>
              <p
                className="font-bold text-lg mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {p.bad}
              </p>
              <p className="text-sm text-[#4B5563] leading-relaxed">{p.good}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   In-store demo — the actual flow, both sides of the counter
   ──────────────────────────────────────────────────────────── */

function InStoreDemo() {
  return (
    <section id="how-it-works" className="px-5 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-3">
            How it works
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Here&rsquo;s a Tuesday at your counter.
          </h2>
          <p className="text-[#4B5563] mt-4 max-w-xl mx-auto leading-relaxed">
            Maria is a regular. She joined last week by scanning the QR on your
            counter &mdash; no app, no signup form. This is her 7th punch, start to
            finish.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Scene
            n="1"
            label="What Maria sees"
            title="She pulls up her card."
            body="No app to install. She tapped a link once last week and saved it to her home screen. She shows you her phone."
          >
            <CustomerPhone punches={6} headline="Hi Maria 👋" />
          </Scene>

          <Scene
            n="2"
            label="What you see on your phone"
            title="You tap one button."
            body="Your merchant screen shows who it is and where they're at. One big button. One tap. Under two seconds, even at a lunch rush."
            accent
          >
            <MerchantPhone />
          </Scene>

          <Scene
            n="3"
            label="What Maria sees"
            title="Her card fills up instantly."
            body="Her phone updates on the spot. At 10 punches a 'Redeem' button appears, you tap it together, and she walks out a regular who'll be back."
          >
            <CustomerPhone punches={7} highlight={7} headline="+1 punch 🎉" />
          </Scene>
        </div>

        <div className="mt-10 nb-card-flat bg-[#FFE566] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-white border-2 border-[#1a1a1a] text-lg shrink-0">
              💬
            </span>
            <p className="text-[#1a1a1a]">
              <span className="font-bold">Customer forgot their phone?</span> Punch it
              by their phone number from your merchant screen. They&rsquo;ll see it the
              next time they open their card.
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
      className={`nb-card-flat p-6 sm:p-7 ${
        accent ? 'bg-[#1a1a1a] text-white' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold border-2 border-[#1a1a1a] ${
            accent ? 'bg-[#FFE566] text-[#1a1a1a]' : 'bg-[#1a1a1a] text-white'
          }`}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {n}
        </span>
        <p
          className={`text-[11px] uppercase tracking-widest font-bold ${
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
        className={`text-sm leading-relaxed ${accent ? 'text-white/75' : 'text-[#4B5563]'}`}
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
    <div className="mx-auto w-full max-w-[220px]">
      <div className="bg-[#1a1a1a] rounded-[2rem] p-1.5 border-2 border-[#1a1a1a] shadow-[4px_4px_0_rgba(0,0,0,0.25)]">
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
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
        {headline}
      </p>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
            Tony&rsquo;s Tacos
          </p>
          <p
            className="text-xs font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            🌮 Free Taco
          </p>
        </div>
        <span className="text-[10px] font-bold bg-[#A8E6CF] text-[#1a1a1a] border border-[#1a1a1a] px-1.5 py-0.5 rounded-full">
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
                    ? 'bg-[#FFE566] border-[#1a1a1a] text-[#1a1a1a] ring-2 ring-[#1a1a1a]/25'
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
        {10 - punches} more &rarr; free taco
      </p>
    </PhoneFrame>
  )
}

function MerchantPhone() {
  return (
    <PhoneFrame tone="dark">
      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">
        Merchant view
      </p>
      <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
        Customer
      </p>
      <p
        className="text-sm font-bold mb-3"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        Maria &middot; (415) ••• 0142
      </p>

      <div className="bg-white border-2 border-[#1a1a1a] rounded-lg p-2.5 mb-3">
        <p className="text-[9px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
          Current progress
        </p>
        <p
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          6 / 10 punches
        </p>
        <div className="mt-1.5 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden border border-[#1a1a1a]">
          <div className="h-full bg-[#FFE566]" style={{ width: '60%' }} />
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-[#FFE566] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs font-bold py-3 rounded-lg shadow-[2px_2px_0_#1a1a1a] active:translate-y-[1px]"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        + Add a punch
      </button>
      <p className="text-[9px] text-[#9CA3AF] mt-2 text-center">One tap. Done.</p>
    </PhoneFrame>
  )
}

/* ─────────────────────────────────────────────────────────────
   Setup steps — what the owner does to go live
   ──────────────────────────────────────────────────────────── */

function SetupSteps() {
  const steps = [
    {
      n: '1',
      title: 'Create your reward',
      body: 'Name the program, write the reward, pick how many punches (1–100). About 60 seconds.',
    },
    {
      n: '2',
      title: 'Put up the QR',
      body: 'We generate a QR for your counter. Keep it open on a phone or tablet, or print it for the window.',
    },
    {
      n: '3',
      title: 'Start punching',
      body: 'New customers scan to join. Regulars show their card, you tap once. Watch the dashboard fill in.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20 bg-white border-y-2 border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-3">
            Setup
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            You&rsquo;re running it in under two minutes.
          </h2>
          <p className="text-[#4B5563] mt-3">Three steps. Nothing technical.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map(s => (
            <div key={s.n} className="nb-card-flat p-6 bg-[#FAFAF8]">
              <div
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#FFE566] border-2 border-[#1a1a1a] font-bold text-[#1a1a1a] mb-4 shadow-[2px_2px_0_#1a1a1a]"
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
              <p className="text-[#4B5563] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/login?role=business"
            className="nb-btn-primary text-base font-semibold px-7 py-3.5"
          >
            Create my first reward &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Why owners run it this way
   ──────────────────────────────────────────────────────────── */

function ForBusinesses() {
  const features = [
    {
      icon: '⚡',
      title: 'No hardware to buy',
      body: 'Any phone or tablet with a browser. Most owners just use their own phone at the counter.',
    },
    {
      icon: '📱',
      title: 'No app for customers',
      body: 'They scan a QR with their camera and enter a phone number. Most save the card to their home screen.',
    },
    {
      icon: '🛡️',
      title: 'Hard to game',
      body: 'The counter QR rotates every 5 minutes and counts one punch per customer per day. No screenshot fraud.',
    },
    {
      icon: '📊',
      title: 'Numbers, not a shoebox',
      body: 'See customers, total punches, redemptions and redemption rates per program. Export the list to CSV anytime.',
    },
    {
      icon: '🔁',
      title: 'Built for repeat visits',
      body: 'The whole point: a reward in progress is a reason to come back instead of going somewhere else.',
    },
    {
      icon: '🧾',
      title: 'One simple price',
      body: 'Everything unlimited, billed through Stripe. Cancel anytime from your billing portal — no contract.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-3">
            For business owners
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Built for how you actually run the place.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="nb-card-flat p-6 bg-white">
              <div className="text-2xl mb-3">{f.icon}</div>
              <p
                className="font-bold mb-1.5"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {f.title}
              </p>
              <p className="text-sm text-[#4B5563] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Social proof — honest, non-fabricated framing
   ──────────────────────────────────────────────────────────── */

function SocialProof() {
  return (
    <section className="px-5 py-16 sm:py-20 bg-[#1a1a1a] text-white border-y-2 border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-[#FFE566] tracking-widest uppercase mb-3">
            Why loyalty works
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Regulars are cheaper than new customers.
          </h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto leading-relaxed">
            You already know it from behind the counter. A punch card just makes the
            next visit the obvious choice &mdash; LocalPunch makes sure the card is
            always in their pocket.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              big: '0',
              label: 'Apps your customers download',
              sub: 'They scan a QR and they’re in.',
            },
            {
              big: '~2 min',
              label: 'To set up and go live',
              sub: 'One reward, one QR, done.',
            },
            {
              big: '1 tap',
              label: 'To add a punch at the counter',
              sub: 'Even during a rush.',
            },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-lg border-2 border-white/20 bg-white/5 p-6 text-center"
            >
              <p
                className="text-4xl font-bold text-[#FFE566]"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.big}
              </p>
              <p className="font-semibold mt-2">{s.label}</p>
              <p className="text-sm text-white/60 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border-2 border-white/20 bg-white/5 p-6 sm:p-8 text-center max-w-2xl mx-auto">
          <p className="text-lg sm:text-xl leading-relaxed">
            &ldquo;Bring back the punch card you already had &mdash; minus the
            reprints, minus the guesswork.&rdquo;
          </p>
          <p className="text-sm text-white/50 mt-4">
            We&rsquo;re early, so we&rsquo;d rather earn your trust than borrow
            someone else&rsquo;s logo. Be one of the first shops on board.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Pricing — exactly what Stripe is configured for
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
    <section id="pricing" className="px-5 py-16 sm:py-20 bg-white border-y-2 border-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-3">
            Pricing
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            One plan. Everything unlimited.
          </h2>
          <p className="text-[#4B5563] mt-3 max-w-xl mx-auto leading-relaxed">
            Sign up and build your whole program for free. You only pay when
            you&rsquo;re ready to flip it live for customers.
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
            subline="Billed once a year · 2 months free"
            cta="Start yearly"
            features={features}
            highlight
            badge="Best value"
          />
        </div>

        <p className="text-xs text-[#6B7280] text-center mt-6">
          Prices in USD. Secure checkout and billing portal via Stripe. No setup fees,
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
      className={`nb-card-flat p-7 flex flex-col ${
        highlight ? 'bg-[#1a1a1a] text-white' : 'bg-[#FAFAF8] text-[#1a1a1a]'
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
          <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FFE566] text-[#1a1a1a] border-2 border-[#1a1a1a] px-2 py-0.5 rounded-full">
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
            highlight ? 'text-white/70' : 'text-[#6B7280]'
          }`}
        >
          {suffix}
        </span>
      </div>
      <p className={`text-xs mt-1 ${highlight ? 'text-white/60' : 'text-[#6B7280]'}`}>
        {subline}
      </p>

      <ul className="mt-6 space-y-2.5 text-sm flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              className={`inline-flex w-5 h-5 rounded-full items-center justify-center text-xs font-bold border-2 border-[#1a1a1a] shrink-0 mt-0.5 ${
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
        className={`mt-7 ${highlight ? 'nb-btn-primary' : 'nb-btn-dark'} font-semibold py-3`}
      >
        {cta} &rarr;
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   FAQ — the "yeah but" questions every non-tech owner asks
   ──────────────────────────────────────────────────────────── */

function FAQ() {
  const items = [
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
      a: 'Signing up and building your entire program — business, rewards, everything — is free. You only pay once you flip the shop live so customers can collect punches. It’s $60/month or $600/year (two months free), everything unlimited, cancel anytime from the Stripe billing portal.',
    },
    {
      q: 'What if I’m not "techy"?',
      a: 'If you can send a text message, you can run LocalPunch. At the counter the merchant screen is basically one button.',
    },
  ]
  return (
    <section className="px-5 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-[#6B7280] tracking-widest uppercase mb-3">
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
              className="group nb-card-flat bg-white overflow-hidden"
            >
              <summary
                className="flex items-center justify-between cursor-pointer list-none p-5 text-[15px] font-bold"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span>{it.q}</span>
                <span className="text-[#1a1a1a] text-xl leading-none transition-transform group-open:rotate-45 shrink-0 ml-4">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm text-[#4B5563] leading-relaxed">
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
    <section className="px-5 py-20">
      <div className="max-w-3xl mx-auto nb-card-flat bg-[#1a1a1a] text-white p-10 sm:p-14 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Stop reprinting punch cards.
        </h2>
        <p className="mt-3 text-white/70 max-w-md mx-auto leading-relaxed">
          Set up your shop, build your first reward, and put a QR on the counter
          today. It&rsquo;s free until you go live.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?role=business"
            className="nb-btn-primary w-full sm:w-auto text-base font-semibold px-7 py-3.5"
          >
            Set up my shop &mdash; free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-white/80 hover:text-white font-medium px-7 py-3.5 underline underline-offset-4"
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
    <footer className="border-t-2 border-[#1a1a1a] py-8 px-5 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-[#FFE566] border-2 border-[#1a1a1a] rounded text-xs">
            🥊
          </span>
          <span className="font-bold text-[#1a1a1a]">LocalPunch</span>
          <span className="text-[#9CA3AF]">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/blog" className="hover:text-[#1a1a1a]">
            Blog
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
