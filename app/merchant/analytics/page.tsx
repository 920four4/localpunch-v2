'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user!.id).single()
      if (!business) return setLoading(false)
      const { data } = await supabase.from('merchant_program_stats').select('*').eq('business_id', business.id)
      setStats(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-[#6B7280] text-sm">Loading analytics…</div>

  const chartData = stats.map(s => ({
    name: s.program_name.length > 14 ? s.program_name.slice(0, 12) + '…' : s.program_name,
    customers: Number(s.total_customers),
    punches: Number(s.total_punches),
    redemptions: Number(s.total_redemptions),
  }))

  return (
    <div className="space-y-7">
      <div>
        <h1 className="page-header text-2xl">Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Performance across your loyalty programs.</p>
      </div>

      {stats.length === 0 ? (
        <div className="nb-card-flat p-8 text-center">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-sm text-[#6B7280]">No data yet. Create programs and get customers scanning!</p>
        </div>
      ) : (
        <>
          {/* Customers per program */}
          <div className="nb-card-flat p-5">
            <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Customers per program</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="2 4" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 8, boxShadow: '3px 3px 0 #1a1a1a', fontSize: 12 }}
                />
                <Bar dataKey="customers" fill="#FFE566" stroke="#1a1a1a" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Punches vs Redemptions */}
          <div className="nb-card-flat p-5">
            <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Punches vs Redemptions</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="2 4" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 8, boxShadow: '3px 3px 0 #1a1a1a', fontSize: 12 }}
                />
                <Bar dataKey="punches" fill="#A8E6CF" stroke="#1a1a1a" strokeWidth={1.5} radius={[4, 4, 0, 0]} name="Punches" />
                <Bar dataKey="redemptions" fill="#FF6B6B" stroke="#1a1a1a" strokeWidth={1.5} radius={[4, 4, 0, 0]} name="Redemptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Redemption rate table */}
          <div className="nb-card-flat overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Redemption rates</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAF8]">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Program</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Completed</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Redeemed</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s: any) => {
                  const completed = Number(s.completed_cards)
                  const redeemed = Number(s.total_redemptions)
                  const rate = completed > 0 ? Math.round((redeemed / completed) * 100) : 0
                  return (
                    <tr key={s.program_id} className="border-t border-[#E5E7EB]">
                      <td className="px-5 py-3 font-medium">{s.program_name}</td>
                      <td className="px-5 py-3 text-right text-[#6B7280]">{completed}</td>
                      <td className="px-5 py-3 text-right text-[#6B7280]">{redeemed}</td>
                      <td className="px-5 py-3 text-right font-semibold">{rate}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
