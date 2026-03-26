'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { verifyQrToken, hashToken } from '@/lib/qr/tokens'
import type { PunchResult } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest): Promise<NextResponse<PunchResult | { error: string }>> {
  try {
    const body = await request.json()
    const { token } = body as { token: string }

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // 1. Verify JWT signature and expiration
    let payload
    try {
      payload = await verifyQrToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 })
    }

    const { business_id, program_id } = payload
    const tokenHash = hashToken(token)

    // 2. Use service-role client to bypass RLS
    const supabase = await createAdminClient()

    // 3. Check for replay — has this exact token been used before?
    const { data: existingPunch } = await supabase
      .from('punches')
      .select('id')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (existingPunch) {
      return NextResponse.json({ error: 'QR code already used' }, { status: 409 })
    }

    // 4. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Must be logged in to collect a punch' }, { status: 401 })
    }

    // 5. Verify business and program exist and are active
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('id, punches_required, is_active, business_id')
      .eq('id', program_id)
      .eq('business_id', business_id)
      .eq('is_active', true)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found or inactive' }, { status: 404 })
    }

    // 6. Get or create punch card
    let { data: card } = await supabase
      .from('punch_cards')
      .select('id, punch_count, is_complete')
      .eq('customer_id', user.id)
      .eq('program_id', program_id)
      .maybeSingle()

    if (!card) {
      const { data: newCard, error: createError } = await supabase
        .from('punch_cards')
        .insert({ customer_id: user.id, program_id })
        .select('id, punch_count, is_complete')
        .single()
      if (createError || !newCard) {
        return NextResponse.json({ error: 'Failed to create punch card' }, { status: 500 })
      }
      card = newCard
    }

    if (card.is_complete) {
      return NextResponse.json({ error: 'Card already complete — redeem your reward!' }, { status: 409 })
    }

    // 7. Insert punch (daily limit enforced via unique index)
    const { error: punchError } = await supabase
      .from('punches')
      .insert({ card_id: card.id, token_hash: tokenHash })

    if (punchError) {
      if (punchError.code === '23505') {
        return NextResponse.json({ error: 'Already punched today for this program' }, { status: 429 })
      }
      return NextResponse.json({ error: 'Failed to record punch' }, { status: 500 })
    }

    // 8. Increment punch_count
    const newCount = card.punch_count + 1
    const isComplete = newCount >= program.punches_required

    await supabase
      .from('punch_cards')
      .update({ punch_count: newCount, is_complete: isComplete })
      .eq('id', card.id)

    return NextResponse.json({
      success: true,
      punch_count: newCount,
      punches_required: program.punches_required,
      is_complete: isComplete,
      message: isComplete
        ? '🎉 Card complete! Show this to redeem your reward.'
        : `Punch recorded! ${program.punches_required - newCount} more to go.`,
    })
  } catch (err) {
    console.error('Punch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
