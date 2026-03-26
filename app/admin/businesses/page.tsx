import { createAdminClient } from '@/lib/supabase/server'
import ToggleBusinessButton from './toggle-button'

export default async function AdminBusinessesPage() {
  const supabase = await createAdminClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      id, name, slug, address, is_active, created_at,
      profiles(display_name),
      loyalty_programs(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header text-2xl">Businesses</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{businesses?.length ?? 0} total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#1a1a1a]">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider">Business</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Owner</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider">Programs</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(businesses ?? []).map((b: any) => (
              <tr key={b.id} className="border-b border-[#E5E7EB] hover:bg-white">
                <td className="py-3 px-3">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-[#6B7280]">/{b.slug}</p>
                </td>
                <td className="py-3 px-3 text-[#6B7280] hidden lg:table-cell">
                  {b.profiles?.display_name ?? '—'}
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  {b.loyalty_programs?.[0]?.count ?? 0}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                    b.is_active ? 'bg-[#A8E6CF] border-[#1a1a1a]' : 'bg-[#F4F4F0] border-[#E5E7EB] text-[#6B7280]'
                  }`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <ToggleBusinessButton id={b.id} isActive={b.is_active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
