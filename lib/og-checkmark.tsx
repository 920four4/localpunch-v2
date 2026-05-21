const INK = '#1a1a1a'

/** Satori-safe stamp check (no Unicode — avoids dynamic font fetches). */
export function OgCheckmark({ size }: { size: number }) {
  const stroke = Math.max(2, Math.round(size * 0.14))
  const arm = Math.round(size * 0.38)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          width: arm,
          height: Math.round(arm * 0.5),
          borderLeft: `${stroke}px solid ${INK}`,
          borderBottom: `${stroke}px solid ${INK}`,
          marginTop: Math.round(size * -0.08),
          marginLeft: Math.round(size * 0.06),
        }}
      />
    </div>
  )
}
