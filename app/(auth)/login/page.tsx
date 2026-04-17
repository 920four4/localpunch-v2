'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Tab = 'customer' | 'business'
type Step = 'input' | 'otp' | 'sent'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const params = useSearchParams()
  const initialTab: Tab = params.get('role') === 'business' ? 'business' : 'customer'

  const [tab, setTab] = useState<Tab>(initialTab)
  const [step, setStep] = useState<Step>('input')

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (params.get('error') === 'auth') {
      toast.error('That sign-in link expired. Try again.')
    }
  }, [params])

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  function e164(formatted: string) {
    return `+1${formatted.replace(/\D/g, '')}`
  }

  async function handleSendSms(e: React.FormEvent) {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit number')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164(phone) })
    setLoading(false)
    if (error) toast.error(error.message)
    else setStep('otp')
  }

  async function handleVerifySms(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(phone),
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) toast.error('Wrong code — check your SMS and try again.')
    else {
      router.push('/wallet')
      router.refresh()
    }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else setStep('sent')
  }

  function switchTab(t: Tab) {
    setTab(t)
    setStep('input')
    setOtp('')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Top bar */}
      <header className="px-5 h-14 flex items-center justify-between border-b border-[#1a1a1a]/10">
        <Link href="/" className="flex items-center gap-2 font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#FFE566] rounded-md text-sm">🥊</span>
          LocalPunch
        </Link>
        <Link href="/" className="text-sm text-[#6B7280] hover:text-[#1a1a1a]">← Home</Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-7">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {tab === 'customer' ? 'Welcome back' : 'Sign in to your business'}
            </h1>
            <p className="text-[#6B7280] mt-1.5 text-sm">
              {tab === 'customer'
                ? 'Pull up your loyalty cards in seconds.'
                : 'Manage your loyalty programs and customers.'}
            </p>
          </div>

          {/* Tab switcher (light pill) */}
          <div className="flex p-1 mb-5 bg-white border border-[#E5E7EB] rounded-full">
            <button
              onClick={() => switchTab('customer')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                tab === 'customer' ? 'bg-[#1a1a1a] text-white' : 'text-[#6B7280] hover:text-[#1a1a1a]'
              }`}
            >
              I&rsquo;m a customer
            </button>
            <button
              onClick={() => switchTab('business')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                tab === 'business' ? 'bg-[#1a1a1a] text-white' : 'text-[#6B7280] hover:text-[#1a1a1a]'
              }`}
            >
              I&rsquo;m a business
            </button>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            {tab === 'customer' && step === 'input' && (
              <form onSubmit={handleSendSms} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    Mobile number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E5E7EB] bg-[#FAFAF8] text-sm text-[#6B7280] font-mono">
                      +1
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      required
                      autoFocus
                      inputMode="numeric"
                      value={phone}
                      onChange={e => setPhone(formatPhone(e.target.value))}
                      placeholder="(555) 000-0000"
                      className="flex-1 border border-[#E5E7EB] rounded-r-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566] focus:border-[#1a1a1a]"
                    />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    We&rsquo;ll text you a 6-digit code. No password needed.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, '').length < 10}
                  className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
                >
                  {loading ? 'Sending…' : 'Text me a code'}
                </button>
              </form>
            )}

            {tab === 'customer' && step === 'otp' && (
              <form onSubmit={handleVerifySms} className="space-y-4">
                <div>
                  <p className="text-sm text-[#6B7280] mb-3">
                    Code sent to <strong className="text-[#1a1a1a]">+1 {phone}</strong>
                  </p>
                  <label htmlFor="otp" className="block text-sm font-medium mb-1.5">
                    6-digit code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-3 text-2xl text-center tracking-[0.4em] font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566] focus:border-[#1a1a1a]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
                >
                  {loading ? 'Verifying…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('input'); setOtp('') }}
                  className="w-full text-center text-sm text-[#6B7280] hover:text-[#1a1a1a]"
                >
                  ← Use a different number
                </button>
              </form>
            )}

            {tab === 'business' && step === 'input' && (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Business email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@yourshop.com"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566] focus:border-[#1a1a1a]"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    We&rsquo;ll send you a one-tap sign-in link. New here? You&rsquo;ll set up your shop next.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.includes('@')}
                  className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
                >
                  {loading ? 'Sending…' : 'Email me a sign-in link'}
                </button>
              </form>
            )}

            {tab === 'business' && step === 'sent' && (
              <div className="text-center py-2">
                <div className="text-3xl mb-3">📬</div>
                <p
                  className="font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  Check your inbox
                </p>
                <p className="text-sm text-[#6B7280]">
                  Sent a sign-in link to <strong className="text-[#1a1a1a]">{email}</strong>.
                </p>
                <p className="text-xs text-[#9CA3AF] mt-3">No email? Check spam.</p>
                <button
                  onClick={() => setStep('input')}
                  className="mt-5 text-sm text-[#6B7280] hover:text-[#1a1a1a]"
                >
                  ← Use a different email
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[#9CA3AF] mt-6 max-w-xs mx-auto">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-[#1a1a1a]">Terms</Link> and{' '}
            <Link href="/privacy-policy" className="underline hover:text-[#1a1a1a]">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}
