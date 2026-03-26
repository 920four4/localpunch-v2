'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { useEffect } from 'react'

export default function RedeemButton({ cardId }: { cardId: string }) {
  const [showQr, setShowQr] = useState(false)
  const [qrUrl, setQrUrl] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function generateRedemptionQr() {
      const url = await QRCode.toDataURL(`localpunch:redeem:${cardId}`, {
        errorCorrectionLevel: 'H',
        width: 300,
        margin: 2,
        color: { dark: '#1a1a1a', light: '#FFFFFF' },
      })
      setQrUrl(url)
    }
    generateRedemptionQr()
  }, [cardId])

  async function handleRedeem() {
    setRedeeming(true)
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId }),
    })
    const data = await res.json()
    setRedeeming(false)
    if (res.ok) {
      toast.success('Reward redeemed! Enjoy 🎉')
      router.push('/')
      router.refresh()
    } else {
      toast.error(data.error ?? 'Redemption failed')
    }
  }

  return (
    <div className="space-y-3">
      {!showQr ? (
        <button
          onClick={() => setShowQr(true)}
          className="nb-btn-primary w-full font-semibold py-3 text-sm"
        >
          Show QR to redeem reward
        </button>
      ) : (
        <div className="nb-card-flat p-5 text-center space-y-4">
          <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Show this to the cashier
          </p>
          {qrUrl && (
            <img src={qrUrl} alt="Redemption QR" className="mx-auto w-48 h-48 rounded-lg border-2 border-[#1a1a1a]" />
          )}
          <button
            onClick={handleRedeem}
            disabled={redeeming}
            className="nb-btn-dark w-full font-semibold py-3 text-sm disabled:opacity-50"
          >
            {redeeming ? 'Confirming…' : 'Confirm redemption'}
          </button>
          <button onClick={() => setShowQr(false)} className="text-xs text-[#6B7280]">Cancel</button>
        </div>
      )}
    </div>
  )
}
