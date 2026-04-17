'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Role = 'customer' | 'merchant' | 'admin' | null

type PunchResult = {
  success: boolean
  punch_count: number
  punches_required: number
  is_complete: boolean
  message: string
}

type Props = {
  token: string
  business: { name: string }
  program: {
    name: string
    reward_description: string | null
    punches_required: number
  }
  signedInAs: Role
}

type Step =
  | 'loading'
  | 'need_phone'
  | 'need_otp'
  | 'punching'
  | 'done'
  | 'error'
  | 'role_mismatch'

export default function ClaimPunch({
  token,
  business,
  program,
  signedInAs,
}: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PunchResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const attemptedRef = useRef(false)

  const supabase = createClient()

  useEffect(() => {
    // Avoid double-punching if React StrictMode re-runs the effect.
    if (attemptedRef.current) return
    attemptedRef.current = true

    if (signedInAs === 'customer') {
      punch()
    } else if (signedInAs === 'merchant' || signedInAs === 'admin') {
      setStep('role_mismatch')
    } else {
      setStep('need_phone')
    }
  }, [signedInAs])

  function formatPhone(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  const e164 = (f: string) => `+1${f.replace(/\D/g, '')}`

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit number')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164(phone) })
    setLoading(false)
    if (error) toast.error(error.message)
    else setStep('need_otp')
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length < 6) return
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(phone),
      token: otp,
      type: 'sms',
    })
    if (error) {
      setLoading(false)
      toast.error('Wrong code — check your SMS and try again.')
      return
    }
    // Session is now set; the /api/punch call below will send it via cookie.
    await punch()
  }

  async function punch() {
    setStep('punching')
    try {
      const res = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setErrorMsg(data.message || data.error || 'Something went wrong')
        setStep('error')
        return
      }
      setResult(data as PunchResult)
      setStep('done')
    } catch {
      setLoading(false)
      setErrorMsg('Network issue — please try again.')
      setStep('error')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  // ───────────────────────────────────────────────────────── render

  const Heading = () => (
    <div className="text-center space-y-1 mb-6">
      <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
        {business.name}
      </p>
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {program.name}
      </h1>
      {program.reward_description && (
        <p className="text-sm text-[#6B7280]">{program.reward_description}</p>
      )}
    </div>
  )

  if (step === 'loading' || step === 'punching') {
    return (
      <div className="nb-card-flat p-10 flex flex-col items-center gap-3 bg-white">
        <div className="w-10 h-10 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B7280]">
          {step === 'punching' ? 'Recording your punch…' : 'Loading…'}
        </p>
      </div>
    )
  }

  if (step === 'done' && result) {
    return (
      <div className="nb-card-flat p-8 space-y-6 bg-white">
        <Heading />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-20 h-20 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-4xl ${
              result.is_complete ? 'bg-[#A8E6CF]' : 'bg-[#FFE566]'
            }`}
            style={{ boxShadow: '3px 3px 0 #1a1a1a' }}
          >
            {result.is_complete ? '🎉' : '✓'}
          </div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {result.is_complete ? 'Card complete!' : 'Punch collected'}
          </h2>
          <p className="text-sm text-[#6B7280] text-center">{result.message}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: result.punches_required }).map((_, i) => (
            <div
              key={i}
              className={`stamp-slot w-9 h-9 text-sm ${
                i < result.punch_count ? 'filled' : ''
              } ${
                result.is_complete && i < result.punch_count ? 'complete' : ''
              }`}
            >
              {i < result.punch_count ? '✓' : ''}
            </div>
          ))}
        </div>

        <Link
          href="/wallet"
          className="block w-full text-center bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold hover:bg-black transition"
        >
          {result.is_complete ? 'Redeem my reward →' : 'View my cards →'}
        </Link>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="nb-card-flat p-8 bg-white space-y-5 text-center">
        <div className="text-5xl">😬</div>
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Couldn&rsquo;t record that punch
        </h2>
        <p className="text-sm text-[#6B7280]">{errorMsg}</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/wallet"
            className="block w-full text-center nb-btn-ghost text-sm py-2.5"
          >
            Open my wallet
          </Link>
          <Link
            href="/"
            className="block w-full text-center text-sm text-[#6B7280] hover:text-[#1a1a1a]"
          >
            ← Back home
          </Link>
        </div>
      </div>
    )
  }

  if (step === 'role_mismatch') {
    return (
      <div className="nb-card-flat p-8 bg-white space-y-5 text-center">
        <div className="text-5xl">👋</div>
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          You&rsquo;re signed in as a shop owner
        </h2>
        <p className="text-sm text-[#6B7280]">
          To collect a punch at <strong>{business.name}</strong>, sign out and
          scan again with your customer phone number.
        </p>
        <button
          onClick={signOut}
          className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold hover:bg-black transition"
        >
          Sign out & continue
        </button>
        <Link
          href="/merchant"
          className="block w-full text-center text-sm text-[#6B7280] hover:text-[#1a1a1a]"
        >
          ← Back to my shop
        </Link>
      </div>
    )
  }

  // need_phone or need_otp
  return (
    <div className="nb-card-flat p-8 bg-white space-y-5">
      <Heading />

      {step === 'need_phone' ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
              Your mobile number
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
              We&rsquo;ll text you a code to save your card. No app install, no
              password.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, '').length < 10}
            className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
          >
            {loading ? 'Sending…' : 'Get my punch →'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-4">
          <div>
            <p className="text-sm text-[#6B7280] mb-3">
              Code sent to{' '}
              <strong className="text-[#1a1a1a]">+1 {phone}</strong>
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
            {loading ? 'Verifying…' : 'Confirm & punch →'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('need_phone')
              setOtp('')
            }}
            className="w-full text-center text-sm text-[#6B7280] hover:text-[#1a1a1a]"
          >
            ← Use a different number
          </button>
        </form>
      )}
    </div>
  )
}
