import MerchantLayoutClient from './merchant-layout-client'

export const dynamic = 'force-dynamic'

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <MerchantLayoutClient>{children}</MerchantLayoutClient>
}
