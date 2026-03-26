import { createClient } from '@/lib/supabase/server'
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

    // Verify JWT signature and expiration
    let payload
    try {
      payload = await verifyQrToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 })
    }

    const { program_id } = payload
    const tokenHash = hashToken(token)

    // Use anon client — the record_punch RPC is SECURITY DEFINER
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('record_punch', {
      p_program_id: program_id,
      p_token_hash: tokenHash,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = data as { error?: string; success?: boolean; punch_count?: number; punches_required?: number; is_complete?: boolean }

    if (result.error) {
      const status = result.error.includes('already') ? 409 : result.error.includes('Not authenticated') ? 401 : 400
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      punch_count: result.punch_count!,
      punches_required: result.punches_required!,
      is_complete: result.is_complete!,
      message: result.is_complete
        ? '🎉 Card complete! Show this to redeem your reward.'
        : `Punch recorded! ${result.punches_required! - result.punch_count!} more to go.`,
    })
  } catch (err) {
    console.error('Punch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
