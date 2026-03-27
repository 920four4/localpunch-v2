import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LocalPunch',
}

export default function PrivacyPolicy() {
  const updated = 'March 26, 2026'

  return (
    <article className="prose prose-sm max-w-none" style={{ fontFamily: 'var(--font-dm-sans)' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Privacy Policy
        </h1>
        <p className="text-[#6B7280] text-sm">Last updated: {updated}</p>
      </div>

      <Section title="1. Who We Are">
        <p>
          LocalPunch ("we," "us," or "our") operates a digital punch card loyalty platform that
          connects local businesses with their customers. Our service is available at{' '}
          <strong>localpunch-v2.vercel.app</strong> and any associated mobile applications.
        </p>
        <p>
          For questions about this policy, contact us at:{' '}
          <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a>
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <h3 className="font-semibold mt-4 mb-2">Information you provide directly</h3>
        <ul>
          <li><strong>Phone number</strong> — used to create your customer account and send one-time verification codes via SMS.</li>
          <li><strong>Email address</strong> — used by business owners and administrators to create and manage accounts.</li>
          <li><strong>Display name</strong> — optional name you provide during account setup.</li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">Information generated through your use of the service</h3>
        <ul>
          <li><strong>Punch and redemption records</strong> — each time a punch card is stamped or a reward is redeemed, we record the timestamp, business, and program.</li>
          <li><strong>QR code scan events</strong> — we store a hashed token to prevent duplicate punches; raw QR tokens are not retained.</li>
          <li><strong>Account activity</strong> — sign-in timestamps and session data managed by Supabase Auth.</li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">Information we do not collect</h3>
        <ul>
          <li>We do not collect payment information.</li>
          <li>We do not track your location.</li>
          <li>We do not use advertising trackers or third-party analytics pixels.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul>
          <li><strong>Authentication</strong> — to verify your identity when you sign in using a one-time SMS code or email magic link.</li>
          <li><strong>Loyalty tracking</strong> — to record punches, display your punch cards, and unlock rewards.</li>
          <li><strong>Business operations</strong> — to give merchants visibility into their loyalty programs (aggregated usage, not individual customer profiles).</li>
          <li><strong>Service communications</strong> — we may send you transactional SMS messages for authentication. We do not send marketing SMS.</li>
          <li><strong>Security</strong> — to detect and prevent fraud, replay attacks, and abuse of the QR code system.</li>
        </ul>
      </Section>

      <Section title="4. SMS Messaging">
        <p>
          When you sign in as a customer using your phone number, LocalPunch uses Twilio to send a
          one-time verification code via SMS. By providing your phone number and requesting a code,
          you consent to receive that single transactional SMS message.
        </p>
        <ul>
          <li><strong>Message frequency:</strong> One message per sign-in attempt. We do not send recurring marketing messages.</li>
          <li><strong>Message and data rates may apply</strong> depending on your mobile carrier plan.</li>
          <li><strong>To opt out:</strong> Reply <strong>STOP</strong> to any message to stop receiving SMS from LocalPunch.</li>
          <li><strong>For help:</strong> Reply <strong>HELP</strong> or email <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a>.</li>
          <li>We do not share your phone number with third parties for marketing purposes.</li>
        </ul>
      </Section>

      <Section title="5. How We Share Your Information">
        <p>We do not sell your personal information. We share data only in these limited cases:</p>
        <ul>
          <li><strong>Service providers</strong> — Supabase (database and authentication infrastructure), Twilio (SMS delivery), and Vercel (hosting). Each is bound by their own privacy and data processing agreements.</li>
          <li><strong>Merchants</strong> — when you collect punches at a business, that merchant can see aggregated usage data for their program. They do not see your phone number or email address.</li>
          <li><strong>Legal requirements</strong> — we may disclose information if required by law or to protect the rights and safety of our users.</li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We retain your account and punch card data for as long as your account is active. If you
          request deletion of your account, we will remove your personal information within 30 days,
          except where retention is required by law.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt out of SMS communications at any time by replying <strong>STOP</strong></li>
        </ul>
        <p>
          To exercise any of these rights, email us at{' '}
          <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a>.
        </p>
      </Section>

      <Section title="8. Security">
        <p>
          We use industry-standard security practices including encrypted connections (HTTPS), hashed
          QR tokens, row-level security on our database, and time-limited authentication tokens. No
          method of transmission over the internet is 100% secure; we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          LocalPunch is not directed to children under 13. We do not knowingly collect personal
          information from children under 13. If you believe we have inadvertently collected such
          information, please contact us and we will delete it promptly.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify users of material
          changes by updating the "Last updated" date at the top of this page. Continued use of the
          service after changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          LocalPunch<br />
          Email: <a href="mailto:hello@localpunch.app" className="underline">hello@localpunch.app</a>
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
