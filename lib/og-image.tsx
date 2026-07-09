import { ImageResponse } from 'next/og'
import { BrandLogoMark } from '@/lib/brand-icon'
import { OgCheckmark } from '@/lib/og-checkmark'
import { loadOgFonts, OG_FONT_BODY, OG_FONT_HEADING } from '@/lib/og-fonts'

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
const CARD_BORDER = '#E0CF4A'

function PunchCardPreview() {
  const punched = 7
  const total = 10

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 360,
        padding: 28,
        background: '#FFFFFF',
        border: `2px solid ${INK}`,
        borderRadius: 16,
        boxShadow: `4px 4px 0 ${INK}`,
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
              fontFamily: OG_FONT_HEADING,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: SUBTLE,
            }}
          >
            Tony&apos;s Tacos
          </span>
          <span
            style={{
              fontFamily: OG_FONT_HEADING,
              fontSize: 24,
              fontWeight: 700,
              color: INK,
              marginTop: 6,
              letterSpacing: '-0.02em',
            }}
          >
            Free Taco Tuesday
          </span>
        </div>
        <span
          style={{
            fontFamily: OG_FONT_HEADING,
            fontSize: 12,
            fontWeight: 700,
            background: MINT,
            color: INK,
            padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${INK}`,
          }}
        >
          {punched} / {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, width: 304 }}>
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
                border: filled
                  ? `2px solid ${CARD_BORDER}`
                  : `1px solid ${BORDER}`,
                fontSize: filled ? 0 : 14,
                fontWeight: 700,
                fontFamily: OG_FONT_HEADING,
                color: filled ? INK : '#C9C5BA',
              }}
            >
              {filled ? <OgCheckmark size={28} /> : String(i + 1)}
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
          borderTop: `1px solid ${BORDER}`,
          fontSize: 14,
          fontFamily: OG_FONT_BODY,
          fontWeight: 500,
          color: MUTED,
        }}
      >
        <span>3 more visits → </span>
        <span style={{ fontWeight: 500, color: INK }}>1 free taco</span>
      </div>
    </div>
  )
}

export async function createOgImage() {
  const fonts = await loadOgFonts()

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: WARM,
          padding: '52px 60px',
          fontFamily: OG_FONT_BODY,
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
              maxWidth: 580,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <BrandLogoMark size={80} />
              <span
                style={{
                  fontFamily: OG_FONT_HEADING,
                  fontSize: 58,
                  fontWeight: 700,
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
                marginTop: 32,
              }}
            >
              <span
                style={{
                  fontFamily: OG_FONT_HEADING,
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: 1.12,
                  color: INK,
                  letterSpacing: '-0.02em',
                }}
              >
                Bring customers back
              </span>
              <div
                style={{
                  display: 'flex',
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: OG_FONT_HEADING,
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1.12,
                    color: INK,
                    letterSpacing: '-0.02em',
                    background: YELLOW,
                    padding: '2px 10px',
                  }}
                >
                  without the busywork
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 22,
                fontSize: 21,
                fontWeight: 500,
                fontFamily: OG_FONT_BODY,
                lineHeight: 1.5,
                color: MUTED,
                maxWidth: 500,
              }}
            >
              Digital punch cards for local businesses — no app downloads, no
              hardware, flat $60/mo.
            </div>

            <span
              style={{
                marginTop: 32,
                fontSize: 17,
                fontWeight: 500,
                fontFamily: OG_FONT_BODY,
                color: SUBTLE,
                letterSpacing: '0.02em',
              }}
            >
              localpunchcard.io
            </span>
          </div>

          <PunchCardPreview />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
