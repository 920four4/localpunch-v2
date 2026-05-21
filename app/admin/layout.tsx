'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/brand/logo-mark'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavSheet } from '@/components/mobile/nav-sheet'

const navItems = [
  { href: '/admin', icon: '📊', label: 'Overview', exact: true },
  { href: '/admin/businesses', icon: '🏪', label: 'Businesses' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/blog', icon: '✏️', label: 'Blog' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh flex overflow-x-clip max-w-[100vw]">
      <aside className="hidden lg:flex lg:w-56 flex-col bg-[#1a1a1a] text-white min-h-screen flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} tile />
            <div>
              <p className="text-xs text-white/50">LocalPunch</p>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Admin
              </p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <AdminNavItem key={item.href} item={item} />
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/10 min-h-[44px]"
          >
            ← Customer view
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="lg:hidden sticky top-0 z-20 bg-[#1a1a1a] text-white mobile-header-safe px-4 pb-3 flex items-center justify-between">
          <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Admin
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" strokeWidth={2.25} />
          </button>
        </header>

        <NavSheet
          open={menuOpen}
          onOpenChange={setMenuOpen}
          title="Admin"
          items={navItems}
          footer={
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#6B7280] hover:bg-[#F4F4F0] min-h-[44px]"
            >
              ← Customer view
            </Link>
          }
        />

        <main className="mobile-shell-main flex-1 bg-[#FAFAF8] p-4 sm:p-5 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

function AdminNavItem({ item }: { item: (typeof navItems)[0] }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
        active ? 'bg-[#FFE566] text-[#1a1a1a]' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span>{item.icon}</span>
      {item.label}
    </Link>
  )
}
