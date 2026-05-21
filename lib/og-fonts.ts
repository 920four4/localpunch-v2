import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const FONT_DIR = join(process.cwd(), 'public/fonts')

export async function loadOgFonts() {
  const [spaceGroteskBold, dmSansRegular, dmSansMedium] = await Promise.all([
    readFile(join(FONT_DIR, 'SpaceGrotesk-Bold.woff')),
    readFile(join(FONT_DIR, 'DMSans-Regular.woff')),
    readFile(join(FONT_DIR, 'DMSans-Medium.woff')),
  ])

  return [
    {
      name: 'Space Grotesk',
      data: spaceGroteskBold,
      weight: 700 as const,
      style: 'normal' as const,
    },
    {
      name: 'DM Sans',
      data: dmSansRegular,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'DM Sans',
      data: dmSansMedium,
      weight: 500 as const,
      style: 'normal' as const,
    },
  ]
}

export const OG_FONT_HEADING = 'Space Grotesk'
export const OG_FONT_BODY = 'DM Sans'
