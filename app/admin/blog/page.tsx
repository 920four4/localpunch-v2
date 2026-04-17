import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import type { BlogPost } from '@/lib/blog'

export const dynamic = 'force-dynamic'

function badge(status: BlogPost['status']) {
  const color =
    status === 'published'
      ? 'bg-[#A8E6CF] text-[#1a1a1a]'
      : status === 'draft'
      ? 'bg-[#FFE566] text-[#1a1a1a]'
      : 'bg-[#E5E7EB] text-[#6B7280]'
  return (
    <span
      className={`inline-flex text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${color}`}
    >
      {status}
    </span>
  )
}

export default async function AdminBlogPage() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200)

  const posts = (data ?? []) as BlogPost[]
  const published = posts.filter(p => p.status === 'published').length
  const drafts = posts.filter(p => p.status === 'draft').length

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="page-header text-2xl">Blog</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {published} published · {drafts} drafts · {posts.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/blog"
            target="_blank"
            className="nb-btn-ghost text-xs px-4 py-2"
          >
            View public blog ↗
          </Link>
          <Link
            href="/admin/blog/new"
            className="bg-[#1a1a1a] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-black transition"
          >
            + New post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="nb-card-flat p-10 text-center">
          <div className="text-4xl mb-3">✏️</div>
          <h2
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            No posts yet
          </h2>
          <p className="text-sm text-[#6B7280] mt-1 mb-5">
            Write your first post. It&rsquo;ll show up on /blog once you hit
            publish.
          </p>
          <Link
            href="/admin/blog/new"
            className="inline-block bg-[#1a1a1a] text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-black transition"
          >
            + New post
          </Link>
        </div>
      ) : (
        <div className="nb-card-flat overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F4F0] text-xs uppercase tracking-wider text-[#6B7280]">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Published</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr
                  key={p.id}
                  className="border-t border-[#E5E7EB] hover:bg-[#FAFAF8]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-[#9CA3AF] font-mono">
                      /blog/{p.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">{badge(p.status)}</td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      Edit
                    </Link>
                    {p.status === 'published' && (
                      <>
                        {' · '}
                        <Link
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          className="text-sm text-[#6B7280] hover:underline"
                        >
                          View
                        </Link>
                      </>
                    )}
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
