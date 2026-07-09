import Script from 'next/script'

/**
 * DeskQ support widget — desk intercom shown bottom-right on every route.
 * Loaded once from the root layout. `data-bot-key` is a public publishable key.
 */
export function DeskQWidget() {
  return (
    <Script
      src="https://deskq.app/embed.js"
      data-bot-key="pk_D4aeSlVujvpWo0ddcKbYGWvB"
      strategy="afterInteractive"
    />
  )
}
