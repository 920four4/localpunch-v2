import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MerchantDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, is_active')
    .eq('owner_id', user!.id)
    .single()

  if (!business) {
    return <SetupBusinessPrompt />
  }

  const { count: programCount } = await supabase
    .from('loyalty_programs')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id)

  const hasProgram = (programCount ?? 0) > 0
  const isLive = Boolean(business.is_active)

  // Until the shop is fully live, the dashboard *is* the onboarding guide.
  if (!hasProgram || !isLive) {
    return (
      <GettingStarted
        businessName={business.name}
        hasProgram={hasProgram}
        isLive={isLive}
      />
    )
  }

  const { data: stats } = await supabase
    .from('merchant_program_stats')
    .select('*')
    .eq('business_id', business.id)

  const totalCustomers = stats?.reduce((a, s) => a + Number(s.total_customers), 0) ?? 0
  const totalPunches = stats?.reduce((a, s) => a + Number(s.total_punches), 0) ?? 0
  const totalRedemptions = stats?.reduce((a, s) => a + Number(s.total_redemptions), 0) ?? 0
  const activePrograms = stats?.length ?? 0

  const kpis = [
    { label: 'Customers', value: totalCustomers, icon: '👥', color: 'bg-[#A8E6CF]' },
    { label: 'Total Punches', value: totalPunches, icon: '✓', color: 'bg-[#FFE566]' },
    { label: 'Redemptions', value: totalRedemptions, icon: '🎁', color: 'bg-white' },
    { label: 'Active Programs', value: activePrograms, icon: '🎯', color: 'bg-white' },
  ]

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="page-header text-xl sm:text-2xl truncate">{business.name}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Merchant dashboard</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/merchant/guide"
            className="hidden sm:inline-flex nb-btn-ghost text-sm font-medium px-4 py-2 min-h-[44px]"
          >
            📖 Setup guide
          </Link>
          <Link href="/merchant/qr" className="nb-btn-primary text-sm font-semibold px-4 py-2.5 min-h-[44px] flex items-center">
            Show QR →
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`nb-card-flat p-4 ${kpi.color}`}>
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{kpi.value}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Programs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Your Programs</h2>
          <Link href="/merchant/programs/new" className="nb-btn-ghost text-xs px-3 py-1.5">+ New program</Link>
        </div>
        {(stats ?? []).length === 0 ? (
          <div className="nb-card-flat p-6 text-center">
            <p className="text-sm text-[#6B7280]">No programs yet.</p>
            <Link href="/merchant/programs/new" className="nb-btn-primary inline-flex mt-3 text-sm">Create your first program</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(stats ?? []).map((s: any) => (
              <div key={s.program_id} className="nb-card-flat p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{s.program_name}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{s.punches_required} punches · {s.total_customers} customers · {s.total_redemptions} redeemed</p>
                </div>
                <Link href={`/merchant/programs/${s.program_id}`} className="nb-btn-ghost text-xs px-3 py-1.5">Edit</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Getting started — the dashboard until the shop is live.
   Plain language, ordered, shows exactly what's left to do.
   ──────────────────────────────────────────────────────────── */

function GettingStarted({
  businessName,
  hasProgram,
  isLive,
}: {
  businessName: string
  hasProgram: boolean
  isLive: boolean
}) {
  const steps = [
    {
      done: true,
      title: 'Create your shop',
      desc: `${businessName} is set up. This is the name customers see on their card.`,
      href: null as string | null,
      cta: null as string | null,
    },
    {
      done: hasProgram,
      title: 'Create your first reward',
      desc: 'Decide what customers earn — e.g. “Buy 10 coffees, get one free.” Takes about a minute, and it’s free to build.',
      href: '/merchant/programs/new',
      cta: 'Create a reward',
    },
    {
      done: isLive,
      title: 'Go live',
      desc: 'Turn the shop on so customers can start collecting punches. $60/month or $600/year, cancel anytime. You only pay at this step.',
      href: '/merchant/billing',
      cta: 'Activate my shop',
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  const total = steps.length
  // The first step that still needs doing — the one we push them toward.
  const nextIndex = steps.findIndex(s => !s.done)
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-header text-2xl">Let&rsquo;s get {businessName} running</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {doneCount} of {total} done. A couple of short steps and your punch
          card is live &mdash; we&rsquo;ll walk you through each one.
        </p>
      </div>

      {/* Progress */}
      <div className="nb-card-flat p-4">
        <div className="flex justify-between text-xs font-medium text-[#6B7280] mb-2">
          <span>Setup progress</span>
          <span className="text-[#1a1a1a]">{pct}%</span>
        </div>
        <div className="h-2.5 bg-[#F4F4F0] rounded-full overflow-hidden border border-[#1a1a1a]">
          <div
            className="h-full bg-[#FFE566] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((s, i) => {
          const isNext = i === nextIndex
          return (
            <div
              key={s.title}
              className={`nb-card-flat p-5 flex items-start gap-4 ${
                s.done ? 'bg-[#F4F4F0]' : isNext ? 'bg-white' : 'bg-white opacity-60'
              }`}
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#1a1a1a] text-sm font-bold ${
                  s.done ? 'bg-[#A8E6CF]' : isNext ? 'bg-[#FFE566]' : 'bg-white text-[#6B7280]'
                }`}
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {s.done ? '✓' : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-[15px]"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {s.title}
                  {s.done && (
                    <span className="ml-2 text-xs font-medium text-[#6B7280]">
                      Done
                    </span>
                  )}
                </p>
                <p className="text-sm text-[#6B7280] leading-relaxed mt-1">
                  {s.desc}
                </p>
                {!s.done && s.href && s.cta && (
                  <Link
                    href={s.href}
                    className={`inline-flex mt-3 text-sm font-semibold px-4 py-2 ${
                      isNext ? 'nb-btn-primary' : 'nb-btn-ghost'
                    }`}
                  >
                    {s.cta} →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Help */}
      <div className="nb-card-flat p-5 bg-[#FFE566] flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p
            className="font-bold text-sm"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            📖 Not sure how it works at the counter?
          </p>
          <p className="text-xs text-[#1a1a1a]/80 mt-0.5">
            The 2-minute guide explains exactly what you and your customers do.
          </p>
        </div>
        <Link
          href="/merchant/guide"
          className="bg-[#1a1a1a] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-black transition whitespace-nowrap text-center"
        >
          Read the guide →
        </Link>
      </div>
    </div>
  )
}

function SetupBusinessPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="text-4xl mb-4">🏪</div>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Finish setting up your shop</h2>
      <p className="text-sm text-[#6B7280] mb-5 max-w-sm">Add your business name and (optional) address. Takes 30 seconds.</p>
      <Link href="/merchant/setup" className="bg-[#1a1a1a] text-white rounded-full font-semibold px-6 py-3 text-sm hover:bg-black transition">Add business details →</Link>
    </div>
  )
}
