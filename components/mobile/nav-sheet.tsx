'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export type NavSheetItem = {
  href: string
  icon: string
  label: string
  exact?: boolean
}

type NavSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  items: NavSheetItem[]
  footer?: React.ReactNode
  side?: 'left' | 'right'
}

export function NavSheet({
  open,
  onOpenChange,
  title,
  items,
  footer,
  side = 'left',
}: NavSheetProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className="w-[min(100vw-2rem,20rem)] p-0 gap-0 border-2 border-[#1a1a1a] rounded-none sm:rounded-lg"
        style={{ boxShadow: '4px 0 0 #1a1a1a' }}
      >
        <SheetHeader className="border-b border-[#E5E7EB] pt-[max(1rem,env(safe-area-inset-top))]">
          <SheetTitle
            className="text-base font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {title}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map(item => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                  active
                    ? 'bg-[#FFE566] text-[#1a1a1a] border border-[#1a1a1a]'
                    : 'text-[#6B7280] hover:bg-[#F4F4F0] hover:text-[#1a1a1a]'
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        {footer && (
          <div className="border-t border-[#E5E7EB] p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
