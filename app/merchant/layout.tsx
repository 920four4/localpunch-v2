'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NavSheet } from '@/components/mobile/nav-sheet'

const navItems = [
  { href: '/merchant', icon: '📊', label: 'Dashboard', exact: true },
  { href: '/merchant/guide', icon: '📖', label: 'Setup guide' },
  { href: '/merchant/programs', icon: '🎯', label: 'Programs' },
  { href: '/merchant/qr', icon: '📱', label: 'Show QR' },
  { href: '/merchant/punch', icon: '⚡', label: 'Quick Punch' },
  { href: '/merchant/redeem', icon: '🎁', label: 'Redeem' },
  { href: '/merchant/customers', icon: '👥', label: 'Customers' },
  { href: '/merchant/analytics', icon: '📈', label: 'Analytics' },
  { href: '/merchant/billing', icon: '💳', label: 'Billing' },
]

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const [businessName, setBusinessName] = useState('')
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null)
  const [isActive, setIsActive] = useState<boolean | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('businesses')
        .select('name, is_active')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (data) {
        setBusinessName(data.name)
        setHasBusiness(true)
        setIsActive(Boolean(data.is_active))
      } else {
        setHasBusiness(false)
        setIsActive(null)
      }
    }
    load()
  }, [pathname])

  const showActivationBanner =
    hasBusiness === true &&
    isActive === false &&
    pathname !== '/merchant/billing' &&
    pathname !== '/merchant/setup'

  return (
    <div className="min-h-dvh bg-[#FAFAF8] flex flex-col lg:flex-row overflow-x-clip max-w-[100vw]">
      <aside className="hidden lg:flex lg:w-60 lg:flex-shrink-0 flex-col bg-white border-r border-[#E5E7EB] min-h-screen">
        <div className="p-5 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-lg flex items-center justify-center text-sm font-bold">🥊</div>
            <div className="min-w-0">
              <p className="text-xs text-[#6B7280]">LocalPunch</p>
              {businessName && (
                <p
                  className="text-sm font-semibold leading-tight truncate max-w-[140px]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {businessName}
                </p>
              )}
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <SideNavItem key={item.href} item={item} />
          ))}
        </nav>
        <div className="p-3 border-t border-[#E5E7EB]">
          <SignOutButton />
        </div>
      </aside>

      <div className="lg:hidden sticky top-0 z-20 bg-white border-b-2 border-[#1a1a1a] mobile-header-safe px-4 pb-3 flex items-center justify-between gap-3 min-w-0">
        <Link
          href="/merchant"
          className="font-bold text-sm truncate min-w-0"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          🥊 {businessName || 'Merchant'}
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-lg border-2 border-[#1a1a1a] bg-white"
          style={{ boxShadow: '2px 2px 0 #1a1a1a' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" strokeWidth={2.25} />
        </button>
      </div>

      <NavSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={businessName ? `🥊 ${businessName}` : '🥊 Merchant'}
        items={navItems}
        footer={<SignOutButton />}
      />

      <main className="mobile-shell-main flex-1 p-4 sm:p-5 lg:p-8 max-w-5xl w-full min-w-0">
        {showActivationBanner && <ActivationBanner />}
        {children}
      </main>
    </div>
  )
}

function ActivationBanner() {
  return (
    <div className="mb-6 nb-card-flat p-4 bg-[#FFE566] flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          🔒 Your shop isn&rsquo;t active yet.
        </p>
        <p className="text-xs text-[#1a1a1a]/80 mt-0.5">
          Customers can&rsquo;t join or punch cards until you activate. $60/month or $600/year — cancel anytime.
        </p>
      </div>
      <Link
        href="/merchant/billing"
        className="flex-shrink-0 bg-[#1a1a1a] text-white rounded-full px-4 py-3 text-sm font-semibold hover:bg-black transition text-center min-h-[44px] flex items-center justify-center"
      >
        Activate now →
      </Link>
    </div>
  )
}

function SideNavItem({ item }: { item: (typeof navItems)[0] }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
        active ? 'bg-[#FFE566] text-[#1a1a1a] border border-[#1a1a1a]' : 'text-[#6B7280] hover:bg-[#F4F4F0] hover:text-[#1a1a1a]'
      }`}
    >
      <span>{item.icon}</span>
      {item.label}
    </Link>
  )
}

function SignOutButton() {
  const supabase = createClient()
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#6B7280] hover:bg-[#F4F4F0] hover:text-[#1a1a1a] w-full min-h-[44px]"
    >
      🚪 Sign out
    </button>
  )
}
