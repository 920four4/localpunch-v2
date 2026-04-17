'use client'

import { useState } from 'react'
import { toast } from 'sonner'

type LoadingState = 'month' | 'year' | 'portal' | null

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export function PlanPicker({ hasCustomer }: { hasCustomer: boolean }) {
  const [loading, setLoading] = useState<LoadingState>(null)

  async function checkout(interval: 'month' | 'year') {
    setLoading(interval)
    const { ok, data } = await postJson('/api/stripe/checkout', { interval })
    if (ok && data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.message || data.error || 'Checkout failed')
      setLoading(null)
    }
  }

  async function portal() {
    setLoading('portal')
    const { ok, data } = await postJson('/api/stripe/portal')
    if (ok && data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.message || data.error || 'Could not open billing portal')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <PlanCard
          title="Monthly"
          price="$60"
          suffix="/month"
          description="Unlimited cards, customers, and punches. Cancel anytime."
          onClick={() => checkout('month')}
          loading={loading === 'month'}
          disabled={loading !== null}
          cta="Activate monthly"
        />
        <PlanCard
          title="Yearly"
          price="$600"
          suffix="/year"
          description="Same as monthly, two months free. Billed once a year."
          badge="Save $120"
          highlight
          onClick={() => checkout('year')}
          loading={loading === 'year'}
          disabled={loading !== null}
          cta="Activate yearly"
        />
      </div>

      {hasCustomer && (
        <div className="text-center">
          <button
            onClick={portal}
            disabled={loading !== null}
            className="text-sm text-[#6B7280] hover:text-[#1a1a1a] underline disabled:opacity-50"
          >
            {loading === 'portal' ? 'Opening…' : 'Manage saved payment methods →'}
          </button>
        </div>
      )}
    </div>
  )
}

export function BillingActions({
  hasCustomer,
  showManage,
}: {
  hasCustomer: boolean
  showManage?: boolean
}) {
  const [loading, setLoading] = useState<LoadingState>(null)

  async function portal() {
    setLoading('portal')
    const { ok, data } = await postJson('/api/stripe/portal')
    if (ok && data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.message || data.error || 'Could not open billing portal')
      setLoading(null)
    }
  }

  if (!showManage || !hasCustomer) return null

  return (
    <div className="nb-card-flat p-5">
      <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        Manage billing
      </h3>
      <p className="text-sm text-[#6B7280] mb-3">
        Update your card, switch plans, download invoices, or cancel.
      </p>
      <button
        onClick={portal}
        disabled={loading !== null}
        className="nb-btn-ghost text-sm font-semibold px-4 py-2 disabled:opacity-50"
      >
        {loading === 'portal' ? 'Opening portal…' : 'Open billing portal →'}
      </button>
    </div>
  )
}

function PlanCard({
  title,
  price,
  suffix,
  description,
  onClick,
  loading,
  disabled,
  cta,
  highlight,
  badge,
}: {
  title: string
  price: string
  suffix: string
  description: string
  onClick: () => void
  loading: boolean
  disabled: boolean
  cta: string
  highlight?: boolean
  badge?: string
}) {
  return (
    <div
      className={`nb-card-flat p-5 flex flex-col ${
        highlight ? 'bg-[#FFE566]' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p
          className="text-sm font-bold uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </p>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-[#1a1a1a] text-white px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p
        className="text-3xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {price}
        <span className="text-sm font-medium text-[#6B7280] ml-1">{suffix}</span>
      </p>
      <p className="text-sm text-[#4B5563] mt-2 leading-relaxed flex-1">{description}</p>
      <ul className="mt-4 space-y-1 text-xs text-[#4B5563]">
        <li>✓ Unlimited loyalty cards</li>
        <li>✓ Unlimited customers</li>
        <li>✓ Unlimited punches & redemptions</li>
        <li>✓ Analytics & exports</li>
      </ul>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`mt-5 font-semibold py-2.5 rounded-full text-sm disabled:opacity-50 transition ${
          highlight
            ? 'bg-[#1a1a1a] text-white hover:bg-black'
            : 'bg-[#1a1a1a] text-white hover:bg-black'
        }`}
      >
        {loading ? 'Redirecting to Stripe…' : cta}
      </button>
    </div>
  )
}
