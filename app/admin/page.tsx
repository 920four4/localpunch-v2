import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { isLoopsConfigured } from '@/lib/loops'

export const dynamic = 'force-dynamic'

type StatsRow = {
  total_businesses: number
  active_businesses: number
  paid_merchants: number
  trialing_merchants: number
  past_due_merchants: number
  canceled_merchants: number
  unactivated_merchants: number
  mrr_cents: number
  total_customers: number
  total_merchants: number
  total_punches: number
  total_redemptions: number
  new_customers_7d: number
  new_businesses_7d: number
  new_paid_7d: number
}

type SignupRow = {
  id: string
  role: 'customer' | 'merchant' | 'admin'
  display_name: string | null
  phone: string | null
  created_at: string
  business_id: string | null
  business_name: string | null
  subscription_status: string | null
  plan_interval: 'month' | 'year' | null
}

function fmtMoney(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function AdminPage() {
  const supabase = await createClient()

  const [{ data: stats }, { data: signups }] = await Promise.all([
    supabase.from('platform_stats').select('*').single<StatsRow>(),
    supabase
      .from('admin_recent_signups')
      .select(
        'id, role, display_name, phone, created_at, business_id, business_name, subscription_status, plan_interval'
      )
      .limit(10)
      .returns<SignupRow[]>(),
  ])

  const s = stats ?? {
    total_businesses: 0,
    active_businesses: 0,
    paid_merchants: 0,
    trialing_merchants: 0,
    past_due_merchants: 0,
    canceled_merchants: 0,
    unactivated_merchants: 0,
    mrr_cents: 0,
    total_customers: 0,
    total_merchants: 0,
    total_punches: 0,
    total_redemptions: 0,
    new_customers_7d: 0,
    new_businesses_7d: 0,
    new_paid_7d: 0,
  }

  const arrCents = s.mrr_cents * 12
  const loopsOn = isLoopsConfigured()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header text-2xl">Platform Overview</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Live data from Supabase and Stripe.
        </p>
      </div>

      {/* Revenue headline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="nb-card-flat p-5 bg-[#A8E6CF] lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-[#1a1a1a]/70">
                Monthly recurring revenue
              </p>
              <p
                className="text-5xl font-bold mt-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                {fmtMoney(s.mrr_cents)}
              </p>
              <p className="text-sm text-[#1a1a1a]/70 mt-1">
                ~{fmtMoney(arrCents)}/yr run-rate · {s.paid_merchants} paying shop
                {s.paid_merchants === 1 ? '' : 's'}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="nb-card-flat p-5 bg-[#FFE566]">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#1a1a1a]/70">
            Last 7 days
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <StatRow label="New shops" value={s.new_businesses_7d} />
            <StatRow label="New customers" value={s.new_customers_7d} />
            <StatRow label="New paid" value={s.new_paid_7d} highlight />
          </div>
        </div>
      </div>

      {/* Subscription breakdown */}
      <div>
        <h2
          className="font-semibold mb-3"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Subscriptions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatusCard label="Paying" value={s.paid_merchants} tone="green" />
          <StatusCard label="Trialing" value={s.trialing_merchants} tone="yellow" />
          <StatusCard label="Past due" value={s.past_due_merchants} tone="red" />
          <StatusCard label="Canceled" value={s.canceled_merchants} tone="gray" />
          <StatusCard label="Never activated" value={s.unactivated_merchants} tone="gray" />
        </div>
      </div>

      {/* Usage stats */}
      <div>
        <h2
          className="font-semibold mb-3"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Usage
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Total shops" value={s.total_businesses} icon="🏪" />
          <KpiCard label="Customers" value={s.total_customers} icon="👥" />
          <KpiCard label="Punches" value={s.total_punches} icon="✓" />
          <KpiCard label="Redemptions" value={s.total_redemptions} icon="🎁" />
        </div>
      </div>

      {/* Recent signups feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-semibold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Recent signups
          </h2>
          <Link href="/admin/users" className="text-xs text-[#6B7280] underline">
            View all users
          </Link>
        </div>
        <div className="space-y-2">
          {(signups ?? []).length === 0 && (
            <p className="text-sm text-[#6B7280]">No signups yet.</p>
          )}
          {(signups ?? []).map((row) => (
            <SignupRowCard key={row.id} row={row} />
          ))}
        </div>
      </div>

      {/* Integration status */}
      <div>
        <h2
          className="font-semibold mb-3"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Integrations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <IntegrationCard
            name="Stripe"
            ok={Boolean(process.env.STRIPE_SECRET_KEY)}
            okLabel="Connected"
            missingLabel="STRIPE_SECRET_KEY not set"
          />
          <IntegrationCard
            name="Loops (email)"
            ok={loopsOn}
            okLabel="Connected"
            missingLabel="LOOPS_API_KEY not set"
          />
        </div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#1a1a1a]/70">{label}</span>
      <span
        className={`font-bold ${highlight ? 'text-[#16a34a]' : ''}`}
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {value}
      </span>
    </div>
  )
}

function KpiCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="nb-card-flat p-4 bg-white">
      <div className="text-xl mb-1">{icon}</div>
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {Number(value).toLocaleString()}
      </div>
      <div className="text-xs text-[#6B7280] mt-0.5">{label}</div>
    </div>
  )
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'green' | 'yellow' | 'red' | 'gray'
}) {
  const bg = {
    green: 'bg-[#A8E6CF]',
    yellow: 'bg-[#FFE566]',
    red: 'bg-[#FECACA]',
    gray: 'bg-white',
  }[tone]
  return (
    <div className={`nb-card-flat p-4 ${bg}`}>
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {Number(value).toLocaleString()}
      </div>
      <div className="text-xs text-[#1a1a1a]/70 mt-0.5">{label}</div>
    </div>
  )
}

function SignupRowCard({ row }: { row: SignupRow }) {
  const isMerchant = row.role === 'merchant' || Boolean(row.business_id)
  const subBadge = row.subscription_status
    ? subStatusBadge(row.subscription_status)
    : isMerchant
      ? { label: 'Unactivated', cls: 'bg-[#F4F4F0] text-[#6B7280] border-[#E5E7EB]' }
      : null

  return (
    <div className="nb-card-flat p-4 flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded font-semibold ${
              row.role === 'admin'
                ? 'bg-[#1a1a1a] text-white'
                : isMerchant
                  ? 'bg-[#FFE566] text-[#1a1a1a] border border-[#1a1a1a]'
                  : 'bg-[#F4F4F0] text-[#6B7280] border border-[#E5E7EB]'
            }`}
          >
            {isMerchant ? 'merchant' : row.role}
          </span>
          <p className="font-medium text-sm truncate">
            {row.business_name || row.display_name || row.phone || 'Unnamed'}
          </p>
        </div>
        <p className="text-xs text-[#6B7280] mt-0.5 truncate">
          {row.business_name && row.display_name
            ? `Owner: ${row.display_name}`
            : row.phone
              ? row.phone
              : '—'}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {subBadge && (
          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${subBadge.cls}`}>
            {subBadge.label}
          </span>
        )}
        <span className="text-xs text-[#6B7280]">{fmtDate(row.created_at)}</span>
      </div>
    </div>
  )
}

function subStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Paying', cls: 'bg-[#A8E6CF] border-[#1a1a1a]' }
    case 'trialing':
      return { label: 'Trial', cls: 'bg-[#FFE566] border-[#1a1a1a]' }
    case 'past_due':
    case 'unpaid':
      return { label: status, cls: 'bg-[#FECACA] border-[#DC2626] text-[#991B1B]' }
    case 'canceled':
      return { label: 'Canceled', cls: 'bg-white border-[#E5E7EB] text-[#6B7280]' }
    case 'incomplete':
    case 'incomplete_expired':
      return { label: status, cls: 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]' }
    default:
      return { label: status, cls: 'bg-white border-[#E5E7EB] text-[#6B7280]' }
  }
}

function IntegrationCard({
  name,
  ok,
  okLabel,
  missingLabel,
}: {
  name: string
  ok: boolean
  okLabel: string
  missingLabel: string
}) {
  return (
    <div className={`nb-card-flat p-4 flex items-center justify-between ${ok ? 'bg-white' : 'bg-[#FEF3C7]'}`}>
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-[#6B7280] mt-0.5">{ok ? okLabel : missingLabel}</p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded border font-medium ${
          ok
            ? 'bg-[#A8E6CF] border-[#1a1a1a]'
            : 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
        }`}
      >
        {ok ? '✓ OK' : '! Setup'}
      </span>
    </div>
  )
}
