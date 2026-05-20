import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeBlogAdmin } from '@/lib/blog-auth'

const schema = z.object({
  topic: z.string().min(10).max(500),
  audience: z.string().max(200).optional(),
  keywords: z.array(z.string()).max(8).optional(),
  tone: z.enum(['educational', 'comparison', 'story']).optional(),
})

const MODEL =
  process.env.ANTHROPIC_BLOG_MODEL ?? 'claude-opus-4-20250514'

export async function POST(request: NextRequest) {
  const auth = await authorizeBlogAdmin(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'ANTHROPIC_API_KEY is not set. Add it to Vercel env vars to generate posts with Claude.',
      },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { topic, audience, keywords, tone } = parsed.data

  const system = `You are a senior content writer for LocalPunch (localpunchcard.io), a digital punch card loyalty platform for small local businesses ($60/mo flat, no customer app download).

Write in a warm, human, plain-English voice — like a helpful shop owner friend, not a VC blog.
- Use markdown (GFM): one H1, H2 sections, bullets, occasional tables
- 900–1300 words
- Be honest; mention trade-offs
- Include 2–3 internal link placeholders as markdown links to paths like /pricing, /for/coffee-shops, /login?role=business
- End with a soft CTA to try LocalPunch
- No hype words: "revolutionary", "game-changer", "leverage"
- Educational and specific with realistic examples`

  const userPrompt = `Write a blog post about: ${topic}
Audience: ${audience ?? 'independent local business owners (coffee, taqueria, barber, boba)'}
Tone: ${tone ?? 'educational'}
Target SEO keywords (use naturally): ${(keywords ?? []).join(', ') || 'digital punch card, loyalty program small business'}

Return ONLY valid JSON with keys:
title, excerpt (max 300 chars), slug (kebab-case), tags (string array), seo_title, seo_description, content (full markdown body without frontmatter)`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Anthropic error:', errText)
    return NextResponse.json(
      { error: 'AI generation failed', detail: errText.slice(0, 200) },
      { status: 502 },
    )
  }

  const data = (await res.json()) as {
    content: { type: string; text: string }[]
  }
  const text = data.content?.find(c => c.type === 'text')?.text ?? ''

  let draft: Record<string, unknown>
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    draft = JSON.parse(jsonMatch?.[0] ?? text) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: 'Could not parse AI response as JSON', raw: text.slice(0, 500) },
      { status: 502 },
    )
  }

  return NextResponse.json({ draft, model: MODEL })
}
