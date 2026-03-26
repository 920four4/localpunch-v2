import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
  if (!business) return NextResponse.json({ error: 'No business' }, { status: 404 })

  const { data: cards } = await supabase
    .from('punch_cards')
    .select(`
      punch_count, is_complete, created_at,
      customer:profiles(display_name, phone, marketing_consent),
      program:loyalty_programs(name, punches_required)
    `)
    .eq('loyalty_programs.business_id', business.id)

  // Build CSV
  const rows = [
    ['Name', 'Phone', 'Marketing Consent', 'Program', 'Punches', 'Required', 'Complete', 'Since'],
    ...(cards ?? []).map((c: any) => [
      c.customer?.display_name ?? '',
      c.customer?.marketing_consent ? (c.customer?.phone ?? '') : '',
      c.customer?.marketing_consent ? 'yes' : 'no',
      c.program?.name ?? '',
      c.punch_count,
      c.program?.punches_required ?? '',
      c.is_complete ? 'yes' : 'no',
      c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '',
    ]),
  ]

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="localpunch-customers.csv"',
    },
  })
}
