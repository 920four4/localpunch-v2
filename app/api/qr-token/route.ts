import { createClient } from '@/lib/supabase/server'
import {
  signQrToken,
  hashToken,
  buildPunchUrl,
  TTL_SECONDS,
} from '@/lib/qr/tokens'
import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { program_id } = body as { program_id: string }

    if (!program_id) {
      return NextResponse.json({ error: 'program_id required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify merchant owns this program's business and that the shop is active.
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('id, business_id, businesses(owner_id, is_active)')
      .eq('id', program_id)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const business = program.businesses as unknown as
      | { owner_id: string; is_active: boolean }
      | null
    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not your program' }, { status: 403 })
    }

    if (!business.is_active) {
      return NextResponse.json(
        {
          error: 'inactive_subscription',
          message: 'Activate your shop to generate QR codes.',
        },
        { status: 402 }
      )
    }

    // Sign the token
    const token = await signQrToken({
      business_id: program.business_id,
      program_id,
    })

    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString()

    // Record token in DB
    await supabase.from('qr_tokens').insert({
      business_id: program.business_id,
      program_id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })

    // QR payload is now a full URL so that scanning with the phone's native
    // camera opens the punch-claim page directly — no in-app scanner required.
    const origin = request.nextUrl.origin
    const punchUrl = buildPunchUrl(token, origin)

    const qrDataUrl = await QRCode.toDataURL(punchUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: { dark: '#1a1a1a', light: '#FFFFFF' },
    })

    return NextResponse.json({
      token,
      punch_url: punchUrl,
      qr_data_url: qrDataUrl,
      expires_at: expiresAt,
      ttl_seconds: TTL_SECONDS,
    })
  } catch (err) {
    console.error('QR token error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
