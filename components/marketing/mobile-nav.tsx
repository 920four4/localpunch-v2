'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'
import { LogoMark } from '@/components/brand/logo-mark'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const navLinks = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/compare', label: 'Compare' },
  { href: '/blog', label: 'Blog' },
]

export function MarketingMobileNav({
  active,
}: {
  active?: 'blog' | 'pricing'
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-[#1a1a1a] hover:bg-[#F4F4F0] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" strokeWidth={2.25} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-sm p-0 gap-0 border-l-2 border-[#1a1a1a]"
        >
          <SheetHeader className="border-b border-[#E7E6DF] pt-[max(1rem,env(safe-area-inset-top))]">
            <SheetTitle
              className="flex items-center gap-2 text-base font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <LogoMark size={32} tile />
              {SITE_NAME}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3.5 rounded-xl text-base font-medium min-h-[44px] flex items-center ${
                  (link.href === '/blog' && active === 'blog') ||
                  (link.href === '/pricing' && active === 'pricing')
                    ? 'bg-[#FFE566] text-[#1a1a1a]'
                    : 'text-[#5A554C] hover:bg-[#F4F4F0] hover:text-[#1a1a1a]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-[#E7E6DF] p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-3.5 rounded-xl border border-[#D9D7CD] font-semibold text-[#1a1a1a] min-h-[44px] flex items-center justify-center"
            >
              Sign in
            </Link>
            <Link
              href="/login?role=business"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-3.5 rounded-xl bg-[#FFE566] border-2 border-[#1a1a1a] font-bold text-[#1a1a1a] min-h-[44px] flex items-center justify-center"
              style={{ boxShadow: '3px 3px 0 #1a1a1a' }}
              data-ga-event="cta_click"
              data-ga-location="mobile_menu"
              data-ga-label="start_free"
            >
              Start free
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
