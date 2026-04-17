import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a1a]">
      <Header />

      <main>
        <Hero />
        <HowItWorks />
        <ForBusinesses />
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
            Set up my business — free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-[#1a1a1a] rounded-full px-6 py-3 font-medium hover:bg-[#1a1a1a]/5 transition"
          >
            I&rsquo;m a customer →
          </Link>
        </div>

        <p className="mt-5 text-xs text-[#9CA3AF]">
          No credit card. No app to install. Customers join with their phone number.
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

function HowItWorks() {
  const steps = [
    {
      n: '1',
      title: 'Print one QR code',
      body: 'We generate a QR for your counter or tablet. It rotates automatically — no printing again.',
    },
    {
      n: '2',
      title: 'Customers scan & punch',
      body: 'They sign up with their phone number in 5 seconds. No app to download, ever.',
    },
    {
      n: '3',
      title: 'Reward & repeat',
      body: 'Their card fills up; they show you the redeem screen. You keep them coming back.',
    },
  ]
  return (
    <section className="px-5 py-16 bg-white border-y border-[#1a1a1a]/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            How it works
          </h2>
          <p className="text-[#6B7280] mt-2">From sign-up to first punch in under 2 minutes.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(s => (
            <div key={s.n} className="text-center sm:text-left">
              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FFE566] font-bold text-[#1a1a1a] mb-4"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.n}
              </div>
              <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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
    { icon: '📱', title: 'No customer app', body: 'They scan with the camera. That&rsquo;s it.' },
    { icon: '🛡️', title: 'Anti-fraud', body: 'Tokens rotate every 5 minutes. One punch per visit.' },
    { icon: '📊', title: 'Real numbers', body: 'See active customers, redemptions and trends.' },
  ]
  return (
    <section className="px-5 py-16">
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
              className="rounded-xl bg-white border border-[#E5E7EB] p-5 hover:border-[#1a1a1a]/30 transition"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <p className="font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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

function FinalCTA() {
  return (
    <section className="px-5 py-20">
      <div
        className="max-w-3xl mx-auto rounded-2xl bg-[#1a1a1a] text-white p-10 sm:p-14 text-center"
      >
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
          Get started — it&rsquo;s free
        </Link>
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
