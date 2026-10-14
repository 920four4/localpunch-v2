import assert from 'node:assert/strict'
import test from 'node:test'
import {
  faqPageJsonLd,
  parseTrailingFaq,
  resolvePostFaq,
  stripTrailingFaq,
} from './blog-faq'

const LIVE_POST = `
The short version is a free drink.

**[Build your punch card free →](https://www.localpunchcard.io/)** You only pay when you go live.

## FAQ

**What's a good punch card reward?**
A free version of your most popular item or service.

**Discount or free item?**
Usually a free item. It feels more generous, and your real cost is lower than an equal cash discount.

**Can I change the reward later?**
Yes, but tell your regulars first. Changing the deal halfway through someone's card is the fastest way to lose their trust.
`

test('parses the trailing bold FAQ used by existing posts', () => {
  const pairs = parseTrailingFaq(LIVE_POST)
  assert.deepEqual(
    pairs.map(pair => pair.question),
    [
      "What's a good punch card reward?",
      'Discount or free item?',
      'Can I change the reward later?',
    ],
  )
  assert.equal(
    pairs[0].answer,
    'A free version of your most popular item or service.',
  )
  assert.match(pairs[2].answer, /tell your regulars first/)
})

test('parses heading questions and frequently-asked-questions titles', () => {
  const pairs = parseTrailingFaq(`
## Setup

Do this first.

## Frequently Asked Questions

### Do customers need an app?
No. They scan a QR code.

### How much does it cost?
$60 a month or [$600 a year](/pricing).
`)
  assert.equal(pairs.length, 2)
  assert.equal(pairs[0].question, 'Do customers need an app?')
  assert.equal(pairs[1].answer, '$60 a month or $600 a year.')
})

test('ignores an FAQ section that is not trailing', () => {
  const pairs = parseTrailingFaq(`
## FAQ

**Is this the end?**
No.

## Bottom line

Keep going.
`)
  assert.deepEqual(pairs, [])
})

test('ignores an FAQ heading that only appears inside a code fence', () => {
  const pairs = parseTrailingFaq(`
\`\`\`md
## FAQ

**Is this real?**
No.
\`\`\`

## Notes

No public FAQ here.
`)
  assert.deepEqual(pairs, [])
})

test('uses the last real FAQ heading, not one inside a fence', () => {
  const pairs = parseTrailingFaq(`
\`\`\`md
## FAQ
**Ignored?**
Yes.
\`\`\`

## FAQ

**Is this parsed?**
Yes.
`)
  assert.deepEqual(pairs, [{ question: 'Is this parsed?', answer: 'Yes.' }])
})

test('leaves posts without an FAQ section unchanged', () => {
  const markdown = '## Why loyalty works\n\nRegulars come back.'
  assert.deepEqual(parseTrailingFaq(markdown), [])
  assert.equal(stripTrailingFaq(markdown), markdown)
})

test('strips only the trailing FAQ section', () => {
  const stripped = stripTrailingFaq(LIVE_POST)
  assert.match(stripped, /Build your punch card free/)
  assert.doesNotMatch(stripped, /## FAQ/)
  assert.doesNotMatch(stripped, /Can I change the reward later/)
})

test('API faq field wins over a trailing section', () => {
  const resolved = resolvePostFaq(LIVE_POST, [
    { question: 'Do I need an iPad?', answer: 'No. A phone browser is enough.' },
  ])
  assert.equal(resolved.fromField, true)
  assert.equal(resolved.pairs.length, 1)
  assert.equal(resolved.pairs[0].question, 'Do I need an iPad?')
})

test('empty faq field falls back to the trailing section', () => {
  const resolved = resolvePostFaq(LIVE_POST, [])
  assert.equal(resolved.fromField, false)
  assert.equal(resolved.pairs.length, 3)
})

test('builds FAQPage JSON-LD only when there are pairs', () => {
  assert.equal(faqPageJsonLd([]), null)
  const ld = faqPageJsonLd([
    { question: 'Do customers need an app?', answer: 'No.' },
  ])
  assert.equal(ld?.['@type'], 'FAQPage')
  assert.deepEqual(ld?.mainEntity, [
    {
      '@type': 'Question',
      name: 'Do customers need an app?',
      acceptedAnswer: { '@type': 'Answer', text: 'No.' },
    },
  ])
})
