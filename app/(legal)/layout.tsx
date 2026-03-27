import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="border-b-2 border-[#1a1a1a] bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-lg text-sm" style={{ boxShadow: '2px 2px 0 #1a1a1a' }}>🥊</span>
          LocalPunch
        </Link>
        <Link href="/login" className="text-sm text-[#6B7280] underline underline-offset-2">Sign in</Link>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="border-t-2 border-[#1a1a1a] py-8 text-center text-sm text-[#9CA3AF]">
        © {new Date().getFullYear()} LocalPunch ·{' '}
        <Link href="/privacy-policy" className="underline underline-offset-2">Privacy Policy</Link>{' '}·{' '}
        <Link href="/terms" className="underline underline-offset-2">Terms & Conditions</Link>
      </footer>
    </div>
  )
}
