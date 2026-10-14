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

Base URL: `https://www.localpunchcard.io`

### `POST /api/admin/blog`
Create a new post.

```json
{
  "title": "How to set up a loyalty program for your taqueria",
  "slug": "taqueria-loyalty-setup",
  "excerpt": "A plain-English guide...",
  "content": "# Markdown content…",
  "tags": ["taqueria", "loyalty"],
  "cover_image_url": "https://cdn.example.com/taqueria-cover.jpg",
  "cover_image_alt": "Counter of a taqueria with a stamped punch card",
  "faq": [
    {
      "question": "Do customers need an app?",
      "answer": "No. They scan a QR code in the mobile browser."
    }
  ],
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

curl -X POST https://www.localpunchcard.io/api/admin/blog \
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
const res = await fetch('https://www.localpunchcard.io/api/admin/blog', {
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
- `cover_image_url`: optional, must be a valid URL. Empty string is stored as `null`.
- `cover_image_alt`: optional, ≤300 characters. Describes the cover for screen readers and `og:image`.
- `faq`: optional, ≤20 `{ "question", "answer" }` pairs. Question 1–300 chars, answer 1–5000 chars. Empty array is stored as `null`.
- `content`: required, markdown (GFM supported — tables, fenced code, lists)

## Cover image

`cover_image_url` and `cover_image_alt` are both optional. Existing posts that omit them keep working.

When `cover_image_url` is set, the image is:

- rendered at the top of `/blog/:slug` (alt text is `cover_image_alt`, or the post title when alt is omitted)
- rendered on the `/blog` index card
- used as the only `og:image` and Twitter card image, with the same alt text (`cover_image_alt`, or the SEO title)

Posts without a cover do not get a cover-specific image tag.

## FAQ

A post can supply FAQ pairs in two ways. The post page emits [FAQPage](https://schema.org/FAQPage) JSON-LD when at least one pair resolves. Posts with no FAQ do not get that script.

1. **API field** — `faq` on create or update. These pairs are stored, shown in a visible FAQ section on the post, and used for the JSON-LD. A stored list replaces a trailing FAQ section in the markdown so the visible questions and the schema match.
2. **Trailing markdown section** — when `faq` is omitted or empty, the renderer looks for a final heading titled `FAQ`, `FAQs`, or `Frequently Asked Questions`. Nothing except that section's questions may follow it. Questions are either:
   - a deeper heading (`### Do customers need an app?`) plus the paragraphs under it, or
   - a bold line of its own that ends with `?`

```md
## FAQ

**Do customers need an app?**
No. They scan a QR code in the mobile browser.

**How much does it cost?**
$60 a month, or $600 a year.
```

A `## FAQ` that is followed by another section (for example `## Bottom line`) is not treated as the FAQ, so older posts that only mention FAQ in passing are left alone.

## Post lifecycle

- `draft` — hidden from public, visible in admin
- `published` — live on `/blog` and `/blog/:slug`, in sitemap, in `llms.txt`
- `archived` — hidden from public and sitemap, preserved for history

## SEO metadata auto-wired

Every published post automatically gets:

- `<title>` and `<meta description>` (with `seo_title` / `seo_description` overrides)
- `<link rel="canonical">`
- OpenGraph tags (`og:title`, `og:description`, `og:image` from `cover_image_url` when set, `og:type=article`)
- Twitter card tags (same cover image)
- `Article` JSON-LD schema
- `FAQPage` JSON-LD when the post has FAQ pairs (API field or a trailing FAQ section)
- Sitemap entry at `/sitemap.xml`
- Reference in `/llms.txt`

No additional work needed per post.
