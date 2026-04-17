import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MerchantDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user!.id)
    .single()

  if (!business) {
    return <SetupBusinessPrompt />
  }

  const { data: stats } = await supabase
    .from('merchant_program_stats')
    .select('*')
    .eq('business_id', business.id)

  const totalCustomers = stats?.reduce((a, s) => a + Number(s.total_customers), 0) ?? 0
  const totalPunches = stats?.reduce((a, s) => a + Number(s.total_punches), 0) ?? 0
  const totalRedemptions = stats?.reduce((a, s) => a + Number(s.total_redemptions), 0) ?? 0
  const activePrograms = stats?.length ?? 0

  const kpis = [
    { label: 'Customers', value: totalCustomers, icon: '👥', color: 'bg-[#A8E6CF]' },
    { label: 'Total Punches', value: totalPunches, icon: '✓', color: 'bg-[#FFE566]' },
    { label: 'Redemptions', value: totalRedemptions, icon: '🎁', color: 'bg-white' },
    { label: 'Active Programs', value: activePrograms, icon: '🎯', color: 'bg-white' },
  ]

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header text-2xl">{business.name}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Merchant dashboard</p>
        </div>
        <Link href="/merchant/qr" className="nb-btn-primary text-sm font-semibold px-4 py-2">
          Show QR →
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`nb-card-flat p-4 ${kpi.color}`}>
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{kpi.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Programs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Your Programs</h2>
          <Link href="/merchant/programs/new" className="nb-btn-ghost text-xs px-3 py-1.5">+ New program</Link>
        </div>
        {(stats ?? []).length === 0 ? (
          <div className="nb-card-flat p-6 text-center">
            <p className="text-sm text-[#6B7280]">No programs yet.</p>
            <Link href="/merchant/programs/new" className="nb-btn-primary inline-flex mt-3 text-sm">Create your first program</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(stats ?? []).map((s: any) => (
              <div key={s.program_id} className="nb-card-flat p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{s.program_name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{s.punches_required} punches · {s.total_customers} customers · {s.total_redemptions} redeemed</p>
                </div>
                <Link href={`/merchant/programs/${s.program_id}`} className="nb-btn-ghost text-xs px-3 py-1.5">Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SetupBusinessPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="text-4xl mb-4">🏪</div>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Finish setting up your shop</h2>
      <p className="text-sm text-[#6B7280] mb-5 max-w-sm">Add your business name and (optional) address. Takes 30 seconds.</p>
      <Link href="/merchant/setup" className="bg-[#1a1a1a] text-white rounded-full font-semibold px-6 py-3 text-sm hover:bg-black transition">Add business details →</Link>
    </div>
  )
}
