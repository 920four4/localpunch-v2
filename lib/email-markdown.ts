/**
 * Markdown → inline-styled HTML for branded Resend emails (auth template styles).
 */

import { ctaButton, emailStyles } from '@/lib/email-layout'

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, `<strong style="${emailStyles.strong}">$1</strong>`)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      `<a href="$2" target="_blank" style="${emailStyles.link}">$1</a>`
    )
}

function paragraph(text: string, last = false): string {
  const style = last ? emailStyles.pLast : emailStyles.p
  return `<p style="${style}">${inlineFormat(text)}</` + `p>`
}

/**
 * Convert email body markdown to HTML inside the white card (below h1).
 */
export function markdownToEmailBody(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let listItems: string[] | null = null
  let listOrdered = false

  function flushList() {
    if (!listItems?.length) {
      listItems = null
      return
    }
    const tag = listOrdered ? 'ol' : 'ul'
    const style = listOrdered ? emailStyles.ol : emailStyles.ul
    const items = listItems
      .map(
        (item) =>
          `<li style="${emailStyles.li}">${inlineFormat(item)}</` + `li>`
      )
      .join('')
    out.push(`<${tag} style="${style}">${items}</` + `${tag}>`)
    listItems = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushList()
      continue
    }

    if (line.startsWith('### ')) {
      flushList()
      out.push(
        `<p style="${emailStyles.h3}">${inlineFormat(line.slice(4))}</` + `p>`
      )
      continue
    }

    const linkOnly = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkOnly) {
      flushList()
      const label = linkOnly[1].replace(/\s*→\s*$/, '').trim()
      out.push(ctaButton(linkOnly[2], label))
      continue
    }

    if (line.startsWith('- ')) {
      if (!listItems) {
        listItems = []
        listOrdered = false
      }
      listItems.push(line.slice(2))
      continue
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      if (!listItems) {
        listItems = []
        listOrdered = true
      }
      listItems.push(numbered[1])
      continue
    }

    flushList()
    const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim())
    const isLast =
      !nextNonEmpty &&
      !lines.slice(i + 1).some((l) => l.trim().startsWith('- '))
    out.push(paragraph(line, isLast))
  }

  flushList()
  return out.join('\n')
}
