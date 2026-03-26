'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: '🎴', label: 'Cards' },
  { href: '/scan', icon: '📷', label: 'Scan' },
  { href: '/history', icon: '📋', label: 'History' },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col pb-20">
      <header className="sticky top-0 z-10 bg-[#FAFAF8] border-b-2 border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            🥊 LocalPunch
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#1a1a1a] flex z-10">
        {navItems.map(item => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>
    </div>
  )
}

function NavItem({ item }: { item: (typeof navItems)[0] }) {
  const pathname = usePathname()
  const active = pathname === item.href
  return (
    <Link
      href={item.href}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
        active ? 'bg-[#FFE566] text-[#1a1a1a]' : 'text-[#6B7280] hover:text-[#1a1a1a]'
      }`}
    >
      <span className="text-xl leading-none">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  )
}
