import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, notes } = body as { card_id: string; notes?: string }

    if (!card_id) {
      return NextResponse.json({ error: 'card_id required' }, { status: 400 })
    }

    // redeem_card RPC is SECURITY DEFINER — no service role needed
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('redeem_card', {
      p_card_id: card_id,
      p_notes: notes ?? null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = data as { error?: string; success?: boolean; redemption_id?: string }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, redemption_id: result.redemption_id })
  } catch (err) {
    console.error('Redeem error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
