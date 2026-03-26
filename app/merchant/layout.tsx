'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/merchant', icon: '📊', label: 'Dashboard', exact: true },
  { href: '/merchant/programs', icon: '🎯', label: 'Programs' },
  { href: '/merchant/qr', icon: '📱', label: 'Show QR' },
  { href: '/merchant/customers', icon: '👥', label: 'Customers' },
  { href: '/merchant/analytics', icon: '📈', label: 'Analytics' },
]

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const [businessName, setBusinessName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('businesses').select('name').eq('owner_id', user.id).single()
      if (data) setBusinessName(data.name)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-shrink-0 flex-col bg-white border-r border-[#E5E7EB] min-h-screen">
        <div className="p-5 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-lg flex items-center justify-center text-sm font-bold">🥊</div>
            <div>
              <p className="text-xs text-[#6B7280]">LocalPunch</p>
              {businessName && <p className="text-sm font-semibold leading-tight truncate max-w-[140px]" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{businessName}</p>}
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => <SideNavItem key={item.href} item={item} />)}
        </nav>
        <div className="p-3 border-t border-[#E5E7EB]">
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden sticky top-0 z-10 bg-white border-b-2 border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
        <Link href="/merchant" className="font-bold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>🥊 Merchant</Link>
        <MobileNav />
      </div>

      <main className="flex-1 p-5 lg:p-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}

function SideNavItem({ item }: { item: (typeof navItems)[0] }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-[#FFE566] text-[#1a1a1a] border border-[#1a1a1a]' : 'text-[#6B7280] hover:bg-[#F4F4F0] hover:text-[#1a1a1a]'
      }`}
    >
      <span>{item.icon}</span>
      {item.label}
    </Link>
  )
}

function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="nb-btn-ghost text-sm px-3 py-1.5">Menu ☰</button>
      {open && (
        <div className="absolute right-0 top-10 bg-white border-2 border-[#1a1a1a] rounded-lg shadow-lg z-50 w-48 p-2 space-y-1" style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
          {navItems.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-[#FFE566]' : 'hover:bg-[#F4F4F0]'}`}
              >
                {item.icon} {item.label}
              </Link>
            )
          })}
          <SignOutButton />
        </div>
      )}
    </div>
  )
}

function SignOutButton() {
  const supabase = createClient()
  return (
    <button
      onClick={async () => { await supabase.auth.signOut(); window.location.href = '/auth/login' }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6B7280] hover:bg-[#F4F4F0] hover:text-[#1a1a1a] w-full"
    >
      🚪 Sign out
    </button>
  )
}
