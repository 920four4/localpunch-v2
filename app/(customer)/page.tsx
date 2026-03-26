import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { PunchCard } from '@/lib/types'

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: cards } = await supabase
    .from('punch_cards')
    .select(`
      id, punch_count, is_complete, created_at,
      program:loyalty_programs(
        id, name, punches_required, reward_description,
        business:businesses(id, name, logo_url)
      )
    `)
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false }) as { data: PunchCard[] | null }

  const activeCards = cards?.filter(c => !c.is_complete) ?? []
  const completedCards = cards?.filter(c => c.is_complete) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header text-2xl">My Cards</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Scan a QR code at a business to collect punches.</p>
      </div>

      {activeCards.length === 0 && completedCards.length === 0 && (
        <div className="nb-card-flat p-8 text-center">
          <div className="text-4xl mb-3">🃏</div>
          <p className="font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>No cards yet</p>
          <p className="text-sm text-[#6B7280] mt-1">Scan a QR code at a participating business to get started.</p>
          <Link href="/scan" className="nb-btn-primary inline-flex mt-4 text-sm">
            Scan now →
          </Link>
        </div>
      )}

      {activeCards.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Active</h2>
          <div className="space-y-4">
            {activeCards.map(card => (
              <PunchCardPreview key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      {completedCards.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Ready to Redeem 🎉</h2>
          <div className="space-y-4">
            {completedCards.map(card => (
              <PunchCardPreview key={card.id} card={card} completed />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function PunchCardPreview({ card, completed }: { card: PunchCard; completed?: boolean }) {
  const program = card.program!
  const business = program.business!
  const total = program.punches_required
  const filled = Math.min(card.punch_count, total)

  return (
    <Link href={`/card/${card.id}`}>
      <div className={`nb-card p-4 ${completed ? 'bg-[#A8E6CF]' : 'bg-white'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-[#6B7280] font-medium">{business.name}</p>
            <p className="font-semibold leading-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{program.name}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{program.reward_description}</p>
          </div>
          {completed && (
            <span className="text-xs font-bold bg-[#1a1a1a] text-white px-2 py-1 rounded-md">READY</span>
          )}
        </div>

        {/* Stamp grid */}
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`stamp-slot w-8 h-8 text-sm ${i < filled ? (completed ? 'complete' : 'filled') : ''}`}
            >
              {i < filled ? '✓' : ''}
            </div>
          ))}
        </div>

        <div className="mt-3 text-xs text-[#6B7280]">
          {completed
            ? 'Show this to redeem your reward!'
            : `${filled}/${total} punches collected`}
        </div>
      </div>
    </Link>
  )
}
