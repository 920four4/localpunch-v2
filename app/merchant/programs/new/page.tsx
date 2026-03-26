'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewProgramPage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    punches_required: 10,
    reward_description: '',
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user!.id).single()
    if (!business) { toast.error('No business found'); setSaving(false); return }

    const { error } = await supabase.from('loyalty_programs').insert({
      business_id: business.id,
      name: form.name,
      description: form.description || null,
      punches_required: form.punches_required,
      reward_description: form.reward_description,
    })

    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Program created!')
    router.push('/merchant/programs')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="page-header text-2xl">New Program</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Create a loyalty punch card program.</p>
      </div>

      <form onSubmit={handleSubmit} className="nb-card-flat p-6 space-y-5">
        <Field label="Program name *" hint='e.g. "Free Burrito" or "Coffee Rewards"'>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Free Coffee" className="field-input" />
        </Field>

        <Field label="Description" hint="Optional short description shown to customers">
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Buy 10 coffees, get one free!" rows={2} className="field-input resize-none" />
        </Field>

        <Field label="Punches required *" hint="How many punches to earn the reward (1–100)">
          <input required type="number" min={1} max={100}
            value={form.punches_required} onChange={e => set('punches_required', parseInt(e.target.value))}
            className="field-input w-24" />
        </Field>

        {/* Preview */}
        <div className="bg-[#FAFAF8] border border-[#E5E7EB] rounded-lg p-4">
          <p className="text-xs text-[#6B7280] mb-2 font-medium">Preview</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: Math.min(form.punches_required, 15) }).map((_, i) => (
              <div key={i} className={`stamp-slot w-8 h-8 text-xs ${i < 3 ? 'filled' : ''}`}>
                {i < 3 ? '✓' : ''}
              </div>
            ))}
            {form.punches_required > 15 && <span className="text-xs text-[#6B7280] self-center">+{form.punches_required - 15} more</span>}
          </div>
        </div>

        <Field label="Reward description *" hint='What customers get, e.g. "1 free burrito of your choice"'>
          <input required value={form.reward_description} onChange={e => set('reward_description', e.target.value)}
            placeholder="1 free coffee" className="field-input" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="nb-btn-primary font-semibold px-6 py-2.5 disabled:opacity-50">
            {saving ? 'Creating…' : 'Create program'}
          </button>
          <button type="button" onClick={() => router.back()} className="nb-btn-ghost px-5 py-2.5 text-sm">Cancel</button>
        </div>
      </form>

      <style jsx>{`
        .field-input {
          width: 100%;
          border: 2px solid #1a1a1a;
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          background: white;
          outline: none;
        }
        .field-input:focus {
          box-shadow: 0 0 0 2px #FFE566;
        }
      `}</style>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-xs text-[#6B7280] mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}
