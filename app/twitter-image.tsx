import { OG_ALT, OG_CONTENT_TYPE, OG_SIZE, createOgImage } from '@/lib/og-image'

export const runtime = 'nodejs'
export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImage()
}
