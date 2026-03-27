import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions — LocalPunch',
}

export default function TermsAndConditions() {
  const updated = 'March 26, 2026'

  return (
    <article className="prose prose-sm max-w-none" style={{ fontFamily: 'var(--font-dm-sans)' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Terms & Conditions
        </h1>
        <p className="text-[#6B7280] text-sm">Last updated: {updated}</p>
      </div>

      <Section title="1. About LocalPunch">
        <p>
          LocalPunch is a digital punch card loyalty platform that allows local businesses to create
          and manage loyalty programs, and allows customers to collect digital punches and earn
          rewards. By using LocalPunch, you agree to these Terms & Conditions.
        </p>
        <p>
          Operator: LocalPunch<br />
          Contact: <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a><br />
          Website: <strong>localpunch-v2.vercel.app</strong>
        </p>
      </Section>

      <Section title="2. SMS Messaging Program">
        <p>
          LocalPunch uses SMS messaging solely to send one-time verification codes (OTPs) when you
          sign in using your phone number. By providing your phone number and requesting a code, you
          expressly consent to receive that transactional SMS message from LocalPunch.
        </p>
        <ul>
          <li><strong>Program name:</strong> LocalPunch Authentication</li>
          <li><strong>Program description:</strong> One-time passcode delivery for account sign-in and verification.</li>
          <li><strong>Message frequency:</strong> One (1) message per sign-in request. No recurring messages.</li>
          <li><strong>Message and data rates may apply.</strong> Contact your mobile carrier for details about your plan.</li>
          <li><strong>Supported carriers:</strong> All major US carriers including AT&T, Verizon, T-Mobile, and regional carriers. Carrier support is not guaranteed for all carriers.</li>
        </ul>

        <div className="border-2 border-[#1a1a1a] rounded-lg p-4 bg-[#FAFAF8] mt-4">
          <p className="font-semibold mb-2">How to get help or stop messages:</p>
          <ul>
            <li>Reply <strong>HELP</strong> to any message for assistance, or email <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a></li>
            <li>Reply <strong>STOP</strong> to any message to opt out and stop receiving SMS from LocalPunch</li>
          </ul>
        </div>

        <p className="mt-4">
          We do not share your phone number with third parties for marketing purposes. For full
          details on how we handle your data, see our{' '}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </Section>

      <Section title="3. Eligibility">
        <p>
          You must be at least 13 years old to use LocalPunch. By using the service, you confirm
          that you meet this age requirement. Business accounts are intended for use by adults
          operating legitimate businesses.
        </p>
      </Section>

      <Section title="4. Customer Accounts">
        <p>
          Customers sign in using a verified phone number. You are responsible for maintaining
          access to the phone number associated with your account. Punch cards and rewards are
          tied to your account and cannot be transferred.
        </p>
        <ul>
          <li>Each phone number may only be associated with one customer account.</li>
          <li>Attempting to fraudulently collect punches (e.g., scanning a QR code multiple times, forging codes) may result in account suspension.</li>
          <li>Rewards have no cash value and cannot be exchanged for currency.</li>
        </ul>
      </Section>

      <Section title="5. Merchant Accounts">
        <p>
          Businesses ("merchants") may create loyalty programs through LocalPunch. By creating a
          program, merchants agree to honor the rewards they configure. Merchants are responsible
          for the accuracy of their program details, including punch requirements and reward
          descriptions.
        </p>
        <ul>
          <li>Merchants may not create misleading or deceptive loyalty programs.</li>
          <li>LocalPunch reserves the right to suspend merchant accounts that violate these terms.</li>
          <li>Merchants may export customer participation data in CSV format for their own records.</li>
        </ul>
      </Section>

      <Section title="6. QR Codes and Fraud Prevention">
        <p>
          Merchant QR codes are cryptographically signed and expire after 5 minutes to prevent
          replay attacks. Each code may only be used once. Attempts to forge, duplicate, or
          manipulate QR codes are a violation of these terms and may result in permanent account
          termination.
        </p>
      </Section>

      <Section title="7. Availability and Changes">
        <p>
          LocalPunch is provided "as is." We make no guarantees of uptime or uninterrupted service.
          We reserve the right to modify, suspend, or discontinue any part of the service at any
          time. We will provide reasonable notice of material changes where possible.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, LocalPunch shall not be liable for any
          indirect, incidental, or consequential damages arising from your use of the service,
          including lost rewards, missed punches, or business interruptions.
        </p>
      </Section>

      <Section title="9. Governing Law">
        <p>
          These Terms are governed by the laws of the United States. Any disputes shall be resolved
          through binding arbitration or in the courts of competent jurisdiction.
        </p>
      </Section>

      <Section title="10. Contact Us">
        <p>
          For questions about these Terms & Conditions or our SMS program:<br />
          Email: <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a><br />
          To opt out of SMS: Reply <strong>STOP</strong> to any message
        </p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-3 border-b-2 border-[#1a1a1a] pb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {title}
      </h2>
      <div className="space-y-3 text-[#374151] leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#1a1a1a]">
        {children}
      </div>
    </section>
  )
}
