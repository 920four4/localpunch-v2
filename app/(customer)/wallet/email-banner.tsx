'use client'

import { useState } from 'react'
import { toast } from 'sonner'

/**
 * Dismissible opt-in shown on the wallet when the user has no email on file.
 * If they add one, we fire the Loops customer_welcome email.
 */
export default function EmailBanner({ hasEmail }: { hasEmail: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (hasEmail || dismissed || saved) return null

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/customer/add-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      toast.success("Got it — check your inbox for a welcome email!")
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.message ?? "That didn't work, try again.")
    }
  }

  return (
    <div className="nb-card-flat p-4 bg-[#FFE566] flex items-start gap-3">
      <span className="text-xl">📧</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">
          Get reward reminders by email
        </p>
        <p className="text-xs text-[#1a1a1a]/70 mt-0.5">
          We'll let you know when a card is ready to redeem. No spam.
        </p>
        <form onSubmit={save} className="mt-3 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 border-2 border-[#1a1a1a] rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="nb-btn-primary text-xs font-semibold px-3 py-1.5 disabled:opacity-50"
          >
            {saving ? '…' : 'Save'}
          </button>
        </form>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-[#1a1a1a]/50 hover:text-[#1a1a1a] text-sm flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}
