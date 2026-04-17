import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEvent, sendTransactional, syncContact } from '@/lib/loops'

/**
 * Lets a phone-auth customer attach an email to their account so we can send
 * them reminders (and the welcome email). Writes to auth.users via the admin
 * client, then mirrors to Loops and fires the welcome transactional.
 */
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let email: string
  try {
    const body = await request.json()
    email = String(body?.email ?? '').trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  // Already attached? Then skip the welcome.
  const alreadyHadEmail = Boolean(user.email)

  const admin = await createAdminClient()
  const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
    email,
    email_confirm: true,
  })
  if (updateErr) {
    return NextResponse.json(
      { error: 'update_failed', message: updateErr.message },
      { status: 500 }
    )
  }

  // Stamp marketing_consent on profile (they explicitly opted in by entering
  // their email in the "get reminders" flow).
  await admin
    .from('profiles')
    .update({ marketing_consent: true })
    .eq('id', user.id)

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name, phone, created_at')
    .eq('id', user.id)
    .maybeSingle()

  await syncContact(email, {
    userId: user.id,
    userGroup: 'customer',
    firstName: profile?.display_name ?? undefined,
    phone: profile?.phone ?? undefined,
    phoneVerified: true,
    marketingConsent: true,
    source: 'localpunch-wallet',
  })

  if (!alreadyHadEmail) {
    await sendEvent(email, 'customer_signed_up', {
      first_name: profile?.display_name ?? '',
    })
    await sendTransactional('customerWelcome', email, {
      first_name: profile?.display_name ?? 'there',
      wallet_url: 'https://localpunch-v2.vercel.app/wallet',
    })
  }

  return NextResponse.json({ ok: true })
}
