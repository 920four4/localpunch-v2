import { ImageResponse } from 'next/og'

const INK = '#1a1a1a'
const YELLOW = '#FFE566'

/** Punch-ring logo mark for OG images, favicons, and social previews. */
export function BrandLogoMark({ size = 72 }: { size?: number }) {
  const tileStroke = Math.max(2, Math.round(size * 0.027))
  const ringOuter = Math.round(size * 0.72)
  const ringStroke = Math.max(2, Math.round(size * 0.119))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: YELLOW,
        border: `${tileStroke}px solid ${INK}`,
        borderRadius: Math.round(size * 0.185),
      }}
    >
      <div
        style={{
          width: ringOuter,
          height: ringOuter,
          borderRadius: ringOuter,
          border: `${ringStroke}px solid ${INK}`,
          background: 'transparent',
        }}
      />
    </div>
  )
}

/** App icon / favicon — punch ring on brand yellow tile. */
export function createBrandIcon(size: number) {
  return new ImageResponse(<BrandLogoMark size={size} />, { width: size, height: size })
}
