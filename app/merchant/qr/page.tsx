'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { TTL_SECONDS } from '@/lib/qr/tokens'

interface QrData {
  qr_data_url: string
  expires_at: string
  ttl_seconds: number
}

type ShopState =
  | { status: 'loading' }
  | { status: 'no_business' }
  | { status: 'inactive' }
  | { status: 'active'; programs: { id: string; name: string }[] }

export default function QrDisplayPage() {
  const [shop, setShop] = useState<ShopState>({ status: 'loading' })
  const [selectedProgram, setSelectedProgram] = useState('')
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: business } = await supabase
        .from('businesses')
        .select('id, is_active')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (!business) {
        setShop({ status: 'no_business' })
        return
      }
      if (!business.is_active) {
        setShop({ status: 'inactive' })
        return
      }
      const { data } = await supabase
        .from('loyalty_programs')
        .select('id, name')
        .eq('business_id', business.id)
        .eq('is_active', true)
      const programs = data ?? []
      setShop({ status: 'active', programs })
      if (programs.length > 0) setSelectedProgram(programs[0].id)
    }
    load()
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
      if (!res.ok) {
        if (res.status === 402) {
          setShop({ status: 'inactive' })
          return
        }
        toast.error(data.message || data.error || 'Failed to generate QR code')
        return
      }
      setQrData(data)
      setSecondsLeft(data.ttl_seconds)
    } catch {
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedProgram) fetchQrToken(selectedProgram)
  }, [selectedProgram, fetchQrToken])

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

  if (shop.status === 'loading') {
    return (
      <div className="space-y-5">
        <PageHeader />
        <div className="nb-card-flat p-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (shop.status === 'no_business') {
    return (
      <div className="space-y-5">
        <PageHeader />
        <LockedCard
          title="Finish setting up your shop"
          body="Add your shop details before generating a QR code."
          ctaHref="/merchant/setup"
          ctaLabel="Complete setup →"
        />
      </div>
    )
  }

  if (shop.status === 'inactive') {
    return (
      <div className="space-y-5">
        <PageHeader />
        <LockedCard
          title="🔒 Activate your shop to show a QR code"
          body="Customers can only collect punches once your subscription is active. $60/month or $600/year — cancel anytime."
          ctaHref="/merchant/billing"
          ctaLabel="Activate now →"
        />
      </div>
    )
  }

  const programs = shop.programs

  if (programs.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader />
        <LockedCard
          title="Create a loyalty program first"
          body="You need at least one active program to generate a QR code for it."
          ctaHref="/merchant/programs/new"
          ctaLabel="Create a program →"
        />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader />

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

function PageHeader() {
  return (
    <div>
      <h1 className="page-header text-2xl">QR Code Display</h1>
      <p className="text-sm text-[#6B7280] mt-0.5">Keep this open on your counter or tablet. Auto-refreshes every 5 minutes.</p>
    </div>
  )
}

function LockedCard({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string
  body: string
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <div className="nb-card-flat p-8 flex flex-col items-center text-center gap-5">
      <div className="w-20 h-20 rounded-xl bg-[#FFE566] border-2 border-[#1a1a1a] flex items-center justify-center text-4xl">
        📱
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </h2>
        <p className="text-sm text-[#6B7280]">{body}</p>
      </div>
      <Link
        href={ctaHref}
        className="bg-[#1a1a1a] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-black transition"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
