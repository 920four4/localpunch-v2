'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type Program = {
  id: string
  name: string
  punches_required: number
  reward_description: string | null
}

type LastResult = {
  success: boolean
  punch_count: number
  punches_required: number
  is_complete: boolean
  message: string
  customer: {
    id: string
    created: boolean
    display_name: string | null
  }
} | null

type Mode = 'phone' | 'email'

export default function ManualPunchClient({
  programs,
}: {
  programs: Program[]
}) {
  const [mode, setMode] = useState<Mode>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [programId, setProgramId] = useState(programs[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LastResult>(null)
  const [errorText, setErrorText] = useState('')

  function formatPhone(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrorText('')

    const body: Record<string, string> = { program_id: programId }
    if (mode === 'phone') {
      if (phone.replace(/\D/g, '').length < 10) {
        toast.error('Enter a valid 10-digit number')
        return
      }
      body.phone = `+1${phone.replace(/\D/g, '')}`
    } else {
      if (!email.includes('@')) {
        toast.error('Enter a valid email')
        return
      }
      body.email = email.trim().toLowerCase()
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/merchant/punch-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setErrorText(data.message || data.error || 'Could not record punch')
        toast.error(data.message || data.error || 'Could not record punch')
        return
      }
      setResult(data as LastResult)
      toast.success(data.message)
      // Reset inputs for the next customer.
      setPhone('')
      setEmail('')
    } catch {
      setLoading(false)
      setErrorText('Network issue — please try again.')
    }
  }

  const selectedProgram = programs.find(p => p.id === programId)

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="nb-card-flat p-5 space-y-4 bg-white">
        <div>
          <label className="block text-sm font-medium mb-1.5">Program</label>
          <select
            value={programId}
            onChange={e => setProgramId(e.target.value)}
            className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
          >
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.punches_required} punches)
              </option>
            ))}
          </select>
          {selectedProgram?.reward_description && (
            <p className="text-xs text-[#9CA3AF] mt-1.5">
              Reward: {selectedProgram.reward_description}
            </p>
          )}
        </div>

        <div className="flex p-1 bg-[#F4F4F0] border border-[#E5E7EB] rounded-full">
          <button
            type="button"
            onClick={() => setMode('phone')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              mode === 'phone'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#6B7280] hover:text-[#1a1a1a]'
            }`}
          >
            Phone number
          </button>
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              mode === 'email'
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#6B7280] hover:text-[#1a1a1a]'
            }`}
          >
            Email
          </button>
        </div>

        {mode === 'phone' ? (
          <div>
            <label
              htmlFor="mp-phone"
              className="block text-sm font-medium mb-1.5"
            >
              Customer mobile number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border-2 border-r-0 border-[#1a1a1a] bg-[#FAFAF8] text-sm text-[#6B7280] font-mono">
                +1
              </span>
              <input
                id="mp-phone"
                type="tel"
                required
                autoFocus
                inputMode="numeric"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(555) 000-0000"
                className="flex-1 border-2 border-[#1a1a1a] rounded-r-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1.5">
              We&rsquo;ll find their card if they have one, or create a new
              account tied to this number.
            </p>
          </div>
        ) : (
          <div>
            <label
              htmlFor="mp-email"
              className="block text-sm font-medium mb-1.5"
            >
              Customer email
            </label>
            <input
              id="mp-email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="dave@example.com"
              className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !programId}
          className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
        >
          {loading ? 'Recording punch…' : 'Give punch →'}
        </button>

        {errorText && (
          <p className="text-sm text-red-600 text-center">{errorText}</p>
        )}
      </form>

      {result && result.success && (
        <div className="nb-card-flat p-6 space-y-4 bg-white text-center">
          <div
            className={`w-16 h-16 mx-auto rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-3xl ${
              result.is_complete ? 'bg-[#A8E6CF]' : 'bg-[#FFE566]'
            }`}
            style={{ boxShadow: '3px 3px 0 #1a1a1a' }}
          >
            {result.is_complete ? '🎉' : '✓'}
          </div>
          <div>
            <p
              className="font-bold"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {result.is_complete ? 'Card complete!' : 'Punch recorded'}
            </p>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {result.customer.display_name ?? 'Customer'} ·{' '}
              {result.punch_count}/{result.punches_required}
              {result.customer.created && ' · new customer'}
            </p>
          </div>

          <div className="flex justify-center flex-wrap gap-1.5">
            {Array.from({ length: result.punches_required }).map((_, i) => (
              <div
                key={i}
                className={`stamp-slot w-7 h-7 text-xs ${
                  i < result.punch_count ? 'filled' : ''
                } ${
                  result.is_complete && i < result.punch_count ? 'complete' : ''
                }`}
              >
                {i < result.punch_count ? '✓' : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="nb-card-flat p-4 text-sm text-[#6B7280]">
        <summary className="cursor-pointer font-semibold text-[#1a1a1a]">
          When should I use this vs the QR?
        </summary>
        <div className="mt-3 space-y-2">
          <p>
            <strong className="text-[#1a1a1a]">QR code (default).</strong>{' '}
            Point customers to your counter QR. They scan with their phone
            camera. Fastest and most delightful.
          </p>
          <p>
            <strong className="text-[#1a1a1a]">Quick Punch (here).</strong>{' '}
            When the customer&rsquo;s phone is dead, they don&rsquo;t want to
            scan, they prefer you &quot;just take my number,&quot; or you&rsquo;re onboarding a
            regular you already know. Creates their account on the fly.
          </p>
        </div>
      </details>
    </div>
  )
}
