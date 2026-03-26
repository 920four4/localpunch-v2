import { createClient } from '@/lib/supabase/server'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: punches } = await supabase
    .from('punches')
    .select(`
      id, punched_at,
      card:punch_cards(
        id,
        program:loyalty_programs(
          name,
          business:businesses(name)
        )
      )
    `)
    .eq('punch_cards.customer_id', user!.id)
    .order('punched_at', { ascending: false })
    .limit(50)

  const { data: redemptions } = await supabase
    .from('redemptions')
    .select(`
      id, redeemed_at,
      card:punch_cards(
        id,
        program:loyalty_programs(
          name, reward_description,
          business:businesses(name)
        )
      )
    `)
    .eq('punch_cards.customer_id', user!.id)
    .order('redeemed_at', { ascending: false })
    .limit(20)

  type EventItem = {
    id: string
    ts: string
    type: 'punch' | 'redemption'
    businessName: string
    programName: string
    extra?: string
  }

  const events: EventItem[] = [
    ...(punches ?? []).map((p: any) => ({
      id: p.id,
      ts: p.punched_at,
      type: 'punch' as const,
      businessName: p.card?.program?.business?.name ?? 'Unknown',
      programName: p.card?.program?.name ?? 'Unknown',
    })),
    ...(redemptions ?? []).map((r: any) => ({
      id: r.id,
      ts: r.redeemed_at,
      type: 'redemption' as const,
      businessName: r.card?.program?.business?.name ?? 'Unknown',
      programName: r.card?.program?.name ?? 'Unknown',
      extra: r.card?.program?.reward_description,
    })),
  ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-header text-2xl">History</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Your punches and redeemed rewards.</p>
      </div>

      {events.length === 0 ? (
        <div className="nb-card-flat p-8 text-center">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm text-[#6B7280]">No activity yet. Collect your first punch!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="nb-card-flat p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-lg flex-shrink-0 ${
                ev.type === 'redemption' ? 'bg-[#A8E6CF]' : 'bg-[#FFE566]'
              }`}>
                {ev.type === 'redemption' ? '🎁' : '✓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {ev.type === 'punch' ? 'Punch collected' : 'Reward redeemed'}
                </p>
                <p className="text-xs text-[#6B7280] truncate">{ev.businessName} · {ev.programName}</p>
                {ev.extra && <p className="text-xs text-[#6B7280] truncate">{ev.extra}</p>}
              </div>
              <div className="text-xs text-[#6B7280] flex-shrink-0">
                {new Date(ev.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
