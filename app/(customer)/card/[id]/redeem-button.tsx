'use client'

import { useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'

const TTL = 300

// The customer can no longer redeem their own reward. They reveal a
// short-lived QR; the cashier scans it on the merchant Redeem screen, which
// is the only place a redemption can actually happen.
export default function RedeemButton({ cardId }: { cardId: string }) {
  const [showQr, setShowQr] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(TTL)
  const [error, setError] = useState('')

  const fetchToken = useCallback(async () => {
    setError('')
    setQrUrl('')
    try {
      const res = await fetch('/api/redeem-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not generate a redeem code')
        return
      }
      const img = await QRCode.toDataURL(data.qr_payload, {
        errorCorrectionLevel: 'H',
        width: 320,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#FFFFFF' },
      })
      setQrUrl(img)
      setSecondsLeft(data.ttl_seconds ?? TTL)
    } catch {
      setError('Network issue — please try again.')
    }
  }, [cardId])

  useEffect(() => {
    if (!showQr || !qrUrl) return
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          fetchToken()
          return TTL
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [showQr, qrUrl, fetchToken])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  if (!showQr) {
    return (
      <button
        onClick={() => {
          setShowQr(true)
          fetchToken()
        }}
        className="nb-btn-primary w-full font-semibold py-3 text-sm"
      >
        Redeem reward
      </button>
    )
  }

  return (
    <div className="nb-card-flat p-5 text-center space-y-4 bg-white">
      <div>
        <p
          className="font-semibold text-sm"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Show this to the cashier
        </p>
        <p className="text-xs text-[#6B7280] mt-1">
          They&rsquo;ll scan it to give you your reward. Nothing to tap
          yourself — just show the screen.
        </p>
      </div>

      {error ? (
        <div className="space-y-3 py-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchToken}
            className="nb-btn-ghost text-sm px-4 py-2"
          >
            Try again
          </button>
        </div>
      ) : qrUrl ? (
        <>
          <img
            src={qrUrl}
            alt="Redemption QR"
            className="mx-auto w-56 h-56 rounded-lg border-2 border-[#1a1a1a]"
          />
          <p className="text-xs text-[#6B7280]">
            Refreshes in{' '}
            <span className="font-mono font-medium text-[#1a1a1a]">
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </p>
        </>
      ) : (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <button
        onClick={() => setShowQr(false)}
        className="text-xs text-[#6B7280] hover:text-[#1a1a1a]"
      >
        Hide
      </button>
    </div>
  )
}
