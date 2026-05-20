import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'

export function MarketingHeader({ active }: { active?: 'blog' | 'pricing' }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-[#FAFAF8]/85 border-b border-[#E7E6DF]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#FFE566] border border-[#E0CF4A] rounded-lg text-sm">
            🥊
          </span>
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            href="/how-it-works"
            className="hidden md:inline text-[#5A554C] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            How it works
          </Link>
          <Link
            href="/features"
            className="hidden md:inline text-[#5A554C] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={`hidden sm:inline px-2 py-1.5 font-medium ${
              active === 'pricing'
                ? 'text-[#1a1a1a] font-semibold'
                : 'text-[#5A554C] hover:text-[#1a1a1a]'
            }`}
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className={`px-2 py-1.5 font-medium ${
              active === 'blog'
                ? 'text-[#1a1a1a] font-semibold'
                : 'text-[#5A554C] hover:text-[#1a1a1a]'
            }`}
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="text-[#5A554C] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            Sign in
          </Link>
          <Link href="/login?role=business" className="nb-btn-primary text-sm px-4 py-2">
            Start free
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E7E6DF] py-10 px-5 bg-white mt-20">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-bold text-[#1a1a1a] mb-2">{SITE_NAME}</p>
          <p className="text-[#6B7280]">
            Digital punch cards for local shops. No app downloads. Flat pricing.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[#1a1a1a] mb-2">Product</p>
          <ul className="space-y-1.5 text-[#6B7280]">
            <li>
              <Link href="/features" className="hover:text-[#1a1a1a]">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[#1a1a1a]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-[#1a1a1a]">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-[#1a1a1a]">
                Compare
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1a1a1a] mb-2">Industries</p>
          <ul className="space-y-1.5 text-[#6B7280]">
            <li>
              <Link href="/for/coffee-shops" className="hover:text-[#1a1a1a]">
                Coffee shops
              </Link>
            </li>
            <li>
              <Link href="/for/taquerias" className="hover:text-[#1a1a1a]">
                Taquerias
              </Link>
            </li>
            <li>
              <Link href="/for/barbershops" className="hover:text-[#1a1a1a]">
                Barbershops
              </Link>
            </li>
            <li>
              <Link href="/for/boba-shops" className="hover:text-[#1a1a1a]">
                Boba shops
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1a1a1a] mb-2">Company</p>
          <ul className="space-y-1.5 text-[#6B7280]">
            <li>
              <Link href="/blog" className="hover:text-[#1a1a1a]">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#1a1a1a]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#1a1a1a]">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#E7E6DF] text-xs text-[#9CA3AF] text-center sm:text-left">
        © {new Date().getFullYear()} {SITE_NAME}. Made for local shops.
      </p>
    </footer>
  )
}

export function MarketingCTA({
  headline = 'Ready to replace paper punch cards?',
  sub = 'Build your program free. Pay $60/month only when you go live.',
}: {
  headline?: string
  sub?: string
}) {
  return (
    <section className="px-5 py-16">
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#1a1a1a] text-white p-10 sm:p-12 text-center">
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {headline}
        </h2>
        <p className="mt-3 text-white/70 max-w-md mx-auto">{sub}</p>
        <Link
          href="/login?role=business"
          className="inline-block mt-8 bg-[#FFE566] text-[#1a1a1a] rounded-full px-7 py-3.5 text-sm font-bold hover:bg-[#f5d84d] transition"
        >
          Start my shop — free to build
        </Link>
      </div>
    </section>
  )
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
