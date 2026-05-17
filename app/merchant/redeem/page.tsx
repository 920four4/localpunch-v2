import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RedeemClient from './redeem-client'

export const dynamic = 'force-dynamic'

export default async function MerchantRedeemPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?role=business')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, is_active')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!business) {
    return (
      <div className="space-y-5 max-w-xl">
        <PageHeader />
        <LockedCard
          title="Finish setting up your shop"
          body="Add your shop details before redeeming rewards."
          ctaHref="/merchant/setup"
          ctaLabel="Complete setup →"
        />
      </div>
    )
  }
  if (!business.is_active) {
    return (
      <div className="space-y-5 max-w-xl">
        <PageHeader />
        <LockedCard
          title="🔒 Activate your shop"
          body="Activate your subscription to redeem customer rewards."
          ctaHref="/merchant/billing"
          ctaLabel="Activate now →"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-xl">
      <PageHeader />
      <RedeemClient />
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-header text-2xl">Redeem a reward</h1>
      <p className="text-sm text-[#6B7280] mt-0.5">
        Scan the customer’s reward QR — or look them up by phone/email if they
        can’t show it. A reward can only be redeemed here, by you.
      </p>
    </div>
  )
}

function LockedCard({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string
  body: string
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <div className="nb-card-flat p-8 flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-xl bg-[#FFE566] border-2 border-[#1a1a1a] flex items-center justify-center text-4xl">
        🎁
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </h2>
        <p className="text-sm text-[#6B7280]">{body}</p>
      </div>
      <Link
        href={ctaHref}
        className="bg-[#1a1a1a] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-black transition"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
