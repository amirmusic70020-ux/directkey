import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-white">Direct<span className="text-[#C9A96E]">Key</span></Link>
          <Link href="/" className="text-white/40 text-sm hover:text-white transition">← Back</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: January 2026</p>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-xl mb-3">1. Information We Collect</h2>
            <p>DirectKey collects information you provide directly, including agency name, email address, phone number, and property listings. We also collect data from WhatsApp conversations handled by SARA on behalf of your agency — including lead contact details, conversation transcripts, and CRM data.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide and improve our services, send transactional emails, process payments, and enable SARA to respond to your clients on WhatsApp. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">3. Data Storage</h2>
            <p>Your agency data and lead information is stored securely in Airtable. WhatsApp message processing is handled via the Meta WhatsApp Business API. AI responses are powered by Anthropic Claude API. All providers maintain industry-standard security practices.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">4. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Lead conversation data is retained for 24 months by default. You may request deletion of your data at any time by contacting us at info@directkey.app.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at info@directkey.app. We will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>
          </section>
          <section>
            <h2 className="text-white font-bold text-xl mb-3">7. Contact</h2>
            <p>For any privacy-related questions, contact us at <a href="mailto:info@directkey.app" className="text-[#C9A96E] hover:underline">info@directkey.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
