import { ImageResponse } from 'next/og'

const INK = '#1a1a1a'
const YELLOW = '#FFE566'

/** Branded app icon / favicon — LP monogram on yellow (matches site header) */
export function createBrandIcon(size: number) {
  const fontSize = Math.round(size * 0.42)
  const radius = Math.round(size * 0.2)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          background: YELLOW,
          border: `${Math.max(2, Math.round(size * 0.04))}px solid #E0CF4A`,
          borderRadius: radius,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 800,
            color: INK,
            letterSpacing: '-0.06em',
            marginTop: Math.round(size * 0.02),
          }}
        >
          LP
        </span>
      </div>
    ),
    { width: size, height: size },
  )
}
