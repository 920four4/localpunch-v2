import Link from 'next/link'
import { SITE_NAME } from '@/lib/site'
import { LogoMark } from '@/components/brand/logo-mark'
import { MarketingMobileNav } from './mobile-nav'

export function MarketingHeader({ active }: { active?: 'blog' | 'pricing' }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-[#FAFAF8]/90 border-b border-[#E7E6DF] mobile-header-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 font-bold text-base sm:text-lg min-w-0 shrink"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <LogoMark size={32} tile />
          <span className="truncate">{SITE_NAME}</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            href="/how-it-works"
            className="text-[#5A554C] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            How it works
          </Link>
          <Link
            href="/features"
            className="text-[#5A554C] hover:text-[#1a1a1a] px-2 py-1.5 font-medium"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className={`px-2 py-1.5 font-medium ${
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
          <Link
            href="/login?role=business"
            className="nb-btn-primary text-sm px-4 py-2"
            data-ga-event="cta_click"
            data-ga-location="header"
            data-ga-label="start_free"
          >
            Start free
          </Link>
        </nav>
        <div className="flex lg:hidden items-center gap-1 shrink-0">
          <Link
            href="/login?role=business"
            className="nb-btn-primary text-xs sm:text-sm px-3 py-2 max-[380px]:hidden"
            data-ga-event="cta_click"
            data-ga-location="header_mobile"
            data-ga-label="start_free"
          >
            Start free
          </Link>
          <MarketingMobileNav active={active} />
        </div>
      </div>
    </header>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#E7E6DF] py-10 px-4 sm:px-5 bg-white mt-16 sm:mt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
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
              <Link href="/features" className="hover:text-[#1a1a1a] block py-1">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[#1a1a1a] block py-1">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-[#1a1a1a] block py-1">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/compare" className="hover:text-[#1a1a1a] block py-1">
                Compare
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1a1a1a] mb-2">Industries</p>
          <ul className="space-y-1.5 text-[#6B7280]">
            <li>
              <Link href="/for/coffee-shops" className="hover:text-[#1a1a1a] block py-1">
                Coffee shops
              </Link>
            </li>
            <li>
              <Link href="/for/taquerias" className="hover:text-[#1a1a1a] block py-1">
                Taquerias
              </Link>
            </li>
            <li>
              <Link href="/for/barbershops" className="hover:text-[#1a1a1a] block py-1">
                Barbershops
              </Link>
            </li>
            <li>
              <Link href="/for/boba-shops" className="hover:text-[#1a1a1a] block py-1">
                Boba shops
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-[#1a1a1a] mb-2">Company</p>
          <ul className="space-y-1.5 text-[#6B7280]">
            <li>
              <Link href="/blog" className="hover:text-[#1a1a1a] block py-1">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#1a1a1a] block py-1">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#1a1a1a] block py-1">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#1a1a1a] block py-1">
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
    <section className="px-4 sm:px-5 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#1a1a1a] text-white p-8 sm:p-12 text-center">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-balance"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {headline}
        </h2>
        <p className="mt-3 text-white/70 max-w-md mx-auto text-sm sm:text-base">{sub}</p>
        <Link
          href="/login?role=business"
          className="inline-flex items-center justify-center mt-8 bg-[#FFE566] text-[#1a1a1a] rounded-full px-6 sm:px-7 py-3.5 text-sm font-bold hover:bg-[#f5d84d] transition min-h-[44px]"
          data-ga-event="cta_click"
          data-ga-location="marketing_cta"
          data-ga-label="start_my_shop"
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
