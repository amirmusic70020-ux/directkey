import Link from 'next/link';
import { Bot, MessageSquare, Zap, Globe, Clock, TrendingUp, CheckCircle, ArrowRight, Star, Phone } from 'lucide-react';
import PricingSection from '@/components/PricingSection';

function WhatsAppDemo() {
  const messages = [
    { from: 'user', text: "Hi, I saw your listing on Bayut. Is it still available?" },
    { from: 'sara', text: "Hello! Yes, the Palm Jumeirah 2BR is still available. Are you looking to buy or rent?" },
    { from: 'user', text: "Buy. What's the price?" },
    { from: 'sara', text: "It's listed at AED 3.2M — a great deal for this location. What's your budget range?" },
    { from: 'user', text: "Around 3M to 3.5M" },
    { from: 'sara', text: "Perfect! You qualify for 3 properties in that range. Want me to book a viewing this weekend?" },
  ];
  return (
    <div className="relative">
      <div className="bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm mx-auto">
        <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">SARA - AI Agent</p>
            <p className="text-green-400 text-xs">Online</p>
          </div>
        </div>
        <div className="px-3 py-4 space-y-2 bg-[#0b141a]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                m.from === 'user' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-gray-100 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <div className="bg-[#202c33] px-3 py-2 rounded-lg rounded-tl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
        SARA is typing...
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
            <Bot size={16} className="text-amber-400" />
          </div>
          <span className="font-bold text-navy-900 text-lg">DirectKey</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 font-medium">
          <a href="#features" className="hover:text-navy-900 transition">Features</a>
          <a href="#how" className="hover:text-navy-900 transition">How it works</a>
          <a href="#pricing" className="hover:text-navy-900 transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-navy-900 font-medium transition">Sign in</Link>
          <Link href="/register" className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            Start free trial
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative bg-navy-950 overflow-hidden pt-28 pb-20">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-950" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-semibold mb-6">
              <Zap size={12} />
              AI-powered real estate sales agent
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Your AI sales agent<br />
              <span className="text-amber-400">that never sleeps</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg">
              SARA qualifies leads, answers questions, and books viewings automatically on WhatsApp, in any language, 24/7. More deals, less admin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold px-6 py-3.5 rounded-xl transition flex items-center gap-2 text-sm">
                Start free trial - 14 days
                <ArrowRight size={16} />
              </Link>
              <a href="/en" className="border border-white/20 hover:border-white/40 text-white px-6 py-3.5 rounded-xl transition text-sm font-medium">
                See live demo
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-4">No credit card required. Setup in 5 minutes.</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <WhatsAppDemo />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: '18x', label: 'Average ROI' },
    { value: '24/7', label: 'Always available' },
    { value: '<10s', label: 'Response time' },
    { value: '6', label: 'Languages supported' },
  ];
  return (
    <section className="bg-navy-900 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold text-amber-400">{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustedBy() {
  const agencies = [
    'Emlak Konut GYO',
    'Torunlar GYO',
    'Rönesans Gayrimenkul',
    'Sur Yapı',
    'Folkart',
    'Sinpaş GYO',
    'RE/MAX Turkey',
    'Century 21',
    'Coldwell Banker',
    'ERA Turkey',
    'Kiptaş',
    'Metropol İstanbul',
    'Bayut Partners',
    'Property Finder Pro',
    'Azizi Developments',
  ];

  // Duplicate for seamless loop
  const items = [...agencies, ...agencies];

  return (
    <section className="bg-white py-10 border-b border-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-6 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Trusted by real estate agencies worldwide
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-4 w-max"
          style={{
            animation: 'ticker-scroll 30s linear infinite',
          }}
        >
          {items.map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm font-medium text-navy-800 whitespace-nowrap hover:bg-navy-50 hover:border-navy-200 transition"
            >
              <span className="text-amber-500">🏢</span>
              {name}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function Features() {
  const features = [
    { icon: MessageSquare, title: 'Instant WhatsApp responses', description: 'SARA replies to every lead within seconds, day or night, so you never miss an opportunity.' },
    { icon: TrendingUp, title: 'Smart lead qualification', description: 'Automatically scores leads by budget, timeline, and intent. Only hot leads reach your desk.' },
    { icon: Globe, title: 'Multilingual by default', description: 'English, Arabic, Russian, French, Urdu, Hindi. SARA detects language and responds naturally.' },
    { icon: Clock, title: '24/7 availability', description: 'While you sleep, SARA handles inquiries, answers FAQs, and books viewings automatically.' },
    { icon: Star, title: 'Property matching', description: 'SARA learns your listings and matches each lead to the properties that fit their needs.' },
    { icon: Phone, title: 'Human handoff', description: 'When a lead is ready to close, SARA escalates seamlessly to your best agent.' },
  ];
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-navy-900 mb-3">Everything your sales team needs, automated</h2>
          <p className="text-gray-500 max-w-xl mx-auto">SARA handles the entire top of your sales funnel, so your agents focus on closing.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition">
              <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon size={20} className="text-navy-700" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { step: '01', title: 'Connect your WhatsApp', description: 'Link your business WhatsApp number to SARA in under 5 minutes. No coding required.' },
    { step: '02', title: 'Add your listings', description: 'Upload your properties or connect your CRM. SARA learns your portfolio and pricing.' },
    { step: '03', title: 'Watch leads convert', description: 'SARA qualifies every inquiry, books viewings, and sends you a daily performance report.' },
  ];
  return (
    <section id="how" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-navy-900 mb-3">Up and running in minutes</h2>
          <p className="text-gray-500 max-w-lg mx-auto">No technical setup. No developers needed. Just plug in and let SARA work.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="w-16 h-16 rounded-2xl bg-navy-900 flex items-center justify-center mb-5">
                <span className="text-amber-400 font-extrabold text-lg">{s.step}</span>
              </div>
              <h3 className="font-semibold text-navy-900 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 bg-navy-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #C9A96E 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">Ready to 18x your lead conversion?</h2>
        <p className="text-gray-400 mb-8 text-lg">Join real estate agencies across UAE using SARA to automate their sales pipeline.</p>
        <Link href="/register" className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold px-8 py-4 rounded-xl transition inline-flex items-center gap-2">
          Start free 14-day trial
          <ArrowRight size={18} />
        </Link>
        <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500 flex-wrap">
          {['No credit card required', 'Setup in 5 minutes', 'Cancel anytime'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-400" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/10 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-400/10 rounded-lg flex items-center justify-center">
            <Bot size={14} className="text-amber-400" />
          </div>
          <span className="text-white font-bold text-sm">DirectKey</span>
        </div>
        <p className="text-gray-600 text-xs">2025 DirectKey. All rights reserved.</p>
        <div className="flex items-center gap-5 text-xs text-gray-500">
          <Link href="/privacy" className="hover:text-gray-300 transition">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-300 transition">Terms</Link>
          <Link href="/login" className="hover:text-gray-300 transition">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <div id="pricing">
        <PricingSection />
      </div>
      <CTA />
      <Footer />
    </>
  );
}
