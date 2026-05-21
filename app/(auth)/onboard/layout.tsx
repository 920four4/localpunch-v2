import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Set up your account · LocalPunch',
  robots: { index: false, follow: false },
}

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
