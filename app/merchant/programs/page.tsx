import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user!.id)
    .single()

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">Set up your business first.</p>
        <Link href="/merchant/setup" className="nb-btn-primary inline-flex mt-3 text-sm">Set up →</Link>
      </div>
    )
  }

  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('id, name, punches_required, reward_description, is_active, created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header text-2xl">Programs</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage your loyalty programs.</p>
        </div>
        <Link href="/merchant/programs/new" className="nb-btn-primary text-sm font-semibold px-4 py-2">+ New</Link>
      </div>

      {!programs?.length ? (
        <div className="nb-card-flat p-8 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-semibold mb-2">No programs yet</p>
          <p className="text-sm text-[#6B7280] mb-4">Create a loyalty program to start rewarding customers.</p>
          <Link href="/merchant/programs/new" className="nb-btn-primary inline-flex text-sm font-semibold">Create program →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map(p => (
            <div key={p.id} className="nb-card-flat p-5 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{p.name}</p>
                  {!p.is_active && (
                    <span className="text-xs bg-[#6B7280] text-white px-2 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{p.reward_description}</p>
                <p className="text-xs text-[#6B7280] mt-1">{p.punches_required} punches required</p>
              </div>
              <Link href={`/merchant/programs/${p.id}`} className="nb-btn-ghost text-xs px-3 py-1.5 ml-3 flex-shrink-0">Edit</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
