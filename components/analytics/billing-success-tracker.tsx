'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import {
  purchaseAlreadyTracked,
  trackEvent,
  trackPurchase,
} from '@/lib/analytics/client'
import { AnalyticsEvents } from '@/lib/analytics/events'

function BillingSuccessInner() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (status === 'canceled') {
      trackEvent(AnalyticsEvents.CHECKOUT_CANCELED, {
        event_category: 'ecommerce',
      })
      return
    }

    if (status !== 'success' || !sessionId) return
    if (purchaseAlreadyTracked(sessionId)) return

    fetch(`/api/analytics/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.ok) return
        trackPurchase({
          transactionId: data.transaction_id ?? sessionId,
          value: data.value,
          interval: data.interval,
          businessId: data.business_id,
          isRenewal: false,
        })
      })
      .catch(() => {})
  }, [status, sessionId])

  return null
}

export function BillingSuccessTracker() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessInner />
    </Suspense>
  )
}
