'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  setGaUserId,
  setGaUserProperties,
  trackEvent,
  trackPageView,
} from '@/lib/analytics/client'
import { AnalyticsEvents } from '@/lib/analytics/events'
import type { UserRole } from '@/lib/types'

function AnalyticsEffects() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // SPA page views
  useEffect(() => {
    const qs = searchParams.toString()
    const path = qs ? `${pathname}?${qs}` : pathname
    trackPageView(path)
  }, [pathname, searchParams])

  // Declarative CTA tracking: data-ga-event="cta_click" data-ga-location="hero" data-ga-label="start_free"
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-ga-event]')
      if (!el) return
      const event = el.dataset.gaEvent
      const location = el.dataset.gaLocation ?? 'unknown'
      const label = el.dataset.gaLabel ?? el.textContent?.trim()?.slice(0, 80) ?? 'click'
      const href =
        el instanceof HTMLAnchorElement
          ? el.href
          : el.querySelector('a')?.getAttribute('href') ?? undefined

      trackEvent(event ?? AnalyticsEvents.CTA_CLICK, {
        event_category: 'engagement',
        location,
        link_text: label,
        link_url: href,
      })

      if (event === 'cta_click' || !event) {
        trackEvent(AnalyticsEvents.GENERATE_LEAD, {
          location,
          link_text: label,
        })
      }
    }
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  // Attach user id + role for logged-in sessions
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setGaUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      const role = (profile?.role ?? 'customer') as UserRole

      let businessActive: boolean | undefined
      let planInterval: string | undefined

      if (role === 'merchant' || role === 'admin') {
        const { data: biz } = await supabase
          .from('businesses')
          .select('is_active, plan_interval')
          .eq('owner_id', user.id)
          .maybeSingle()
        businessActive = biz?.is_active
        planInterval = biz?.plan_interval ?? undefined
      }

      setGaUserProperties({
        user_role: role,
        business_active: businessActive,
        plan_interval: planInterval,
      })
    })
  }, [pathname])

  return null
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsEffects />
    </Suspense>
  )
}
