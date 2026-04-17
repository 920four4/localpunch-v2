import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import PostEditor from '../post-editor'
import type { BlogPost } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!data) notFound()
  return <PostEditor mode="edit" post={data as BlogPost} />
}
