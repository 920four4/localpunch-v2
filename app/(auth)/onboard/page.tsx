'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/types'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function OnboardPage() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Smart default: email-only sign-ups are almost always merchants
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email && !user.phone) setRole('merchant')
    })
  }, [])

  const valid =
    role !== null &&
    displayName.trim().length > 0 &&
    (role !== 'merchant' || businessName.trim().length > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ role, display_name: displayName.trim() })
      .eq('id', user.id)

    if (profileErr) {
      setLoading(false)
      toast.error('Could not save profile. Try again.')
      return
    }

    if (role === 'merchant') {
      const slug = slugify(businessName) + '-' + Math.random().toString(36).slice(2, 6)
      const { error: bizErr } = await supabase.from('businesses').insert({
        owner_id: user.id,
        name: businessName.trim(),
        slug,
        address: address.trim() || null,
      })
      if (bizErr) {
        setLoading(false)
        toast.error(bizErr.message)
        return
      }
    }

    setLoading(false)
    router.push(role === 'merchant' ? '/merchant' : '/wallet')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <header className="px-5 h-14 flex items-center border-b border-[#1a1a1a]/10">
        <Link href="/" className="flex items-center gap-2 font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#FFE566] rounded-md text-sm">🥊</span>
          LocalPunch
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              👋 Let&rsquo;s set you up
            </h1>
            <p className="text-[#6B7280] mt-1.5 text-sm">Takes about 30 seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div>
              <p className="text-sm font-medium mb-2">I want to…</p>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  icon="🛍️"
                  label="Collect punches"
                  sub="Earn rewards"
                  selected={role === 'customer'}
                  onClick={() => setRole('customer')}
                />
                <RoleCard
                  icon="🏪"
                  label="Run my shop"
                  sub="Reward customers"
                  selected={role === 'merchant'}
                  onClick={() => setRole('merchant')}
                />
              </div>
            </div>

            {/* Name */}
            <Field label="Your name">
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Rivera"
              />
            </Field>

            {/* Business fields, shown only when merchant */}
            {role === 'merchant' && (
              <>
                <Field label="Business name">
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Tony's Tacos"
                  />
                </Field>
                <Field label="Address" hint="Optional — helps customers find you">
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="123 Main St, Springfield"
                  />
                </Field>
              </>
            )}

            <button
              type="submit"
              disabled={!valid || loading}
              className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
            >
              {loading
                ? 'Setting up…'
                : role === 'merchant'
                ? 'Create my shop'
                : 'Get started'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function RoleCard({
  icon,
  label,
  sub,
  selected,
  onClick,
}: {
  icon: string
  label: string
  sub: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border p-4 transition ${
        selected
          ? 'bg-[#FFE566] border-[#1a1a1a]'
          : 'bg-white border-[#E5E7EB] hover:border-[#1a1a1a]/30'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-semibold text-sm leading-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {label}
      </p>
      <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>
    </button>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactElement
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="onboard-field">{children}</div>
      {hint && <p className="text-xs text-[#9CA3AF] mt-1.5">{hint}</p>}
      <style jsx>{`
        .onboard-field :global(input),
        .onboard-field :global(textarea) {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .onboard-field :global(input:focus),
        .onboard-field :global(textarea:focus) {
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px #ffe56666;
        }
      `}</style>
    </div>
  )
}
