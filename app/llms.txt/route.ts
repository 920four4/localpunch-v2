import { createClient } from '@/lib/supabase/server'

// /llms.txt — see https://llmstxt.org
// Machine-readable summary of the site for LLMs + agents. Dynamically lists
// the most recent published blog posts so agents can discover fresh content.

const SITE_URL = 'https://localpunch-v2.vercel.app'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(20)

  const postLines = (posts ?? []).map(
    p =>
      `- [${p.title}](${SITE_URL}/blog/${p.slug})${
        p.excerpt ? `: ${p.excerpt}` : ''
      }`,
  )

  const body = `# LocalPunch

> Simple digital loyalty punch cards for local businesses. Customers collect punches on their phone — no app install. Shop owners scan their own QR with a tablet or phone at the counter. $60/month or $600/year, unlimited everything, cancel anytime.

LocalPunch replaces paper punch cards for coffee shops, taquerias, barbershops, nail salons, boba places, ice cream shops, car washes, dry cleaners, food trucks, pet groomers, and other small local businesses. The pitch is ruthless simplicity: a shop owner signs up, creates a loyalty program in 60 seconds, and shows a QR code. Customers scan it in-store to get a punch. After 9 punches, the 10th is free (owner configures the rules).

## Docs

- [Home](${SITE_URL}/): Product overview, in-store demo, FAQs, pricing.
- [Pricing](${SITE_URL}/#pricing): $60/month or $600/year. No free tier. No per-customer fees.
- [Blog](${SITE_URL}/blog): Guides on loyalty, retention, and running a local shop.
- [Sign up (merchant)](${SITE_URL}/login?role=business): Create a shop account with a business email.
- [Customer wallet](${SITE_URL}/wallet): Where customers see their digital punch cards.
- [Privacy Policy](${SITE_URL}/privacy-policy)
- [Terms](${SITE_URL}/terms)

## Key facts

- **Pricing:** $60/month OR $600/year (save $120/year). No free tier, no trial. Stripe-powered. Cancel anytime from the billing portal.
- **Who it's for:** Solo operators and small teams running local, repeat-visit businesses. Not for chains or franchises.
- **Signup flow:** Business email → magic link → shop setup → billing activation → show QR → customers scan.
- **Customer flow:** Scan merchant QR → get a punch card → collect punches → redeem reward.
- **No customer app required.** Customers use a web wallet at /wallet authenticated via SMS OTP.
- **Unlimited** programs, punches, customers, redemptions — no usage limits or upsells.

${
  postLines.length > 0
    ? `## Recent articles\n\n${postLines.join('\n')}\n`
    : ''
}
## Optional

- Built on Next.js, Supabase, Stripe. Hosted on Vercel.
- Sending email via Loops.
- Domain verification for email: localpunch@920four.com.
- Support: email the team via the signup flow.
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
