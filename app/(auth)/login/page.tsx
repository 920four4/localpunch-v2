'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Tab = 'customer' | 'business'
type Step = 'input' | 'otp' | 'sent'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('customer')
  const [step, setStep] = useState<Step>('input')

  // Customer (phone) state
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  // Business (email) state
  const [email, setEmail] = useState('')

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // ─── Format phone number as user types ─────────────────────────────────────
  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  function e164(formatted: string) {
    const digits = formatted.replace(/\D/g, '')
    return `+1${digits}`
  }

  // ─── Customer: send SMS OTP ─────────────────────────────────────────────────
  async function handleSendSms(e: React.FormEvent) {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { toast.error('Enter a valid 10-digit number'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164(phone) })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setStep('otp')
    }
  }

  // ─── Customer: verify SMS OTP ───────────────────────────────────────────────
  async function handleVerifySms(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(phone),
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) {
      toast.error('Wrong code — check your SMS and try again.')
    } else {
      router.push('/wallet')
      router.refresh()
    }
  }

  // ─── Business: send magic link ──────────────────────────────────────────────
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
    if (error) {
      toast.error(error.message)
    } else {
      setStep('sent')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-xl mb-4"
            style={{ boxShadow: '3px 3px 0 #1a1a1a' }}
          >
            <span className="text-2xl">🥊</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            LocalPunch
          </h1>
          <p className="text-[#6B7280] mt-1 text-sm">Digital punch cards for local businesses</p>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-5 border-2 border-[#1a1a1a] rounded-xl overflow-hidden" style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
          <button
            onClick={() => { setTab('customer'); setStep('input'); setOtp('') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === 'customer' ? 'bg-[#FFE566] text-[#1a1a1a]' : 'bg-white text-[#6B7280]'
            }`}
          >
            I'm a Customer
          </button>
          <button
            onClick={() => { setTab('business'); setStep('input') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l-2 border-[#1a1a1a] ${
              tab === 'business' ? 'bg-[#1a1a1a] text-white' : 'bg-white text-[#6B7280]'
            }`}
          >
            I'm a Business
          </button>
        </div>

        {/* ── CUSTOMER FLOW ─────────────────────────────────────────────────── */}
        {tab === 'customer' && step === 'input' && (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Enter your phone number
            </h2>
            <p className="text-sm text-[#6B7280] mb-5">
              We'll text you a one-time code. No password, no fuss.
            </p>
            <form onSubmit={handleSendSms} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                  Mobile number
                </label>
                <div className="flex gap-2">
                  <span className="border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-[#f5f5f0] font-mono select-none">
                    🇺🇸 +1
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
                    className="flex-1 border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 10}
                className="nb-btn-primary w-full text-sm font-semibold py-2.5 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Text me a code →'}
              </button>
            </form>
          </div>
        )}

        {tab === 'customer' && step === 'otp' && (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Enter your code
            </h2>
            <p className="text-sm text-[#6B7280] mb-5">
              Sent to <strong>+1 {phone}</strong>
            </p>
            <form onSubmit={handleVerifySms} className="space-y-4">
              <div>
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
                  placeholder="123456"
                  className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="nb-btn-primary w-full text-sm font-semibold py-2.5 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Confirm →'}
              </button>
            </form>
            <button
              onClick={() => { setStep('input'); setOtp('') }}
              className="mt-4 w-full text-center text-sm text-[#6B7280] underline underline-offset-2"
            >
              ← Try a different number
            </button>
          </div>
        )}

        {/* ── BUSINESS FLOW ─────────────────────────────────────────────────── */}
        {tab === 'business' && step === 'input' && (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Sign in
            </h2>
            <p className="text-sm text-[#6B7280] mb-5">
              Enter your email — we'll send you a sign-in link.
            </p>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="nb-btn-dark w-full text-sm font-semibold py-2.5 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send sign-in link →'}
              </button>
            </form>
          </div>
        )}

        {tab === 'business' && step === 'sent' && (
          <div className="nb-card-flat p-6 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Check your inbox
            </h2>
            <p className="text-sm text-[#6B7280] mb-4">
              Sent a sign-in link to <strong>{email}</strong>. Click it to continue.
            </p>
            <p className="text-xs text-[#9CA3AF]">No email? Check spam.</p>
            <button
              onClick={() => setStep('input')}
              className="mt-5 w-full text-center text-sm text-[#6B7280] underline underline-offset-2"
            >
              ← Use a different email
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
