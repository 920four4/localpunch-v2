import { createAdminClient } from '@/lib/supabase/server'
import { verifyRedeemToken } from '@/lib/qr/tokens'
import ConfirmRedeem from './confirm'
import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ token: string }> }

// Public page reached from the merchant-sent SMS confirm link. It only
// displays the reward and a single confirm button — the actual redemption
// is gated by the merchant-bound token (see /api/redeem-confirm).
export default async function RedeemConfirmPage({ params }: Props) {
  const { token } = await params

  let payload
  try {
    payload = await verifyRedeemToken(token)
  } catch {
    return (
      <Shell>
        <Message
          icon="⌛"
          title="This link expired"
          body="Ask the cashier to resend the confirmation text."
        />
      </Shell>
    )
  }

  if (!payload.merchant_id) {
    return (
      <Shell>
        <Message
          icon="🔒"
          title="This link can’t be used here"
          body="Show your reward QR to the cashier instead."
        />
      </Shell>
    )
  }

  const admin = await createAdminClient()
  const { data: card } = await admin
    .from('punch_cards')
    .select(
      `id, is_complete,
       program:loyalty_programs!inner(
         name, reward_description,
         business:businesses!inner(name)
       )`,
    )
    .eq('id', payload.card_id)
    .maybeSingle()

  const prog = card?.program as unknown as
    | {
        name: string
        reward_description: string | null
        business: { name: string }
      }
    | undefined

  if (!card || !prog) {
    return (
      <Shell>
        <Message
          icon="🤔"
          title="We couldn’t find that reward"
          body="It may have already been redeemed. Check with the cashier."
        />
      </Shell>
    )
  }

  if (!card.is_complete) {
    return (
      <Shell>
        <Message
          icon="✅"
          title="Already redeemed"
          body={`Your ${prog.name} reward at ${prog.business.name} has been used. Start collecting again!`}
        />
      </Shell>
    )
  }

  return (
    <Shell>
      <ConfirmRedeem
        token={token}
        businessName={prog.business.name}
        programName={prog.name}
        reward={prog.reward_description}
      />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      <header className="px-5 h-14 flex items-center border-b border-[#1a1a1a]/10 bg-white">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
<Logo size="sm" />
        </Link>
      </header>
      <main className="flex-1 flex items-start justify-center p-5 pt-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
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
        href="/wallet"
        className="inline-block text-sm text-[#6B7280] hover:text-[#1a1a1a] mt-2"
      >
        Go to my wallet →
      </Link>
    </div>
  )
}
