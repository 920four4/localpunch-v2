'use client'

import { GA_MEASUREMENT_ID, isGaEnabled } from '@/lib/analytics/config'
import {
  AnalyticsEvents,
  cleanParams,
  type AnalyticsEventName,
  type GaParams,
  type UserRole,
} from '@/lib/analytics/events'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag(...args)
}

export function trackPageView(path: string, title?: string) {
  if (!isGaEnabled()) return
  gtag('event', AnalyticsEvents.PAGE_VIEW, {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  })
}

export function setGaUserId(userId: string | null) {
  if (!isGaEnabled() || !userId) return
  gtag('config', GA_MEASUREMENT_ID, { user_id: userId })
}

export function setGaUserProperties(props: {
  user_role?: UserRole
  business_active?: boolean
  plan_interval?: string
}) {
  if (!isGaEnabled()) return
  gtag('set', 'user_properties', cleanParams(props as GaParams))
}

export function trackEvent(
  name: AnalyticsEventName | string,
  params?: GaParams,
) {
  if (!isGaEnabled()) return
  gtag('event', name, cleanParams(params ?? {}))
}

/** Marketing / product CTAs */
export function trackCtaClick(location: string, label: string, href?: string) {
  trackEvent(AnalyticsEvents.CTA_CLICK, {
    event_category: 'engagement',
    location,
    link_text: label,
    link_url: href,
  })
  trackEvent(AnalyticsEvents.GENERATE_LEAD, {
    event_category: 'engagement',
    location,
    link_text: label,
  })
}

export function trackSignUp(method: string, role: UserRole) {
  trackEvent(AnalyticsEvents.SIGN_UP, {
    method,
    user_role: role,
  })
}

export function trackLogin(method: string, role: UserRole) {
  trackEvent(AnalyticsEvents.LOGIN, {
    method,
    user_role: role,
  })
}

export function trackBeginCheckout(interval: 'month' | 'year', value: number) {
  trackEvent(AnalyticsEvents.BEGIN_CHECKOUT, {
    currency: 'USD',
    value,
    plan_interval: interval,
    items: [
      {
        item_id: interval === 'year' ? 'plan_yearly' : 'plan_monthly',
        item_name: interval === 'year' ? 'Yearly' : 'Monthly',
        price: value,
        quantity: 1,
      },
    ],
  })
}

export function trackPurchase(args: {
  transactionId: string
  value: number
  interval: 'month' | 'year'
  businessId?: string
  isRenewal?: boolean
}) {
  const { transactionId, value, interval, businessId, isRenewal } = args
  trackEvent(AnalyticsEvents.PURCHASE, {
    transaction_id: transactionId,
    currency: 'USD',
    value,
    plan_interval: interval,
    business_id: businessId,
    purchase_type: isRenewal ? 'renewal' : 'subscription',
    items: [
      {
        item_id: interval === 'year' ? 'plan_yearly' : 'plan_monthly',
        item_name: interval === 'year' ? 'LocalPunch Yearly' : 'LocalPunch Monthly',
        price: value,
        quantity: 1,
      },
    ],
  })
  if (!isRenewal) {
    trackEvent(AnalyticsEvents.MERCHANT_ACTIVATED, {
      business_id: businessId,
      plan_interval: interval,
      value,
    })
  }
}

/** Dedupe client purchase fire (webhook also sends server-side). */
export function purchaseAlreadyTracked(transactionId: string): boolean {
  if (typeof window === 'undefined') return false
  const key = `ga_purchase_${transactionId}`
  if (sessionStorage.getItem(key)) return true
  sessionStorage.setItem(key, '1')
  return false
}
