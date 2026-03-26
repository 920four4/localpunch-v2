'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
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
      setSent(true)
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

        {!sent ? (
          <div className="nb-card-flat p-6">
            <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Sign in
            </h2>
            <p className="text-sm text-[#6B7280] mb-5">
              Enter your email — we'll send you a sign-in link.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? 'Sending…' : 'Send sign-in link →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="nb-card-flat p-6 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Check your inbox
            </h2>
            <p className="text-sm text-[#6B7280] mb-4">
              We sent a sign-in link to <strong>{email}</strong>. Click it to continue — no password needed.
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Didn't get it? Check your spam folder.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-5 w-full text-center text-sm text-[#6B7280] underline underline-offset-2"
            >
              ← Try a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
