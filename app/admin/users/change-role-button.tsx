'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/types'

const ROLES: UserRole[] = ['customer', 'merchant', 'admin']

export default function ChangeRoleButton({ userId, currentRole }: { userId: string; currentRole: UserRole }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function changeRole(newRole: UserRole) {
    if (newRole === currentRole) return
    if (!confirm(`Change role to ${newRole}?`)) return
    setLoading(true)
    const res = await fetch('/api/admin/change-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role: newRole }),
    })
    setLoading(false)
    if (res.ok) { toast.success('Role updated'); router.refresh() }
    else { toast.error('Failed to update role') }
  }

  return (
    <select
      value={currentRole}
      onChange={e => changeRole(e.target.value as UserRole)}
      disabled={loading}
      className="text-xs border-2 border-[#1a1a1a] rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566] disabled:opacity-50"
    >
      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}
