'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function EditProgramPage() {
  const { id } = useParams() as { id: string }
  const [form, setForm] = useState({ name: '', description: '', punches_required: 10, reward_description: '', is_active: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('loyalty_programs').select('*').eq('id', id).single()
      if (data) setForm({ name: data.name, description: data.description ?? '', punches_required: data.punches_required, reward_description: data.reward_description, is_active: data.is_active })
      setLoading(false)
    }
    load()
  }, [id])

  function set(field: string, value: string | number | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('loyalty_programs').update({
      name: form.name, description: form.description || null,
      punches_required: form.punches_required, reward_description: form.reward_description, is_active: form.is_active,
    }).eq('id', id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Program updated!')
    router.push('/merchant/programs')
  }

  async function handleDelete() {
    if (!confirm('Delete this program? This cannot be undone.')) return
    await supabase.from('loyalty_programs').update({ is_active: false }).eq('id', id)
    toast.success('Program deactivated')
    router.push('/merchant/programs')
  }

  if (loading) return <div className="text-[#6B7280] text-sm">Loading…</div>

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="page-header text-2xl">Edit Program</h1>
      </div>
      <form onSubmit={handleSave} className="nb-card-flat p-6 space-y-5">
        <Field label="Program name *">
          <input required value={form.name} onChange={e => set('name', e.target.value)} className="field-input" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="field-input resize-none" />
        </Field>
        <Field label="Punches required *">
          <input required type="number" min={1} max={100} value={form.punches_required}
            onChange={e => set('punches_required', parseInt(e.target.value))} className="field-input w-24" />
        </Field>
        <Field label="Reward description *">
          <input required value={form.reward_description} onChange={e => set('reward_description', e.target.value)} className="field-input" />
        </Field>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
            className="w-4 h-4 border-2 border-[#1a1a1a] rounded accent-[#FFE566]" />
          <label htmlFor="active" className="text-sm font-medium">Active (customers can collect punches)</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="nb-btn-primary font-semibold px-6 py-2.5 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="nb-btn-ghost px-5 py-2.5 text-sm">Cancel</button>
        </div>
      </form>

      <button onClick={handleDelete} className="text-xs text-[#FF6B6B] underline underline-offset-2">
        Deactivate program
      </button>

      <style jsx>{`
        .field-input { width: 100%; border: 2px solid #1a1a1a; border-radius: 0.5rem; padding: 0.625rem 0.75rem; font-size: 0.875rem; background: white; outline: none; }
        .field-input:focus { box-shadow: 0 0 0 2px #FFE566; }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  )
}
