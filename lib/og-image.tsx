import { ImageResponse } from 'next/og'
import { PunchCardLogoMark } from '@/lib/brand-icon'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'
export const OG_ALT =
  'LocalPunch — Digital punch cards for local businesses'

const INK = '#1a1a1a'
const WARM = '#FAFAF8'
const YELLOW = '#FFE566'
const MINT = '#A8E6CF'
const MUTED = '#5A554C'
const SUBTLE = '#9A9387'
const BORDER = '#E7E6DF'

function PunchCardPreview() {
  const punched = 7
  const total = 10

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 340,
        padding: 28,
        background: '#FFFFFF',
        border: `2px solid ${INK}`,
        borderRadius: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: SUBTLE,
            }}
          >
            Tony&apos;s Tacos
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: INK,
              marginTop: 4,
            }}
          >
            Free Taco Tuesday
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            background: MINT,
            color: INK,
            padding: '6px 12px',
            borderRadius: 999,
          }}
        >
          {punched} / {total}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          width: 284,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < punched
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 999,
                background: filled ? YELLOW : '#F5F4EF',
                border: filled ? '2px solid #E0CF4A' : `1px solid ${BORDER}`,
                color: filled ? INK : '#C9C5BA',
                fontSize: filled ? 20 : 14,
                fontWeight: 700,
              }}
            >
              {filled ? '●' : String(i + 1)}
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #EDEBE3',
          fontSize: 14,
          color: MUTED,
        }}
      >
        <span>3 more visits → </span>
        <span style={{ fontWeight: 700, color: INK }}>1 free taco</span>
      </div>
    </div>
  )
}

export async function createOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: WARM,
          padding: '56px 64px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 560,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <PunchCardLogoMark size={72} />
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: INK,
                  letterSpacing: '-0.03em',
                }}
              >
                LocalPunch
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 28,
              }}
            >
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: INK,
                  letterSpacing: '-0.02em',
                }}
              >
                Bring customers back
              </span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: INK,
                  letterSpacing: '-0.02em',
                  background: YELLOW,
                  padding: '0 8px',
                  marginTop: 4,
                }}
              >
                without the busywork
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 20,
                fontSize: 22,
                fontWeight: 500,
                lineHeight: 1.45,
                color: MUTED,
                maxWidth: 480,
              }}
            >
              Digital punch cards for local businesses — no app downloads, no
              hardware, flat $60/mo.
            </div>

            <span
              style={{
                marginTop: 36,
                fontSize: 18,
                fontWeight: 500,
                color: SUBTLE,
              }}
            >
              localpunchcard.io
            </span>
          </div>

          <PunchCardPreview />
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
