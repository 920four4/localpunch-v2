# Blog programmatic API

LocalPunch's blog supports writing and publishing posts from scripts, CI, or AI agents — no browser required.

## Auth

Two methods are accepted:

1. **Session cookie** — signed-in admins using the `/admin/blog` UI (automatic).
2. **Bearer token** — for programmatic use. Set `BLOG_API_TOKEN` on the server, pass it as:

   ```
   Authorization: Bearer $BLOG_API_TOKEN
   ```

   The token lives in `.env.local` (dev) and Vercel env vars (prod). Keep it secret.

## Endpoints

Base URL: `https://localpunch-v2.vercel.app`

### `POST /api/admin/blog`
Create a new post.

```json
{
  "title": "How to set up a loyalty program for your taqueria",
  "slug": "taqueria-loyalty-setup",
  "excerpt": "A plain-English guide...",
  "content": "# Markdown content…",
  "tags": ["taqueria", "loyalty"],
  "cover_image_url": "https://...",
  "status": "published",
  "seo_title": "...",
  "seo_description": "..."
}
```

- `slug` auto-derived from `title` if omitted.
- `status` defaults to `draft`. Use `published` to make it live immediately.
- `published_at` auto-stamped when status transitions to `published`.
- `reading_time_minutes` auto-calculated from content.

Returns `201 Created` with the inserted post. `409 Conflict` if slug collides.

### `GET /api/admin/blog?status=draft&limit=50`
List posts. Admin-only (unlike the public `/blog`, this sees drafts).

### `GET /api/admin/blog/:id`
Fetch a single post by id.

### `PATCH /api/admin/blog/:id`
Partial update — send only changed fields.

```json
{ "status": "published" }
```

### `DELETE /api/admin/blog/:id`
Hard delete.

## Examples

### Publish a new post from the terminal

```bash
TOKEN="<BLOG_API_TOKEN>"

curl -X POST https://localpunch-v2.vercel.app/api/admin/blog \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "title": "Why your taqueria should stop stamping paper cards",
  "excerpt": "A quick tour of what digital loyalty actually changes.",
  "content": "# Intro\n\nThe short version is…",
  "tags": ["taqueria", "guides"],
  "status": "published"
}
EOF
```

### Publish from an AI agent (Cursor / Claude Code / scripts)

```ts
const res = await fetch('https://localpunch-v2.vercel.app/api/admin/blog', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.BLOG_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '…',
    content: '…',
    status: 'published',
    tags: ['…'],
  }),
})
const { post } = await res.json()
console.log(post.slug)
```

## Validation limits

- `title`: 1–200 chars
- `slug`: 1–80 chars, auto-kebab-cased (`a-z 0-9 -`)
- `excerpt`: ≤500 chars
- `tags`: ≤12 items
- `cover_image_url`: must be a valid URL
- `content`: required, markdown (GFM supported — tables, fenced code, lists)

## Post lifecycle

- `draft` — hidden from public, visible in admin
- `published` — live on `/blog` and `/blog/:slug`, in sitemap, in `llms.txt`
- `archived` — hidden from public and sitemap, preserved for history

## SEO metadata auto-wired

Every published post automatically gets:

- `<title>` and `<meta description>` (with `seo_title` / `seo_description` overrides)
- `<link rel="canonical">`
- OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:type=article`)
- Twitter card tags
- `Article` JSON-LD schema
- Sitemap entry at `/sitemap.xml`
- Reference in `/llms.txt`

No additional work needed per post.
