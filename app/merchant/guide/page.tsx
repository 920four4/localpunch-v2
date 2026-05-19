import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Setup guide — LocalPunch',
}

export default function MerchantGuidePage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link
          href="/merchant"
          className="text-sm text-[#6B7280] hover:text-[#1a1a1a]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="page-header text-2xl mt-3">The 2-minute guide</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Everything you and your customers actually do. No jargon. If you can
          send a text message, you can run this.
        </p>
      </div>

      {/* The four steps */}
      <Section title="Getting set up (you do this once)">
        <ol className="space-y-3">
          <Step n="1" title="Create your shop">
            Your business name is already saved. That&rsquo;s the name customers
            see on their punch card.
          </Step>
          <Step n="2" title="Create your reward">
            Tell LocalPunch what customers earn &mdash; for example,{' '}
            <em>“Buy 10 coffees, get one free.”</em> You choose how many punches
            it takes (1&ndash;100) and what the reward is. Building this is free.
          </Step>
          <Step n="3" title="Go live">
            Turn the shop on so customers can start collecting. This is the only
            step that costs anything &mdash; $60/month or $600/year, cancel
            anytime. Until you do this, customers can&rsquo;t join yet.
          </Step>
          <Step n="4" title="Put your QR code on the counter">
            We make a QR code for you. Keep it open on a phone or tablet, or
            print it and tape it by the register. That&rsquo;s your whole
            “setup.”
          </Step>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/merchant/programs/new" className="nb-btn-primary text-sm font-semibold px-4 py-2">
            Create a reward →
          </Link>
          <Link href="/merchant/billing" className="nb-btn-ghost text-sm font-medium px-4 py-2">
            Go live
          </Link>
        </div>
      </Section>

      {/* Day to day */}
      <Section title="How a customer joins">
        <p>
          A customer points their phone camera at your QR code and taps the
          link. They enter their phone number once, and a punch card opens right
          in their browser. <strong>No app to download.</strong> Most people
          save it to their home screen so it&rsquo;s one tap next time.
        </p>
        <Callout>
          New customers join themselves by scanning. You don&rsquo;t have to
          sign anyone up or enter anything.
        </Callout>
      </Section>

      <Section title="How to give a punch">
        <p>There are two ways, and both take about two seconds:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>They scan your QR</strong> &mdash; the punch lands on their
            card automatically. This is the normal way.
          </li>
          <li>
            <strong>Quick Punch by phone number</strong> &mdash; if their phone
            is dead or they forgot it, open{' '}
            <Link
              href="/merchant/punch"
              className="underline underline-offset-2 hover:bg-[#FFE566]"
            >
              Quick Punch
            </Link>
            , type their number, and tap once. The punch shows up the next time
            they open their card.
          </li>
        </ul>
        <Callout>
          A customer can only earn one punch per visit (you set the wait time
          when you create the reward), so the same QR can&rsquo;t be farmed. The
          QR also refreshes every 5 minutes, so a screenshot is useless.
        </Callout>
      </Section>

      <Section title="When a customer earns the reward">
        <p>
          Once their card is full, a <strong>Redeem</strong> button appears on
          their phone. They show you, you confirm it from your{' '}
          <Link
            href="/merchant/redeem"
            className="underline underline-offset-2 hover:bg-[#FFE566]"
          >
            Redeem
          </Link>{' '}
          screen, and the card resets so they can start earning again. Give them
          the reward &mdash; that&rsquo;s the whole point.
        </p>
      </Section>

      <Section title="Telling your staff">
        <p>
          Anyone working the counter only needs to know one thing:{' '}
          <strong>
            point customers at the QR code; if their phone&rsquo;s dead, use
            Quick Punch.
          </strong>{' '}
          There&rsquo;s nothing to log into per-person and nothing to break.
        </p>
      </Section>

      <Section title="Billing &amp; cancelling">
        <p>
          You&rsquo;re billed through Stripe &mdash; secure, and you never hand
          your card details to us. To change plans, update your card, or cancel,
          open the billing portal from{' '}
          <Link
            href="/merchant/billing"
            className="underline underline-offset-2 hover:bg-[#FFE566]"
          >
            Billing
          </Link>
          . Cancel anytime, no contract, no phone call.
        </p>
      </Section>

      <Section title="Still stuck?">
        <p>
          Email a real person at{' '}
          <a
            href="mailto:support@localpunchcard.io"
            className="underline underline-offset-2 hover:bg-[#FFE566]"
          >
            support@localpunchcard.io
          </a>{' '}
          &mdash; we&rsquo;d genuinely rather help than have you give up on it.
        </p>
      </Section>

      <div className="nb-card-flat p-5 bg-[#FFE566] flex flex-col sm:flex-row sm:items-center gap-3">
        <p
          className="flex-1 font-bold text-sm"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Ready? Pick up where you left off.
        </p>
        <Link
          href="/merchant"
          className="bg-[#1a1a1a] text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-black transition whitespace-nowrap text-center"
        >
          Back to setup →
        </Link>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="nb-card-flat p-6">
      <h2
        className="font-bold text-lg mb-3"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {title}
      </h2>
      <div className="text-sm text-[#4B5563] leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FFE566] border-2 border-[#1a1a1a] text-xs font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {n}
      </span>
      <div>
        <p
          className="font-semibold text-[#1a1a1a]"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </p>
        <p className="text-sm text-[#4B5563] leading-relaxed mt-0.5">
          {children}
        </p>
      </div>
    </li>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 border-l-4 border-[#FFE566] bg-[#FFE566]/10 pl-4 py-2 text-sm text-[#4B5563]">
      {children}
    </div>
  )
}
