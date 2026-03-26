import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: statsRow } = await supabase
    .from('platform_stats')
    .select('*')
    .single()

  // Recent businesses
  const { data: recentBusinesses } = await supabase
    .from('businesses')
    .select('id, name, is_active, created_at, profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const kpis = [
    { label: 'Businesses', value: statsRow?.total_businesses ?? 0, icon: '🏪', color: 'bg-[#FFE566]' },
    { label: 'Customers', value: statsRow?.total_customers ?? 0, icon: '👥', color: 'bg-[#A8E6CF]' },
    { label: 'Total Punches', value: statsRow?.total_punches ?? 0, icon: '✓', color: 'bg-white' },
    { label: 'Redemptions', value: statsRow?.total_redemptions ?? 0, icon: '🎁', color: 'bg-white' },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="page-header text-2xl">Platform Overview</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Real-time platform stats</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`nb-card-flat p-4 ${kpi.color}`}>
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{Number(kpi.value).toLocaleString()}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Recent businesses</h2>
          <a href="/admin/businesses" className="text-xs text-[#6B7280] underline">View all</a>
        </div>
        <div className="space-y-2">
          {(recentBusinesses ?? []).map((b: any) => (
            <div key={b.id} className="nb-card-flat p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{b.name}</p>
                <p className="text-xs text-[#6B7280]">Owner: {b.profiles?.display_name ?? 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded border ${b.is_active ? 'bg-[#A8E6CF] border-[#1a1a1a]' : 'bg-[#F4F4F0] border-[#E5E7EB] text-[#6B7280]'}`}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-[#6B7280]">
                  {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
