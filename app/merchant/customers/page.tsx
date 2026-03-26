import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user!.id)
    .single()

  if (!business) return <div className="text-[#6B7280] text-sm p-4">Set up your business first.</div>

  // Get customers who have punched at least once
  const { data: customers } = await supabase
    .from('punch_cards')
    .select(`
      id, punch_count, is_complete, created_at,
      customer:profiles(id, display_name, phone, marketing_consent),
      program:loyalty_programs(id, name, punches_required)
    `)
    .eq('loyalty_programs.business_id', business.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header text-2xl">Customers</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{customers?.length ?? 0} cards issued</p>
        </div>
        <a
          href="/api/customers/export"
          className="nb-btn-ghost text-xs px-3 py-2"
        >
          ↓ Export CSV
        </a>
      </div>

      {!customers?.length ? (
        <div className="nb-card-flat p-8 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm text-[#6B7280]">No customers yet. Share your QR code to get started!</p>
          <Link href="/merchant/qr" className="nb-btn-primary inline-flex mt-3 text-sm">Show QR code</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#1a1a1a]">
                <th className="text-left py-3 px-2 font-semibold text-xs uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-2 font-semibold text-xs uppercase tracking-wider">Program</th>
                <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">Punches</th>
                <th className="text-center py-3 px-2 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-xs uppercase tracking-wider">Since</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} className="border-b border-[#E5E7EB] hover:bg-[#FAFAF8]">
                  <td className="py-3 px-2">
                    <p className="font-medium">{c.customer?.display_name ?? 'Anonymous'}</p>
                    {c.customer?.marketing_consent && c.customer?.phone && (
                      <p className="text-xs text-[#6B7280]">{c.customer.phone}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-[#6B7280]">{c.program?.name}</td>
                  <td className="py-3 px-2 text-center font-mono">
                    {c.punch_count}/{c.program?.punches_required}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {c.is_complete ? (
                      <span className="inline-block text-xs font-bold bg-[#A8E6CF] text-[#1a1a1a] border border-[#1a1a1a] px-2 py-0.5 rounded">Ready</span>
                    ) : (
                      <span className="inline-block text-xs text-[#6B7280] bg-[#F4F4F0] px-2 py-0.5 rounded border border-[#E5E7EB]">Active</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-[#6B7280] text-xs">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
