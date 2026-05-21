'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/wallet', icon: '🎴', label: 'Cards' },
  { href: '/scan', icon: '📷', label: 'Scan' },
  { href: '/history', icon: '📋', label: 'History' },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-shell min-h-dvh bg-[#FAFAF8] pb-tab-bar">
      <header className="sticky top-0 z-20 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#1a1a1a]/10 mobile-header-safe px-4 pb-3 flex items-center justify-between">
        <Link href="/wallet" className="flex items-center gap-2 touch-target -ml-1">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#FFE566] rounded-lg text-sm border border-[#E0CF4A]">🥊</span>
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            LocalPunch
          </span>
        </Link>
      </header>

      <main className="mobile-shell-main flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      <nav
        className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-[#1a1a1a] flex max-w-[100vw]"
        role="navigation"
        aria-label="Main"
      >
        {navItems.map(item => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </div>
  )
}

function NavItem({ item }: { item: (typeof navItems)[0] }) {
  const pathname = usePathname()
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
  return (
    <Link
      href={item.href}
      className={`flex-1 flex flex-col items-center justify-center min-h-[52px] py-2 gap-0.5 text-[11px] font-semibold transition-colors touch-target ${
        active ? 'bg-[#FFE566] text-[#1a1a1a]' : 'text-[#6B7280] active:bg-[#F4F4F0]'
      }`}
    >
      <span className="text-[22px] leading-none">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  )
}
