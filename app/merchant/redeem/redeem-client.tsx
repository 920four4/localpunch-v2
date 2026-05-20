'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics/client'
import { AnalyticsEvents } from '@/lib/analytics/events'
import { toast } from 'sonner'
import { extractRedeemToken } from '@/lib/qr/tokens'

type RedeemResult = {
  success: true
  customer_name: string
  program_name: string
  reward: string | null
  business_name: string
}

type LookupCard = {
  card_id: string
  program_name: string
  reward: string | null
  business_name: string
}

type Tab = 'scan' | 'lookup'

export default function RedeemClient() {
  const [tab, setTab] = useState<Tab>('scan')
  const [result, setResult] = useState<RedeemResult | null>(null)

  function handleRedeemed(r: RedeemResult) {
    trackEvent(AnalyticsEvents.REDEEM_COMPLETED, {
      business_name: r.business_name,
      program_name: r.program_name,
      redeem_tab: tab,
    })
    setResult(r)
  }

  if (result) {
    return (
      <Success
        result={result}
        onNext={() => setResult(null)}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex p-1 bg-[#F4F4F0] border border-[#E5E7EB] rounded-full">
        {(['scan', 'lookup'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
              tab === t
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#6B7280] hover:text-[#1a1a1a]'
            }`}
          >
            {t === 'scan' ? 'Scan QR' : 'By phone / email'}
          </button>
        ))}
      </div>

      {tab === 'scan' ? (
        <ScanTab onRedeemed={handleRedeemed} />
      ) : (
        <LookupTab onRedeemed={handleRedeemed} />
      )}

      <details className="nb-card-flat p-4 text-sm text-[#6B7280]">
        <summary className="cursor-pointer font-semibold text-[#1a1a1a]">
          Which one do I use?
        </summary>
        <div className="mt-3 space-y-2">
          <p>
            <strong className="text-[#1a1a1a]">Scan QR (default).</strong>{' '}
            Customer opens their completed card and shows the QR. Fastest.
          </p>
          <p>
            <strong className="text-[#1a1a1a]">By phone / email.</strong> Their
            phone is dead or the QR won’t scan. Look them up, then confirm on
            the spot — or text them a one-tap link.
          </p>
        </div>
      </details>
    </div>
  )
}

// ───────────────────────────────────────────────── scan tab

function ScanTab({ onRedeemed }: { onRedeemed: (r: RedeemResult) => void }) {
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)
  const busyRef = useRef(false)

  const submitToken = useCallback(
    async (scanned: string) => {
      const token = extractRedeemToken(scanned)
      try {
        const res = await fetch('/api/merchant/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error ?? 'Could not redeem')
          setProcessing(false)
          busyRef.current = false
          setTimeout(() => window.location.reload(), 1800)
          return
        }
        onRedeemed(data as RedeemResult)
      } catch {
        toast.error('Network error — try again.')
        setProcessing(false)
        busyRef.current = false
      }
    },
    [onRedeemed],
  )

  useEffect(() => {
    let mounted = true
    async function start() {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('redeem-reader')
      scannerRef.current = scanner
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async decoded => {
            if (busyRef.current || !mounted) return
            busyRef.current = true
            setProcessing(true)
            await scanner.stop().catch(() => {})
            await submitToken(decoded)
          },
          () => {},
        )
        if (mounted) setScanning(true)
      } catch (err) {
        console.error('Camera error:', err)
        toast.error('Could not access camera. Allow camera permission.')
      }
    }
    start()
    return () => {
      mounted = false
      scannerRef.current?.stop().catch(() => {})
    }
  }, [submitToken])

  return (
    <div className="space-y-4">
      <div className="nb-card-flat overflow-hidden relative">
        <div id="redeem-reader" className="w-full aspect-square bg-[#1a1a1a]" />
        {!scanning && !processing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm">Starting camera…</p>
          </div>
        )}
      </div>
      {processing && (
        <div className="text-center py-2">
          <div className="inline-block w-7 h-7 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280] mt-2">Redeeming…</p>
        </div>
      )}
      <p className="text-xs text-center text-[#6B7280]">
        Ask the customer to open their completed card and show the reward QR.
      </p>
    </div>
  )
}

// ───────────────────────────────────────────────── lookup tab

function LookupTab({ onRedeemed }: { onRedeemed: (r: RedeemResult) => void }) {
  const [mode, setMode] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [cards, setCards] = useState<LookupCard[]>([])

  function formatPhone(raw: string) {
    const d = raw.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return d
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }

  async function search(e: React.FormEvent) {
    e.preventDefault()
    const body: Record<string, string> = {}
    if (mode === 'phone') {
      if (phone.replace(/\D/g, '').length < 10) {
        toast.error('Enter a valid 10-digit number')
        return
      }
      body.phone = `+1${phone.replace(/\D/g, '')}`
    } else {
      if (!email.includes('@')) {
        toast.error('Enter a valid email')
        return
      }
      body.email = email.trim().toLowerCase()
    }
    setLoading(true)
    setSearched(false)
    try {
      const res = await fetch('/api/merchant/redeem-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        toast.error(data.error ?? 'Lookup failed')
        return
      }
      setSearched(true)
      setCustomerName(data.customer?.display_name ?? '')
      setCards(data.cards ?? [])
    } catch {
      setLoading(false)
      toast.error('Network issue — try again.')
    }
  }

  const phoneE164 =
    mode === 'phone' ? `+1${phone.replace(/\D/g, '')}` : undefined

  return (
    <div className="space-y-4">
      <form onSubmit={search} className="nb-card-flat p-5 space-y-4 bg-white">
        <div className="flex p-1 bg-[#F4F4F0] border border-[#E5E7EB] rounded-full">
          {(['phone', 'email'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                mode === m
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#6B7280] hover:text-[#1a1a1a]'
              }`}
            >
              {m === 'phone' ? 'Phone number' : 'Email'}
            </button>
          ))}
        </div>

        {mode === 'phone' ? (
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border-2 border-r-0 border-[#1a1a1a] bg-[#FAFAF8] text-sm text-[#6B7280] font-mono">
              +1
            </span>
            <input
              type="tel"
              required
              autoFocus
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              placeholder="(555) 000-0000"
              className="flex-1 border-2 border-[#1a1a1a] rounded-r-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
            />
          </div>
        ) : (
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="dave@example.com"
            className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
        >
          {loading ? 'Searching…' : 'Find rewards →'}
        </button>
      </form>

      {searched && cards.length === 0 && (
        <div className="nb-card-flat p-6 text-center bg-white">
          <div className="text-3xl mb-2">🤷</div>
          <p className="text-sm text-[#6B7280]">
            No completed rewards for this customer at your shop.
          </p>
        </div>
      )}

      {cards.map(card => (
        <RedeemableCard
          key={card.card_id}
          card={card}
          customerName={customerName}
          phone={phoneE164}
          onRedeemed={onRedeemed}
        />
      ))}
    </div>
  )
}

function RedeemableCard({
  card,
  customerName,
  phone,
  onRedeemed,
}: {
  card: LookupCard
  customerName: string
  phone?: string
  onRedeemed: (r: RedeemResult) => void
}) {
  const [busy, setBusy] = useState(false)
  const [sms, setSms] = useState<'idle' | 'sent' | 'waiting'>('idle')
  const sentAtRef = useRef<string | null>(null)

  async function confirmNow() {
    setBusy(true)
    try {
      const res = await fetch('/api/merchant/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.card_id }),
      })
      const data = await res.json()
      setBusy(false)
      if (!res.ok) {
        toast.error(data.error ?? 'Could not redeem')
        return
      }
      onRedeemed(data as RedeemResult)
    } catch {
      setBusy(false)
      toast.error('Network issue — try again.')
    }
  }

  async function textLink() {
    if (!phone) {
      toast.error('Switch to phone-number lookup to text a link.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/merchant/redeem-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.card_id, phone }),
      })
      const data = await res.json()
      setBusy(false)
      if (!res.ok) {
        toast.error(data.message ?? data.error ?? 'Could not send text')
        return
      }
      sentAtRef.current = new Date(Date.now() - 1000).toISOString()
      setSms('waiting')
      toast.success('Confirm link texted — waiting for the customer to tap it.')
    } catch {
      setBusy(false)
      toast.error('Network issue — try again.')
    }
  }

  // Poll for the customer tapping the SMS link.
  useEffect(() => {
    if (sms !== 'waiting') return
    const iv = setInterval(async () => {
      const since = sentAtRef.current
        ? `&since=${encodeURIComponent(sentAtRef.current)}`
        : ''
      try {
        const res = await fetch(
          `/api/merchant/redeem-status?card_id=${card.card_id}${since}`,
        )
        const data = await res.json()
        if (res.ok && data.redeemed) {
          clearInterval(iv)
          onRedeemed({
            success: true,
            customer_name: customerName,
            program_name: card.program_name,
            reward: card.reward,
            business_name: card.business_name,
          })
        }
      } catch {
        /* keep polling */
      }
    }, 2500)
    const stop = setTimeout(() => {
      clearInterval(iv)
      setSms('idle')
    }, 120000)
    return () => {
      clearInterval(iv)
      clearTimeout(stop)
    }
  }, [sms, card, customerName, onRedeemed])

  return (
    <div className="nb-card-flat p-5 bg-white space-y-3">
      <div>
        <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
          {customerName}
        </p>
        <p
          className="font-semibold"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {card.program_name}
        </p>
        {card.reward && (
          <p className="text-sm text-[#6B7280]">🎁 {card.reward}</p>
        )}
      </div>

      {sms === 'waiting' ? (
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
          Waiting for the customer to tap the texted link…
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={confirmNow}
            disabled={busy}
            className="flex-1 bg-[#1a1a1a] text-white rounded-full py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-black transition"
          >
            {busy ? 'Working…' : 'Confirm now'}
          </button>
          <button
            onClick={textLink}
            disabled={busy || !phone}
            title={!phone ? 'Phone-number lookup only' : undefined}
            className="flex-1 nb-btn-ghost text-sm py-2.5 disabled:opacity-40"
          >
            Text confirm link
          </button>
        </div>
      )}
    </div>
  )
}

// ───────────────────────────────────────────────── success

function Success({
  result,
  onNext,
}: {
  result: RedeemResult
  onNext: () => void
}) {
  return (
    <div className="nb-card-flat p-8 space-y-5 bg-[#A8E6CF] text-center">
      <div
        className="w-16 h-16 mx-auto rounded-full border-2 border-[#1a1a1a] flex items-center justify-center text-3xl bg-white"
        style={{ boxShadow: '3px 3px 0 #1a1a1a' }}
      >
        🎉
      </div>
      <div>
        <p
          className="font-bold text-lg"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Reward redeemed
        </p>
        <p className="text-sm text-[#1a1a1a]/80 mt-1">
          {result.customer_name} · {result.reward ?? result.program_name}
        </p>
        <p className="text-xs text-[#1a1a1a]/60 mt-1">
          Their card has reset — they can start earning again.
        </p>
      </div>
      <button
        onClick={onNext}
        className="w-full bg-[#1a1a1a] text-white rounded-full py-3 text-sm font-semibold hover:bg-black transition"
      >
        Redeem another →
      </button>
    </div>
  )
}
