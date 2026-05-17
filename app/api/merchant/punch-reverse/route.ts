import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST /api/merchant/punch-reverse  { card_id }
// Merchant-authenticated. Undo the most recent punch on a card (wrong
// program / accidental double). The RPC enforces that this merchant owns
// the program and won't reach back across a redemption boundary.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { card_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.card_id) {
    return NextResponse.json({ error: 'card_id required' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { data, error } = await admin.rpc('reverse_last_punch', {
    p_card_id: body.card_id,
    p_merchant_id: user.id,
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const result = data as { error?: string; success?: boolean; [k: string]: unknown }
  if (result?.error) {
    const status = result.error.includes('different shop') ? 403 : 409
    return NextResponse.json({ error: result.error }, { status })
  }
  return NextResponse.json(result)
}
