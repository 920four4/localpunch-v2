import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, notes } = body as { card_id: string; notes?: string }

    if (!card_id) {
      return NextResponse.json({ error: 'card_id required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify card belongs to user and is complete
    const { data: card } = await supabase
      .from('punch_cards')
      .select('id, customer_id, is_complete, program_id')
      .eq('id', card_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.customer_id !== user.id) {
      return NextResponse.json({ error: 'Not your card' }, { status: 403 })
    }

    if (!card.is_complete) {
      return NextResponse.json({ error: 'Card not complete yet' }, { status: 400 })
    }

    // Check not already redeemed (card should be reset)
    const { data: redemption, error: redeemError } = await supabase
      .from('redemptions')
      .insert({ card_id, approved_by: null, notes: notes ?? null })
      .select('id')
      .single()

    if (redeemError) {
      return NextResponse.json({ error: 'Failed to record redemption' }, { status: 500 })
    }

    // Reset the card for another cycle
    await supabase
      .from('punch_cards')
      .update({ punch_count: 0, is_complete: false })
      .eq('id', card_id)

    return NextResponse.json({ success: true, redemption_id: redemption.id })
  } catch (err) {
    console.error('Redeem error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
