import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ManualPunchClient from './manual-punch-client'

export const dynamic = 'force-dynamic'

export default async function MerchantPunchPage() {
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
    return <NoBusiness />
  }
  if (!business.is_active) {
    return <Inactive />
  }

  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('id, name, punches_required, reward_description')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (!programs || programs.length === 0) {
    return (
      <div className="space-y-5 max-w-xl">
        <PageHeader />
        <LockedCard
          title="Create a loyalty program first"
          body="You need at least one active program to give a punch."
          ctaHref="/merchant/programs/new"
          ctaLabel="Create a program →"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-xl">
      <PageHeader />
      <ManualPunchClient programs={programs} />
    </div>
  )
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-header text-2xl">Quick Punch</h1>
      <p className="text-sm text-[#6B7280] mt-0.5">
        Type a customer&rsquo;s phone number (or email) to give them a punch.
        Great for when their phone died, or they don&rsquo;t want to scan.
      </p>
    </div>
  )
}

function NoBusiness() {
  return (
    <div className="space-y-5 max-w-xl">
      <PageHeader />
      <LockedCard
        title="Finish setting up your shop"
        body="Add your shop details before giving punches."
        ctaHref="/merchant/setup"
        ctaLabel="Complete setup →"
      />
    </div>
  )
}

function Inactive() {
  return (
    <div className="space-y-5 max-w-xl">
      <PageHeader />
      <LockedCard
        title="🔒 Activate your shop"
        body="Activate your subscription to start giving punches."
        ctaHref="/merchant/billing"
        ctaLabel="Activate now →"
      />
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
        ⚡
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
