import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST /api/merchant/redeem-lookup
// Merchant-authenticated. Fallback for when the customer can't show a QR
// (dead phone, broken camera). Find a customer by phone/email and return
// their *completed* cards that belong to THIS merchant's programs only.
// No redemption happens here — the merchant still has to confirm.
const schema = z
  .object({
    phone: z.string().min(7).max(20).optional(),
    email: z.string().email().optional(),
  })
  .refine(v => !!v.phone || !!v.email, { message: 'phone or email required' })

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  return raw.startsWith('+') ? raw : `+${digits}`
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Caller must own an active business.
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, is_active')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!business) {
    return NextResponse.json({ error: 'No business' }, { status: 403 })
  }
  if (!business.is_active) {
    return NextResponse.json(
      { error: 'Your shop isn’t active' },
      { status: 402 },
    )
  }

  // This merchant's program ids — the only cards we'll ever surface.
  const { data: ownPrograms } = await supabase
    .from('loyalty_programs')
    .select('id, name, reward_description')
    .eq('business_id', business.id)
  const programById = new Map(
    (ownPrograms ?? []).map(p => [p.id as string, p]),
  )
  if (programById.size === 0) {
    return NextResponse.json({ customer: null, cards: [] })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'phone or email required' }, { status: 400 })
  }
  const { phone, email } = parsed.data
  const e164 = phone ? toE164(phone) : undefined

  const admin = await createAdminClient()
  const { data: customerId, error: findErr } = await admin.rpc(
    'find_customer_by_contact',
    { p_phone: e164 ?? null, p_email: email ?? null },
  )
  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 })
  }
  if (!customerId) {
    return NextResponse.json({ customer: null, cards: [] })
  }

  // Completed cards for this customer — then hard-filter to program ids we
  // already proved belong to this merchant. No reliance on embedded-filter
  // semantics for the security boundary.
  const { data: rawCards } = await admin
    .from('punch_cards')
    .select('id, program_id, is_complete')
    .eq('customer_id', customerId)
    .eq('is_complete', true)

  const cards = (rawCards ?? [])
    .filter(c => programById.has(c.program_id as string))
    .map(c => {
      const prog = programById.get(c.program_id as string)!
      return {
        card_id: c.id as string,
        program_name: (prog.name as string) ?? 'Reward',
        reward: (prog.reward_description as string | null) ?? null,
        business_name: business.name as string,
      }
    })

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', customerId)
    .maybeSingle()

  return NextResponse.json({
    customer: {
      id: customerId,
      display_name: profile?.display_name ?? e164 ?? email ?? 'Customer',
    },
    cards,
  })
}
