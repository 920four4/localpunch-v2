/**
 * COPY TO: src/components/track-view.tsx  (or anywhere in your app)
 *
 * Drop <TrackView /> into your root layout (inside <body>) to count visits.
 * Fires one cookie-less beacon per page load to /api/track/view. No PII,
 * no cookies, fully best-effort.
 *
 *   // app/layout.tsx
 *   import { TrackView } from '@/components/track-view'
 *   ...
 *   <body>
 *     <TrackView />
 *     {children}
 *   </body>
 */
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function TrackView() {
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {
      // best-effort — never surface to the user
    })
    return () => controller.abort()
  }, [pathname])

  return null
}
