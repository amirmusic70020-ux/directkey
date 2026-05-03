import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-white">Direct<span className="text-[#C9A96E]">Key</span></Link>
          <Link href="/" className="text-white/40 text-sm hover:text-white transition">← Back</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: January 2026</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Acceptance of Terms</h2>
            <p>By creating a DirectKey account, you agree to these Terms of Service. If you do not agree, do not use our services.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. Services</h2>
            <p>DirectKey provides an AI-powered sales agent (SARA) for real estate agencies. SARA communicates with your clients via WhatsApp, qualifies leads, and updates your CRM. The service is provided on a monthly subscription basis.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to use the service only for lawful real estate sales and marketing activities. You are responsible for ensuring your clients consent to receiving automated messages.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Payment</h2>
            <p>Subscription fees are billed monthly. Payments are processed securely via Stripe. Subscriptions auto-renew unless cancelled before the renewal date. No refunds for partial months.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. WhatsApp Compliance</h2>
            <p>By using SARA, you agree to comply with Meta WhatsApp Business Policies. DirectKey is not responsible for any account suspensions resulting from violations of WhatsApp's terms of service.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Limitation of Liability</h2>
            <p>DirectKey provides SARA as a sales assistance tool. We do not guarantee any specific sales results. Our liability is limited to the amount paid in the last 30 days of service.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Termination</h2>
            <p>You may cancel your subscription at any time from your dashboard. We reserve the right to suspend accounts that violate these terms.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">8. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:info@directkey.app" className="text-[#C9A96E] hover:underline">info@directkey.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
