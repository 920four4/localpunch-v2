import { createClient } from '@/lib/supabase/server'
import ToggleBusinessButton from './toggle-button'

export const dynamic = 'force-dynamic'

type BusinessRow = {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
  subscription_status: string | null
  plan_interval: 'month' | 'year' | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  profiles: { display_name: string | null } | null
  loyalty_programs: { count: number }[] | null
}

function planLabel(interval: 'month' | 'year' | null) {
  if (interval === 'month') return 'Monthly'
  if (interval === 'year') return 'Yearly'
  return '—'
}

function subStatusBadge(status: string | null, isActive: boolean) {
  if (!status) {
    return isActive
      ? { label: 'Grandfathered', cls: 'bg-[#DBEAFE] border-[#1a1a1a] text-[#1e40af]' }
      : { label: 'Unactivated', cls: 'bg-[#F4F4F0] border-[#E5E7EB] text-[#6B7280]' }
  }
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

export default async function AdminBusinessesPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select(
      `id, name, slug, is_active, created_at,
       subscription_status, plan_interval, current_period_end, cancel_at_period_end,
       stripe_customer_id,
       profiles(display_name),
       loyalty_programs(count)`
    )
    .order('created_at', { ascending: false })
    .returns<BusinessRow[]>()

  const rows = businesses ?? []
  const paying = rows.filter((b) => b.subscription_status === 'active').length
  const pastDue = rows.filter((b) => b.subscription_status === 'past_due').length
  const unactivated = rows.filter((b) => !b.subscription_status && !b.is_active).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header text-2xl">Businesses</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {rows.length} total · {paying} paying · {pastDue} past due · {unactivated} unactivated
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#1a1a1a]">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider">
                Business
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                Owner
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider">
                Programs
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">
                Plan
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">
                Renews
              </th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider">
                Active
              </th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const badge = subStatusBadge(b.subscription_status, b.is_active)
              const renewal = b.current_period_end
                ? new Date(b.current_period_end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  })
                : '—'
              const stripeUrl = b.stripe_customer_id
                ? `https://dashboard.stripe.com/customers/${b.stripe_customer_id}`
                : null

              return (
                <tr key={b.id} className="border-b border-[#E5E7EB] hover:bg-white">
                  <td className="py-3 px-3">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-[#6B7280]">/{b.slug}</p>
                  </td>
                  <td className="py-3 px-3 text-[#6B7280] hidden lg:table-cell">
                    {b.profiles?.display_name ?? '—'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    {b.loyalty_programs?.[0]?.count ?? 0}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border font-medium ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-xs hidden lg:table-cell">
                    <span>{planLabel(b.plan_interval)}</span>
                    {b.cancel_at_period_end && (
                      <div className="text-[10px] text-[#F59E0B] mt-0.5">ending</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#6B7280] text-xs hidden xl:table-cell">
                    {renewal}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {b.is_active ? (
                      <span className="text-[#16a34a] font-bold">●</span>
                    ) : (
                      <span className="text-[#d1d5db]">●</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {stripeUrl && (
                        <a
                          href={stripeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#6B7280] underline hover:text-[#1a1a1a]"
                        >
                          Stripe ↗
                        </a>
                      )}
                      <ToggleBusinessButton id={b.id} isActive={b.is_active} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
