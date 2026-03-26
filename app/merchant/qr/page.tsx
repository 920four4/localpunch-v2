'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { TTL_SECONDS } from '@/lib/qr/tokens'

interface QrData {
  qr_data_url: string
  expires_at: string
  ttl_seconds: number
}

export default function QrDisplayPage() {
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadPrograms() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user!.id).single()
      if (!business) return
      const { data } = await supabase.from('loyalty_programs').select('id, name').eq('business_id', business.id).eq('is_active', true)
      if (data) {
        setPrograms(data)
        if (data.length > 0) setSelectedProgram(data[0].id)
      }
    }
    loadPrograms()
  }, [])

  const fetchQrToken = useCallback(async (programId: string) => {
    if (!programId) return
    setLoading(true)
    try {
      const res = await fetch('/api/qr-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: programId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setQrData(data)
      setSecondsLeft(data.ttl_seconds)
    } catch {
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on program select
  useEffect(() => {
    if (selectedProgram) fetchQrToken(selectedProgram)
  }, [selectedProgram, fetchQrToken])

  // Countdown timer + auto-refresh
  useEffect(() => {
    if (!qrData) return
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          fetchQrToken(selectedProgram)
          return TTL_SECONDS
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [qrData, selectedProgram, fetchQrToken])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const pct = (secondsLeft / TTL_SECONDS) * 100

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-header text-2xl">QR Code Display</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Keep this open on your counter or tablet. Auto-refreshes every 5 minutes.</p>
      </div>

      {programs.length > 1 && (
        <div className="nb-card-flat p-4">
          <label className="text-sm font-medium block mb-2">Select program</label>
          <select
            value={selectedProgram}
            onChange={e => setSelectedProgram(e.target.value)}
            className="border-2 border-[#1a1a1a] rounded-lg px-3 py-2 text-sm bg-white w-full focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
          >
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div className="nb-card-flat p-6 flex flex-col items-center gap-5">
        {loading ? (
          <div className="w-64 h-64 bg-[#F4F4F0] rounded-lg flex items-center justify-center border-2 border-[#1a1a1a]">
            <div className="w-10 h-10 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : qrData ? (
          <img
            src={qrData.qr_data_url}
            alt="Loyalty QR Code"
            className="w-64 h-64 rounded-lg border-2 border-[#1a1a1a]"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="w-64 h-64 bg-[#F4F4F0] rounded-lg flex items-center justify-center border-2 border-[#1a1a1a]">
            <p className="text-sm text-[#6B7280]">No program selected</p>
          </div>
        )}

        {/* Countdown */}
        {qrData && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
              <span>Refreshes in</span>
              <span className="font-mono font-medium text-[#1a1a1a]">{mins}:{secs.toString().padStart(2, '0')}</span>
            </div>
            <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden border border-[#1a1a1a]">
              <div
                className="h-full bg-[#FFE566] transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-center text-[#6B7280] max-w-xs">
          Customers scan this with the LocalPunch app to collect a punch. Only valid for 5 minutes.
        </p>

        <button
          onClick={() => fetchQrToken(selectedProgram)}
          disabled={loading || !selectedProgram}
          className="nb-btn-ghost text-xs px-4 py-2"
        >
          Refresh now
        </button>
      </div>
    </div>
  )
}
