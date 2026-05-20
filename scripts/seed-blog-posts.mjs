#!/usr/bin/env node
// Seeds blog posts via Supabase Management API.
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

function loadSeed(filename) {
  return fs.readFileSync(
    new URL(`./blog-seeds/${filename}`, import.meta.url),
    'utf8',
  )
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
    content: loadSeed('coffee-shop-loyalty-program-setup.md'),
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
    content: loadSeed('digital-punch-cards-vs-paper.md'),
  },
  {
    slug: 'barbershop-loyalty-strategy',
    title: 'The best loyalty strategy for your barbershop (beyond just a punch card)',
    excerpt:
      'Match rewards to the haircut cycle, punch at the chair, and use your customer list on slow days — without overcomplicating loyalty.',
    author_name: 'LocalPunch Team',
    tags: ['barbershop', 'loyalty', 'guides'],
    seo_title: 'Barbershop Loyalty Program Strategy That Actually Works',
    seo_description:
      'Practical barbershop loyalty tips: reward timing, staff training, and texting regulars when chairs are empty.',
    content: loadSeed('barbershop-loyalty-strategy.md'),
  },
  {
    slug: 'localpunch-vs-stamp-me',
    title: 'LocalPunch vs Stamp Me: an honest comparison for small businesses',
    excerpt:
      'No universal winner — just the right fit for your shop size. Pricing, apps, and when each tool makes sense.',
    author_name: 'LocalPunch Team',
    tags: ['comparison', 'stamp-me', 'loyalty'],
    seo_title: 'LocalPunch vs Stamp Me · Honest Small Business Comparison',
    seo_description:
      'Flat $60/mo unlimited vs tiered plans. When LocalPunch wins for single-location shops and when Stamp Me might be better.',
    content: loadSeed('localpunch-vs-stamp-me.md'),
  },
  {
    slug: 'taqueria-repeat-customer-guide',
    title: 'How to turn first-time taqueria visitors into weekly regulars',
    excerpt:
      'Taquerias win on repeat lunch traffic. A simple punch reward, fast line punching, and texts on slow Tuesdays.',
    author_name: 'LocalPunch Team',
    tags: ['taqueria', 'retention', 'guides'],
    seo_title: 'Taqueria Customer Retention Guide · Weekly Regulars',
    seo_description:
      'Turn first-time taqueria visitors into weekly regulars with clear rewards, counter QR, and a contact list you can text.',
    content: loadSeed('taqueria-repeat-customer-guide.md'),
  },
  {
    slug: 'loyalty-program-cost-breakdown',
    title: 'What a small-business loyalty program actually costs in 2026',
    excerpt:
      'Paper, DIY QR, and software tiers — transparent pricing math and the ROI question owners should actually ask.',
    author_name: 'LocalPunch Team',
    tags: ['pricing', 'loyalty', 'guides'],
    seo_title: 'Small Business Loyalty Program Cost Breakdown (2026)',
    seo_description:
      'Honest loyalty program costs: paper vs DIY vs software. Flat $60/mo math and ROI back-of-napkin for local shops.',
    content: loadSeed('loyalty-program-cost-breakdown.md'),
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
console.log('body:', text.slice(0, 1200))
if (!res.ok) process.exit(1)
console.log(`\nSeeded ${posts.length} posts ✅`)
