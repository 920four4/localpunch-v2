// File-level checks for the Nov 17 preview fixture. No network, no DB.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url)
const dir = new URL('./content/blog-draft-fixtures/stop-punch-card-cheating/', root)

function text(rel) {
  return readFileSync(new URL(rel, dir), 'utf8')
}

function sha(rel) {
  const bytes = readFileSync(new URL(rel, root))
  return createHash('sha256').update(bytes).digest('hex')
}

function pngSize(rel) {
  const bytes = readFileSync(new URL(rel, root))
  const ihdr = bytes.indexOf(Buffer.from('IHDR'))
  if (ihdr < 0) throw new Error(`No IHDR in ${rel}`)
  return {
    width: bytes.readUInt32BE(ihdr + 4),
    height: bytes.readUInt32BE(ihdr + 8),
  }
}

const meta = JSON.parse(text('meta.json'))
const faq = JSON.parse(text('faq.json'))
const jsonld = JSON.parse(text('jsonld.json'))
const alt = text('alt.txt').trim()
const body = text('post.md')
if (!body.startsWith('Most punch card cheating comes from three gaps:')) {
  throw new Error('post.md opening sentence drifted')
}

const expectedBody = '80af0e93236914f2011bc1b4702e8e5918faf43861bcdca21ddb29cdcc846bab'
if (sha('content/blog-draft-fixtures/stop-punch-card-cheating/post.md') !== expectedBody) {
  throw new Error('post.md body hash drifted')
}
if (meta.body_sha256 !== expectedBody) throw new Error('meta.json body_sha256 mismatch')
if (meta.slug !== 'stop-punch-card-cheating') throw new Error('slug drifted')
if (meta.title_tag !== 'How to Stop Punch Card Cheating Without Annoying Your Regulars') {
  throw new Error('title tag drifted')
}
if (meta.h1 !== 'How to Stop People Cheating Your Punch Card') throw new Error('h1 drifted')
if (
  meta.meta_description !==
  "Paper stamps are easy to copy. Here's how small shops stop fake punches, screenshot scans and double-dipping, with a simple checklist that doesn't punish regulars."
) {
  throw new Error('meta description drifted')
}
if (meta.canonical !== 'https://www.localpunchcard.io/blog/stop-punch-card-cheating') {
  throw new Error('canonical drifted')
}

const altExpected = `Cover: ${meta.cover_alt}\nShare: ${meta.share_alt}`
if (alt !== altExpected) throw new Error('alt.txt does not match meta.json')

const faqPage = jsonld.find(entry => entry['@type'] === 'FAQPage')
const posting = jsonld.find(entry => entry['@type'] === 'BlogPosting')
if (!faqPage || !posting) throw new Error('jsonld missing BlogPosting or FAQPage')
if (posting.headline !== meta.h1) throw new Error('BlogPosting headline drifted')
if (posting.description !== meta.meta_description) throw new Error('BlogPosting description drifted')
if (posting.url !== meta.canonical) throw new Error('BlogPosting url drifted')
if (faqPage.mainEntity.length !== faq.length) throw new Error('FAQ count mismatch')
faq.forEach((item, i) => {
  const entity = faqPage.mainEntity[i]
  if (entity.name !== item.question || entity.acceptedAnswer.text !== item.answer) {
    throw new Error(`FAQ ${i} does not match faq.json`)
  }
})

const cover = pngSize('public/images/blog/stop-punch-card-cheating/cover.png')
const share = pngSize('public/images/blog/stop-punch-card-cheating/share.png')
if (cover.width !== 1600 || cover.height !== 900) throw new Error(`cover is ${cover.width}x${cover.height}`)
if (share.width !== 1200 || share.height !== 630) throw new Error(`share is ${share.width}x${share.height}`)

const forbidden = ['source.md', 'inkwell-notes-removed.md', 'STATUS.md', 'preview.html', 'review.pdf', 'body.html']
for (const name of forbidden) {
  try {
    readFileSync(new URL(name, dir))
    throw new Error(`forbidden file committed: ${name}`)
  } catch (error) {
    if (error && error.code !== 'ENOENT') throw error
  }
}

const untouched = [
  'app/sitemap.ts',
  'app/blog/page.tsx',
  'app/llms.txt/route.ts',
  'app/robots.ts',
]
for (const rel of untouched) {
  const source = readFileSync(new URL(rel, root), 'utf8')
  if (source.includes('stop-punch-card-cheating') || source.includes('blog-preview-fixture')) {
    throw new Error(`${rel} references the preview fixture`)
  }
}

const page = readFileSync(new URL('app/blog/[slug]/page.tsx', root), 'utf8')
if (!page.includes('getPreviewDraftFixture')) throw new Error('post route does not load the fixture')
const guard = readFileSync(new URL('lib/blog-preview-guard.ts', root), 'utf8')
if (!guard.includes("env === 'preview'")) throw new Error('fixture gate is not VERCEL_ENV=preview')

console.log('preview fixture packaging ok')
console.log(JSON.stringify({ slug: meta.slug, title: meta.title_tag, cover, share }, null, 2))
