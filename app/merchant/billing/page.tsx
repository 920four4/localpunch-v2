import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingActions, PlanPicker } from './billing-client'
import { isLiveStatus } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

type BusinessRow = {
  id: string
  name: string
  is_active: boolean
  subscription_status: string | null
  plan_interval: 'month' | 'year' | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = (await supabase
    .from('businesses')
    .select(
      'id, name, is_active, subscription_status, plan_interval, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id'
    )
    .eq('owner_id', user.id)
    .maybeSingle()) as { data: BusinessRow | null }

  if (!business) {
    redirect('/merchant/setup')
  }

  const live = isLiveStatus(business.subscription_status)

  return (
    <div className="space-y-7 max-w-3xl">
      <div>
        <h1 className="page-header text-2xl">Billing</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Activate your shop and manage your subscription.
        </p>
      </div>

      {params.status === 'success' && (
        <div className="rounded-xl bg-[#A8E6CF] border border-[#1a1a1a]/10 p-4 text-sm">
          <span className="font-semibold">Payment successful.</span> Your shop will activate in a
          few seconds. If this page doesn&rsquo;t update on its own, give it a refresh.
        </div>
      )}
      {params.status === 'canceled' && (
        <div className="rounded-xl bg-[#FEF3C7] border border-[#1a1a1a]/10 p-4 text-sm">
          Checkout canceled. No charge was made. Pick a plan below to try again.
        </div>
      )}

      {live ? (
        <ActiveSubscription business={business} />
      ) : (
        <InactiveSubscription business={business} />
      )}

      <div className="text-xs text-[#9CA3AF] leading-relaxed">
        Secure checkout and billing via{' '}
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-[#1a1a1a]"
        >
          Stripe
        </a>
        . We never see or store your card details.
      </div>
    </div>
  )
}

function ActiveSubscription({ business }: { business: BusinessRow }) {
  const plan = business.plan_interval === 'year' ? 'Yearly ($600/yr)' : 'Monthly ($60/mo)'
  const renewal = business.current_period_end
    ? new Date(business.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-5">
      <div className="nb-card-flat p-6 bg-[#A8E6CF]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest bg-[#1a1a1a] text-white px-2 py-0.5 rounded">
            Active
          </span>
          {business.cancel_at_period_end && (
            <span className="text-xs font-bold uppercase tracking-widest bg-[#F59E0B] text-white px-2 py-0.5 rounded">
              Cancels at period end
            </span>
          )}
        </div>
        <p
          className="text-lg font-bold mt-2"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {business.name} is live.
        </p>
        <p className="text-sm text-[#1a1a1a]/70 mt-1">
          Plan: <span className="font-semibold">{plan}</span>
          {renewal && (
            <>
              {' '}
              ·{' '}
              {business.cancel_at_period_end ? 'Ends' : 'Renews'} on{' '}
              <span className="font-semibold">{renewal}</span>
            </>
          )}
        </p>
      </div>

      <BillingActions hasCustomer={Boolean(business.stripe_customer_id)} showManage />
    </div>
  )
}

function InactiveSubscription({ business }: { business: BusinessRow }) {
  return (
    <div className="space-y-5">
      {/* Status banner */}
      {business.subscription_status && business.subscription_status !== 'canceled' ? (
        <div className="rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] p-4 text-sm text-[#991B1B]">
          Subscription status:{' '}
          <span className="font-semibold">{business.subscription_status}</span>.
          {business.subscription_status === 'past_due' &&
            ' Your last payment failed — update your payment method in the portal.'}
          {business.subscription_status === 'incomplete' &&
            ' Complete checkout to activate your shop.'}
          {business.subscription_status === 'unpaid' &&
            ' Payment is overdue. Update your billing details to restore service.'}
        </div>
      ) : (
        <div className="rounded-xl bg-[#FFF8E1] border border-[#1a1a1a]/10 p-4 text-sm flex items-start gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-semibold">
              {business.name} isn&rsquo;t live yet.
            </p>
            <p className="text-[#6B7280] mt-0.5">
              Pick a plan to activate your shop. Customers can&rsquo;t join or punch cards until
              you do.
            </p>
          </div>
        </div>
      )}

      <PlanPicker hasCustomer={Boolean(business.stripe_customer_id)} />
    </div>
  )
}
