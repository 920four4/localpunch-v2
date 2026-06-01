import { NextResponse, type NextRequest } from 'next/server'
import { sendTransactional } from '@/lib/email'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * Lets a phone-auth customer attach an email to their account so we can send
 * them reminders and the welcome email via Resend.
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

  await admin
    .from('profiles')
    .update({ marketing_consent: true })
    .eq('id', user.id)

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.localpunchcard.io'

  if (!alreadyHadEmail) {
    await sendTransactional('customerWelcome', email, {
      first_name: profile?.display_name ?? 'there',
      wallet_url: `${site}/wallet`,
    })
  }

  return NextResponse.json({ ok: true })
}
