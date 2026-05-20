import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { Toaster } from '@/components/ui/sonner'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const defaultDescription =
  'Replace paper punch cards with digital loyalty programs. Simple, secure, and mobile-friendly.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'LocalPunch — Digital Punch Cards for Local Businesses',
  description: defaultDescription,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'LocalPunch — Digital Punch Cards for Local Businesses',
    description: defaultDescription,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'LocalPunch — Digital punch cards for local businesses',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalPunch — Digital Punch Cards for Local Businesses',
    description: defaultDescription,
    images: [`${SITE_URL}/twitter-image`],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FFE566',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased" suppressHydrationWarning>
        <GoogleAnalytics />
        <AnalyticsProvider />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
