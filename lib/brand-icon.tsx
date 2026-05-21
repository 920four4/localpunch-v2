import { ImageResponse } from 'next/og'
import { OgCheckmark } from '@/lib/og-checkmark'

const INK = '#1a1a1a'
const YELLOW = '#FFE566'
const BORDER = '#E0CF4A'
const EMPTY = '#F5F4EF'
const EMPTY_STROKE = '#C9C5BA'

/** Punch-card logo mark for OG images, favicons, and social previews. */
export function PunchCardLogoMark({ size = 72 }: { size?: number }) {
  const cardW = Math.round(size * 0.82)
  const cardH = Math.round(size * 0.54)
  const stroke = Math.max(2, Math.round(size * 0.028))
  const innerStroke = Math.max(1, Math.round(size * 0.018))
  const dot = Math.round(size * 0.095)
  const gap = Math.round(size * 0.07)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: YELLOW,
        border: `${stroke}px solid ${BORDER}`,
        borderRadius: Math.round(size * 0.2),
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: cardW,
          height: cardH,
          background: '#FFFFFF',
          border: `${innerStroke}px solid ${INK}`,
          borderRadius: Math.round(size * 0.08),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap }}>
          {[true, true, false].map((filled, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: dot * 2,
                height: dot * 2,
                borderRadius: dot,
                background: filled ? YELLOW : EMPTY,
                border: `${innerStroke}px solid ${filled ? INK : EMPTY_STROKE}`,
              }}
            >
              {filled ? <OgCheckmark size={dot * 2} /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** App icon / favicon — punch-card mark on brand yellow tile. */
export function createBrandIcon(size: number) {
  return new ImageResponse(<PunchCardLogoMark size={size} />, { width: size, height: size })
}
