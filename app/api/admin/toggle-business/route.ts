import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { id, is_active } = await request.json()

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('admin_toggle_business', {
      p_business_id: id,
      p_is_active: is_active,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const result = data as { error?: string; success?: boolean }
    if (result.error) return NextResponse.json({ error: result.error }, { status: 403 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Toggle business error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
