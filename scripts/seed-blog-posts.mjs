#!/usr/bin/env node
// Seeds initial blog posts directly via the Supabase Management API.
// Run once after the blog migration lands.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/seed-blog-posts.mjs

import fs from 'node:fs'

const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF || 'qomtxvkytwaycyhlmtql'

if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}

function readingTime(md) {
  const words = md.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 225))
}

function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL'
  return `'${String(str).replace(/'/g, "''")}'`
}

function sqlArray(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::TEXT[]"
  return `ARRAY[${arr.map(t => sqlEscape(t)).join(',')}]::TEXT[]`
}

const posts = [
  {
    slug: 'coffee-shop-loyalty-program-setup',
    title: 'How to set up a loyalty program for your coffee shop in 10 minutes',
    excerpt:
      'A practical, plain-English walkthrough to launch a working loyalty program for your coffee shop today — without an app, without a POS upgrade, without a marketing agency.',
    author_name: 'LocalPunch Team',
    tags: ['coffee-shop', 'loyalty', 'guides'],
    seo_title:
      'How to Set Up a Loyalty Program for Your Coffee Shop in 10 Minutes (2026)',
    seo_description:
      'A practical, plain-English walkthrough to launch a working loyalty program for your coffee shop today — no app, no POS upgrade, no agency.',
    content: fs.readFileSync(
      new URL('./blog-seeds/coffee-shop-loyalty-program-setup.md', import.meta.url),
      'utf8',
    ),
  },
  {
    slug: 'digital-punch-cards-vs-paper',
    title:
      'Digital punch cards vs paper: which actually keeps regulars coming back?',
    excerpt:
      'Paper cards work, kind of. Digital cards work better — but not for the reasons most blogs claim. Here is the honest breakdown.',
    author_name: 'LocalPunch Team',
    tags: ['loyalty', 'comparison', 'guides'],
    seo_title: 'Digital Punch Cards vs Paper: Honest Comparison for Small Shops',
    seo_description:
      'An honest side-by-side of paper punch cards vs digital: what actually changes for your regulars, your staff, and your bottom line.',
    content: fs.readFileSync(
      new URL('./blog-seeds/digital-punch-cards-vs-paper.md', import.meta.url),
      'utf8',
    ),
  },
]

const values = posts
  .map(p => {
    const rt = readingTime(p.content)
    return `(${[
      sqlEscape(p.slug),
      sqlEscape(p.title),
      sqlEscape(p.excerpt),
      sqlEscape(p.content),
      sqlArray(p.tags),
      sqlEscape(p.author_name),
      sqlEscape('published'),
      'NOW()',
      sqlEscape(p.seo_title),
      sqlEscape(p.seo_description),
      rt,
    ].join(', ')})`
  })
  .join(',\n  ')

const query = `
INSERT INTO blog_posts
  (slug, title, excerpt, content, tags, author_name, status, published_at, seo_title, seo_description, reading_time_minutes)
VALUES
  ${values}
ON CONFLICT (slug) DO UPDATE SET
  title                = EXCLUDED.title,
  excerpt              = EXCLUDED.excerpt,
  content              = EXCLUDED.content,
  tags                 = EXCLUDED.tags,
  author_name          = EXCLUDED.author_name,
  status               = EXCLUDED.status,
  published_at         = COALESCE(blog_posts.published_at, EXCLUDED.published_at),
  seo_title            = EXCLUDED.seo_title,
  seo_description      = EXCLUDED.seo_description,
  reading_time_minutes = EXCLUDED.reading_time_minutes,
  updated_at           = NOW()
RETURNING slug, title, status, published_at;
`

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  },
)

const status = res.status
const text = await res.text()
console.log('status:', status)
console.log('body:', text.slice(0, 800))
if (!res.ok) process.exit(1)
console.log(`\nSeeded ${posts.length} posts ✅`)
