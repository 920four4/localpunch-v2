'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/client'
import { AnalyticsEvents } from '@/lib/analytics/events'

export function WalletViewTracker({ cardCount }: { cardCount: number }) {
  useEffect(() => {
    trackEvent(AnalyticsEvents.WALLET_VIEW, {
      card_count: cardCount,
      user_role: 'customer',
    })
  }, [cardCount])
  return null
}
