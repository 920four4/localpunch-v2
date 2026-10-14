export const FAQ_MAX_ITEMS = 20
export const FAQ_MAX_QUESTION = 300
export const FAQ_MAX_ANSWER = 5000

export type FaqPair = {
  question: string
  answer: string
}

const FAQ_TITLE =
  /^(?:faqs?|frequently asked questions)\s*:?\s*$/i

type Heading = { level: number; title: string }

function headingAt(line: string): Heading | null {
  const match = /^(#{1,6})[ \t]+(.+?)\s*$/.exec(line.trim())
  if (!match) return null
  return {
    level: match[1].length,
    title: match[2].replace(/\s+#+\s*$/, '').trim(),
  }
}

function isFence(line: string): boolean {
  return /^\s*(```|~~~)/.test(line)
}

function linesOf(markdown: string): string[] {
  return markdown.replace(/\r\n/g, '\n').split('\n')
}

/** Collapse markdown to the plain text Google expects in FAQ answers. */
export function faqPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function clipPair(question: string, answer: string): FaqPair | null {
  const q = faqPlainText(question).slice(0, FAQ_MAX_QUESTION).trim()
  const a = faqPlainText(answer).slice(0, FAQ_MAX_ANSWER).trim()
  if (!q || !a) return null
  return { question: q, answer: a }
}

function cap(pairs: FaqPair[]): FaqPair[] {
  return pairs.slice(0, FAQ_MAX_ITEMS)
}

type LocatedFaq = {
  startLine: number
  level: number
  body: string[]
}

/**
 * A trailing FAQ is the last heading titled FAQ / FAQs / Frequently Asked
 * Questions, with nothing after it except questions and answers.
 */
function locateTrailingFaq(markdown: string): LocatedFaq | null {
  const lines = linesOf(markdown)
  let inFence = false
  let startLine = -1
  let level = 0

  for (let i = 0; i < lines.length; i++) {
    if (isFence(lines[i])) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const heading = headingAt(lines[i])
    if (heading && FAQ_TITLE.test(heading.title)) {
      startLine = i
      level = heading.level
    }
  }
  if (startLine < 0) return null

  const body: string[] = []
  inFence = false
  for (let i = startLine + 1; i < lines.length; i++) {
    if (isFence(lines[i])) {
      inFence = !inFence
      body.push(lines[i])
      continue
    }
    if (!inFence) {
      const heading = headingAt(lines[i])
      if (heading) {
        const deeper = heading.level > level
        const sameLevelQuestion =
          heading.level === level && heading.title.endsWith('?')
        if (!deeper && !sameLevelQuestion) return null
      }
    }
    body.push(lines[i])
  }

  if (!body.some(line => line.trim())) return null
  return { startLine, level, body }
}

function parseHeadingPairs(body: string[], faqLevel: number): FaqPair[] {
  const blocks: { question: string; lines: string[] }[] = []
  let current: { question: string; lines: string[] } | null = null
  let inFence = false

  for (const line of body) {
    if (isFence(line)) {
      inFence = !inFence
      if (current) current.lines.push(line)
      continue
    }
    if (!inFence) {
      const heading = headingAt(line)
      if (heading) {
        const isQuestion =
          heading.level > faqLevel ||
          (heading.level === faqLevel && heading.title.endsWith('?'))
        if (isQuestion) {
          if (current) blocks.push(current)
          current = { question: heading.title, lines: [] }
          continue
        }
      }
    }
    if (current) current.lines.push(line)
  }
  if (current) blocks.push(current)

  return blocks.flatMap(block => {
    const pair = clipPair(block.question, block.lines.join('\n'))
    return pair ? [pair] : []
  })
}

function matchBoldQuestion(line: string): { question: string; rest: string } | null {
  const match = /^(?:\*\*|__)(.+?)(?:\*\*|__)\s*(.*)$/.exec(line.trim())
  if (!match) return null
  const question = match[1].trim()
  if (!question.endsWith('?')) return null
  return { question, rest: match[2].trim() }
}

function parseBoldPairs(body: string[]): FaqPair[] {
  const blocks: { question: string; lines: string[] }[] = []
  let current: { question: string; lines: string[] } | null = null
  let inFence = false

  for (const line of body) {
    if (isFence(line)) {
      inFence = !inFence
      continue
    }
    if (!inFence) {
      const question = matchBoldQuestion(line)
      if (question) {
        if (current) blocks.push(current)
        current = {
          question: question.question,
          lines: question.rest ? [question.rest] : [],
        }
        continue
      }
    }
    if (current) current.lines.push(line)
  }
  if (current) blocks.push(current)

  return blocks.flatMap(block => {
    const pair = clipPair(block.question, block.lines.join('\n'))
    return pair ? [pair] : []
  })
}

/** Pairs from a trailing FAQ section, or [] when the post has none. */
export function parseTrailingFaq(markdown: string): FaqPair[] {
  const located = locateTrailingFaq(markdown)
  if (!located) return []
  const fromHeadings = parseHeadingPairs(located.body, located.level)
  if (fromHeadings.length > 0) return cap(fromHeadings)
  return cap(parseBoldPairs(located.body))
}

/** Remove a trailing FAQ section. Content without one is returned unchanged. */
export function stripTrailingFaq(markdown: string): string {
  const lines = linesOf(markdown)
  const located = locateTrailingFaq(markdown)
  if (!located) return markdown
  return lines.slice(0, located.startLine).join('\n').replace(/\s+$/, '')
}

/** Accept stored or API FAQ JSON without throwing on older rows. */
export function coerceFaqPairs(value: unknown): FaqPair[] {
  if (!Array.isArray(value)) return []
  const pairs: FaqPair[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const question =
      typeof record.question === 'string' ? record.question.trim() : ''
    const answer = typeof record.answer === 'string' ? record.answer.trim() : ''
    if (!question || !answer) continue
    pairs.push({
      question: question.slice(0, FAQ_MAX_QUESTION),
      answer: answer.slice(0, FAQ_MAX_ANSWER),
    })
    if (pairs.length === FAQ_MAX_ITEMS) break
  }
  return pairs
}

export function resolvePostFaq(
  content: string,
  faqField: unknown,
): { pairs: FaqPair[]; fromField: boolean } {
  const fromField = coerceFaqPairs(faqField)
  if (fromField.length > 0) return { pairs: fromField, fromField: true }
  return { pairs: parseTrailingFaq(content), fromField: false }
}

export function faqPageJsonLd(
  pairs: FaqPair[],
): Record<string, unknown> | null {
  if (pairs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map(pair => ({
      '@type': 'Question',
      name: pair.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: pair.answer,
      },
    })),
  }
}
