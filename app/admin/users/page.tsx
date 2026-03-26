import { createClient } from '@/lib/supabase/server'
import ChangeRoleButton from './change-role-button'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, role, phone, marketing_consent, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header text-2xl">Users</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{profiles?.length ?? 0} total</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#1a1a1a]">
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider">User</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider">Role</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Marketing</th>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p: any) => (
              <tr key={p.id} className="border-b border-[#E5E7EB] hover:bg-white">
                <td className="py-3 px-3">
                  <p className="font-medium">{p.display_name ?? '—'}</p>
                  {p.phone && <p className="text-xs text-[#6B7280]">{p.phone}</p>}
                </td>
                <td className="py-3 px-3 text-center">
                  <RoleBadge role={p.role} />
                </td>
                <td className="py-3 px-3 text-center hidden lg:table-cell">
                  {p.marketing_consent ? '✓' : '—'}
                </td>
                <td className="py-3 px-3 text-[#6B7280] text-xs hidden lg:table-cell">
                  {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </td>
                <td className="py-3 px-3 text-right">
                  <ChangeRoleButton userId={p.id} currentRole={p.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-[#1a1a1a] text-white',
    merchant: 'bg-[#FFE566] text-[#1a1a1a] border border-[#1a1a1a]',
    customer: 'bg-[#F4F4F0] text-[#6B7280] border border-[#E5E7EB]',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[role] ?? styles.customer}`}>
      {role}
    </span>
  )
}
