'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', icon: '📊', label: 'Overview', exact: true },
  { href: '/admin/businesses', icon: '🏪', label: 'Businesses' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/blog', icon: '✏️', label: 'Blog' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:w-56 flex-col bg-[#1a1a1a] text-white min-h-screen flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FFE566] rounded-md flex items-center justify-center text-sm">🥊</div>
            <div>
              <p className="text-xs text-white/50">LocalPunch</p>
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => <AdminNavItem key={item.href} item={item} />)}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm rounded-lg hover:bg-white/10">
            ← Customer view
          </Link>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-[#1a1a1a] text-white px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>🥊 Admin</span>
        <div className="flex gap-3">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="text-white/70 hover:text-white text-sm">{item.icon}</Link>
          ))}
        </div>
      </div>

      <main className="flex-1 bg-[#FAFAF8] p-5 lg:p-8 mt-12 lg:mt-0">
        {children}
      </main>
    </div>
  )
}

function AdminNavItem({ item }: { item: (typeof navItems)[0] }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-[#FFE566] text-[#1a1a1a]' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span>{item.icon}</span>
      {item.label}
    </Link>
  )
}
