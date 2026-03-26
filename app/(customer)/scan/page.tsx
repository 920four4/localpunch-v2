'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { PunchResult } from '@/lib/types'

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<PunchResult | null>(null)
  const router = useRouter()
  const scannerRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    let mounted = true

    async function startScanner() {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (processing || !mounted) return
            setProcessing(true)
            await scanner.stop()

            await handlePunch(decodedText)
          },
          () => {}
        )
        if (mounted) setScanning(true)
      } catch (err) {
        console.error('Camera error:', err)
        toast.error('Could not access camera. Please allow camera permission.')
      }
    }

    startScanner()

    return () => {
      mounted = false
      try { scannerRef.current?.stop() } catch { /* ignore */ }
    }
  }, [])

  async function handlePunch(token: string) {
    try {
      const res = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json() as PunchResult & { error?: string }

      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Something went wrong')
        setProcessing(false)
        // Restart scanner
        scannerRef.current = null
        setScanning(false)
        setTimeout(() => window.location.reload(), 1500)
        return
      }

      setResult(data)
    } catch {
      toast.error('Network error. Please try again.')
      setProcessing(false)
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <div className={`w-20 h-20 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-3xl ${result.is_complete ? 'bg-[#A8E6CF]' : 'bg-[#FFE566]'}`}
          style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
          {result.is_complete ? '🎉' : '✓'}
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            {result.is_complete ? 'Card Complete!' : 'Punch Collected!'}
          </h2>
          <p className="text-[#6B7280] text-sm mt-1">{result.message}</p>
        </div>
        {!result.is_complete && (
          <div className="flex gap-2 mt-2">
            {Array.from({ length: result.punches_required }).map((_, i) => (
              <div key={i} className={`stamp-slot w-8 h-8 text-xs ${i < result.punch_count ? 'filled' : ''}`}>
                {i < result.punch_count ? '✓' : ''}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => router.push('/')}
            className="nb-btn-ghost text-sm px-5 py-2.5"
          >
            View cards
          </button>
          {result.is_complete && (
            <button
              onClick={() => router.push('/')}
              className="nb-btn-primary text-sm px-5 py-2.5 font-semibold"
            >
              Redeem reward →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-header text-2xl">Scan QR Code</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Point your camera at the business QR code.</p>
      </div>

      <div className="nb-card-flat overflow-hidden">
        <div id="qr-reader" className="w-full aspect-square bg-[#1a1a1a]" />
        {!scanning && !processing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm">Starting camera…</p>
          </div>
        )}
      </div>

      {processing && (
        <div className="text-center py-4">
          <div className="inline-block w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280] mt-2">Recording punch…</p>
        </div>
      )}

      <p className="text-xs text-center text-[#6B7280]">
        QR codes are valid for 5 minutes and can only be used once per day.
      </p>
    </div>
  )
}
