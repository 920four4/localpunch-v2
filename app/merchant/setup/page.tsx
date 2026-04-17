'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function SetupBusinessPage() {
  const [form, setForm] = useState({ name: '', address: '' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const slug = slugify(form.name) + '-' + Math.random().toString(36).slice(2, 6)

    const { data: inserted, error } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name: form.name,
        slug,
        address: form.address || null,
      })
      .select('id')
      .single()

    setSaving(false)
    if (error) { toast.error(error.message); return }

    // Fire the Loops onboarding event server-side. Non-blocking — if the
    // Loops API is down we still send the merchant to billing.
    if (inserted?.id) {
      fetch('/api/merchant/signup-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: inserted.id }),
      }).catch(() => {})
    }

    toast.success('Business created! Activate to go live.')
    router.push('/merchant/billing')
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🏪</div>
        <h1 className="page-header text-2xl">Set up your business</h1>
        <p className="text-sm text-[#6B7280] mt-1">This is how customers will identify you.</p>
      </div>

      <form onSubmit={handleSubmit} className="nb-card-flat p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Business name *</label>
          <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Tony's Tacos" className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="123 Main St, City, State" className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]" />
        </div>
        <button type="submit" disabled={saving} className="nb-btn-primary w-full font-semibold py-3 disabled:opacity-50">
          {saving ? 'Creating…' : 'Create business →'}
        </button>
      </form>
    </div>
  )
}
