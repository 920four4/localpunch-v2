import Script from 'next/script'
import { GA_MEASUREMENT_ID, isGaEnabled } from '@/lib/analytics/config'

export function GoogleAnalytics() {
  if (!isGaEnabled()) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false,
            allow_google_signals: true,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  )
}
