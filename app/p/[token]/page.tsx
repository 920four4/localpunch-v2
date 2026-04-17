import { createClient } from '@/lib/supabase/server'
import { verifyQrToken } from '@/lib/qr/tokens'
import ClaimPunch from './claim'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ token: string }> }

// Public, guest-accessible punch-claim page. Reachable by scanning the
// merchant's counter QR with any phone camera (or by tapping the URL the
// customer receives via SMS after a manual punch).

export default async function PunchClaimPage({ params }: Props) {
  const { token } = await params

  let payload
  try {
    payload = await verifyQrToken(token)
  } catch {
    return <Shell><Expired /></Shell>
  }

  const supabase = await createClient()

  const [{ data: biz }, { data: program }, { data: auth }] = await Promise.all([
    supabase
      .from('businesses')
      .select('id, name, slug, is_active')
      .eq('id', payload.business_id)
      .maybeSingle(),
    supabase
      .from('loyalty_programs')
      .select('id, name, reward_description, punches_required, is_active')
      .eq('id', payload.program_id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ])

  if (!biz || !program) {
    return <Shell><NotFound /></Shell>
  }
  if (!biz.is_active) {
    return (
      <Shell>
        <Message
          icon="🔒"
          title={`${biz.name} isn\u2019t accepting punches yet`}
          body="The shop owner hasn't activated their account. Come back after they do — or let them know!"
        />
      </Shell>
    )
  }
  if (!program.is_active) {
    return (
      <Shell>
        <Message
          icon="⏸"
          title="This program is paused"
          body="Ask the shop if they have a different active loyalty program."
        />
      </Shell>
    )
  }

  // Existing session? Check role via profiles.
  const user = auth?.user ?? null
  let role: 'customer' | 'merchant' | 'admin' | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = (profile?.role as typeof role) ?? null
  }

  return (
    <Shell>
      <ClaimPunch
        token={token}
        business={{ name: biz.name }}
        program={{
          name: program.name,
          reward_description: program.reward_description,
          punches_required: program.punches_required,
        }}
        signedInAs={role}
      />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <header className="px-5 h-14 flex items-center justify-between border-b border-[#1a1a1a]/10 bg-white">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span className="inline-flex items-center justify-center w-7 h-7 bg-[#FFE566] rounded-md text-sm">
            🥊
          </span>
          LocalPunch
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center p-5 pt-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  )
}

function Expired() {
  return (
    <Message
      icon="⌛"
      title="This QR expired"
      body="Ask the shop to show a fresh QR code and scan again. QR codes refresh every 5 minutes for security."
    />
  )
}

function NotFound() {
  return (
    <Message
      icon="🤔"
      title="We couldn\u2019t find that program"
      body="This QR might be from a different shop, or the program has been deleted."
    />
  )
}

function Message({
  icon,
  title,
  body,
}: {
  icon: string
  title: string
  body: string
}) {
  return (
    <div className="nb-card-flat p-8 text-center space-y-4 bg-white">
      <div className="text-5xl">{icon}</div>
      <h1
        className="text-xl font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {title}
      </h1>
      <p className="text-sm text-[#6B7280]">{body}</p>
      <Link
        href="/"
        className="inline-block text-sm text-[#6B7280] hover:text-[#1a1a1a] mt-2"
      >
        ← Back to home
      </Link>
    </div>
  )
}
