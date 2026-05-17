'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  token: string
  businessName: string
  programName: string
  reward: string | null
}

export default function ConfirmRedeem({
  token,
  businessName,
  programName,
  reward,
}: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [error, setError] = useState('')

  async function confirm() {
    setState('loading')
    try {
      const res = await fetch('/api/redeem-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not confirm — show the cashier instead.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setError('Network issue — try again.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="nb-card-flat p-8 text-center space-y-4 bg-[#A8E6CF]">
        <div className="text-5xl">🎉</div>
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Reward claimed!
        </h1>
        <p className="text-sm text-[#1a1a1a]/80">
          Enjoy your {reward ?? programName} at {businessName}. Your card has
          reset so you can start earning the next one.
        </p>
        <Link
          href="/wallet"
          className="inline-block w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold hover:bg-black transition"
        >
          View my cards →
        </Link>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="nb-card-flat p-8 text-center space-y-4 bg-white">
        <div className="text-5xl">😬</div>
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Couldn’t confirm
        </h1>
        <p className="text-sm text-[#6B7280]">{error}</p>
        <button
          onClick={() => {
            setState('idle')
            setError('')
          }}
          className="nb-btn-ghost text-sm px-4 py-2"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="nb-card-flat p-8 text-center space-y-5 bg-white">
      <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
        {businessName}
      </p>
      <div className="text-5xl">🎁</div>
      <div className="space-y-1">
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {reward ?? programName}
        </h1>
        <p className="text-sm text-[#6B7280]">
          Tap below to claim it. Do this with the cashier — your card resets
          afterward.
        </p>
      </div>
      <button
        onClick={confirm}
        disabled={state === 'loading'}
        className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
      >
        {state === 'loading' ? 'Claiming…' : 'Claim my reward →'}
      </button>
    </div>
  )
}
