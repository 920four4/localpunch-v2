'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-xl mb-4" style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
            <span className="text-2xl">🥊</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>LocalPunch</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Digital punch cards for local businesses</p>
        </div>

        {!sent ? (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Sign in</h2>
            <p className="text-sm text-[#6B7280] mb-5">We'll send a magic link to your email.</p>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
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
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </div>
        ) : (
          <div className="nb-card-flat p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Check your inbox</h2>
            <p className="text-sm text-[#6B7280]">
              We sent a magic link to <strong>{email}</strong>. Click it to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm text-[#1a1a1a] underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
