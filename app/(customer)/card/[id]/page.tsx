import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RedeemButton from './redeem-button'
import type { PunchCard } from '@/lib/types'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: card } = await supabase
    .from('punch_cards')
    .select(`
      id, punch_count, is_complete, created_at,
      program:loyalty_programs(
        id, name, description, punches_required, reward_description,
        business:businesses(id, name, logo_url, address)
      )
    `)
    .eq('id', id)
    .eq('customer_id', user!.id)
    .single() as { data: PunchCard | null }

  if (!card) notFound()

  const program = card.program!
  const business = program.business!
  const total = program.punches_required
  const filled = Math.min(card.punch_count, total)
  const remaining = total - filled

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">{business.name}</p>
        <h1 className="page-header text-2xl mt-0.5">{program.name}</h1>
        {program.description && <p className="text-sm text-[#6B7280] mt-1">{program.description}</p>}
      </div>

      {/* Card visual */}
      <div className={`nb-card-flat p-5 ${card.is_complete ? 'bg-[#A8E6CF]' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            🎁 {program.reward_description}
          </p>
          {card.is_complete && (
            <span className="text-xs font-bold bg-[#1a1a1a] text-white px-2 py-1 rounded">READY!</span>
          )}
        </div>

        {/* Stamp grid — responsive, max 5 per row */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(total, 5)}, minmax(0, 1fr))` }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`stamp-slot aspect-square flex items-center justify-center text-lg font-bold ${
                i < filled ? (card.is_complete ? 'complete' : 'filled') : ''
              }`}
            >
              {i < filled ? '✓' : <span className="text-[#D1D5DB] text-sm">{i + 1}</span>}
            </div>
          ))}
        </div>

        <p className="text-sm text-[#6B7280] mt-4">
          {card.is_complete
            ? '🎉 Card complete — show this to the cashier!'
            : `${filled} of ${total} punches collected · ${remaining} more to go`}
        </p>
      </div>

      {/* Business info */}
      {business.address && (
        <div className="nb-card-flat p-4">
          <p className="text-xs text-[#6B7280] font-medium mb-0.5">Location</p>
          <p className="text-sm font-medium">{business.address}</p>
        </div>
      )}

      {card.is_complete && <RedeemButton cardId={card.id} />}
    </div>
  )
}
