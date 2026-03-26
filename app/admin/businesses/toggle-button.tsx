'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ToggleBusinessButton({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const res = await fetch('/api/admin/toggle-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(isActive ? 'Business deactivated' : 'Business activated')
      router.refresh()
    } else {
      toast.error('Failed to update')
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded border-2 border-[#1a1a1a] font-medium transition-all disabled:opacity-50 ${
        isActive
          ? 'bg-white hover:bg-[#FF6B6B] hover:text-white'
          : 'bg-[#FFE566] hover:bg-[#A8E6CF]'
      }`}
      style={{ boxShadow: '2px 2px 0 #1a1a1a' }}
    >
      {loading ? '…' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  )
}
