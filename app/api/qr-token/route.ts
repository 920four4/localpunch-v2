import { createClient } from '@/lib/supabase/server'
import { signQrToken, hashToken, TTL_SECONDS } from '@/lib/qr/tokens'
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

    // Verify merchant owns this program's business
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('id, business_id, businesses(owner_id)')
      .eq('id', program_id)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const business = program.businesses as unknown as { owner_id: string } | null
    if (!business || business.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not your program' }, { status: 403 })
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

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: { dark: '#1a1a1a', light: '#FFFFFF' },
    })

    return NextResponse.json({
      token,
      qr_data_url: qrDataUrl,
      expires_at: expiresAt,
      ttl_seconds: TTL_SECONDS,
    })
  } catch (err) {
    console.error('QR token error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
