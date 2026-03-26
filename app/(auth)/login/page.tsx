'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Step = 'email' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setStep('otp')
      toast.success('Check your email for a 6-digit code!')
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })
    setLoading(false)
    if (error) {
      toast.error('Invalid code — double check and try again.')
    } else {
      router.push('/')
      router.refresh()
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

        {step === 'email' ? (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Sign in
            </h2>
            <p className="text-sm text-[#6B7280] mb-5">We'll send a 6-digit code to your email.</p>
            <form onSubmit={handleSendOtp} className="space-y-4">
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
                  placeholder="you@example.com"
                  className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="nb-btn-primary w-full text-sm font-semibold py-2.5 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send code →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Enter your code
            </h2>
            <p className="text-sm text-[#6B7280] mb-5">
              Sent to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white text-center text-xl tracking-[0.4em] font-mono focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="nb-btn-primary w-full text-sm font-semibold py-2.5 disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Sign in →'}
              </button>
            </form>
            <button
              onClick={() => { setStep('email'); setOtp('') }}
              className="mt-4 w-full text-center text-sm text-[#6B7280] underline underline-offset-2"
            >
              ← Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
