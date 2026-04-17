import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST /api/merchant/punch-manual
// Body: { program_id: string, phone?: string, email?: string, send_sms?: boolean }
// Merchants: look up (or create) a customer by phone/email and record a punch
// against the given program. Enforces merchant ownership + active subscription
// and the same once-per-day rule as a scanned punch.
//
// If no customer exists yet, we create the auth user via the admin API so the
// punch is tied to a real account. The customer can later sign in with that
// phone number and their cards will be there.

const schema = z
  .object({
    program_id: z.string().uuid(),
    phone: z.string().min(7).max(20).optional(),
    email: z.string().email().optional(),
    send_sms: z.boolean().optional(),
  })
  .refine(v => !!v.phone || !!v.email, {
    message: 'phone or email required',
  })

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  return raw.startsWith('+') ? raw : `+${digits}`
}

export async function POST(request: NextRequest) {
  // Merchant auth via cookie session.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const { program_id, phone, email } = parsed.data

  // Verify ownership + billing.
  const { data: program, error: progErr } = await supabase
    .from('loyalty_programs')
    .select(
      'id, business_id, name, businesses(owner_id, is_active, name)',
    )
    .eq('id', program_id)
    .maybeSingle()
  if (progErr || !program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 })
  }
  const biz = program.businesses as unknown as {
    owner_id: string
    is_active: boolean
    name: string
  } | null
  if (!biz || biz.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not your program' }, { status: 403 })
  }
  if (!biz.is_active) {
    return NextResponse.json(
      {
        error: 'inactive_subscription',
        message: 'Activate your shop before giving punches.',
      },
      { status: 402 },
    )
  }

  const admin = await createAdminClient()
  const e164 = phone ? toE164(phone) : undefined

  // Try to find an existing customer.
  const { data: foundId, error: findErr } = await admin.rpc(
    'find_customer_by_contact',
    { p_phone: e164 ?? null, p_email: email ?? null },
  )
  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 })
  }

  let customerId: string | null = (foundId as string | null) ?? null
  let created = false

  if (!customerId) {
    // Create the customer on the fly. phone_confirm=false so they still OTP
    // to access their account later; the punch is recorded now regardless.
    const createRes = await admin.auth.admin.createUser(
      email
        ? { email, email_confirm: false }
        : { phone: e164, phone_confirm: false },
    )
    if (createRes.error || !createRes.data?.user) {
      return NextResponse.json(
        { error: createRes.error?.message ?? 'Could not create customer' },
        { status: 500 },
      )
    }
    customerId = createRes.data.user.id
    created = true
    // handle_new_user trigger inserts profiles(role='customer'). Ensure
    // display_name is set to something friendly.
    await admin
      .from('profiles')
      .update({ display_name: e164 ?? email ?? null })
      .eq('id', customerId)
  }

  // Record the punch.
  const { data: punchRes, error: punchErr } = await admin.rpc(
    'record_punch_for_customer',
    {
      p_customer_id: customerId,
      p_program_id: program_id,
      p_source: 'manual',
    },
  )
  if (punchErr) {
    return NextResponse.json({ error: punchErr.message }, { status: 500 })
  }
  const result = punchRes as {
    error?: string
    success?: boolean
    punch_count?: number
    punches_required?: number
    is_complete?: boolean
    card_id?: string
  }
  if (result?.error) {
    const status = result.error.includes('already')
      ? 409
      : result.error.includes('complete')
      ? 409
      : 400
    return NextResponse.json(
      { error: result.error, customer_created: created },
      { status },
    )
  }

  // Optional display name for response.
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', customerId)
    .maybeSingle()

  return NextResponse.json({
    success: true,
    punch_count: result.punch_count,
    punches_required: result.punches_required,
    is_complete: result.is_complete,
    customer: {
      id: customerId,
      created,
      display_name: profile?.display_name ?? e164 ?? email ?? null,
    },
    message: result.is_complete
      ? `Card complete! ${biz.name} — redeem their reward.`
      : `Punch recorded. ${
          (result.punches_required ?? 0) - (result.punch_count ?? 0)
        } to go.`,
  })
}
