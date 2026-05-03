'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import PricingSection from '@/components/PricingSection';

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Animated WhatsApp Chat ───────────────────────────────────────────────────
const MESSAGES = [
  { from: 'user', text: 'Hi, I saw your listing in Istanbul — is it available?' },
  { from: 'sara', text: 'Hello! Yes, it is. Are you looking to buy or invest?' },
  { from: 'user', text: 'Invest. Budget around $200K' },
  { from: 'sara', text: 'I have 3 great options in that range. Want me to send the details?' },
  { from: 'user', text: 'Yes please' },
  { from: 'sara', text: 'Sent! I can also arrange a viewing this week — Thursday work for you? ✓' },
];

function WhatsAppChat() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shown >= MESSAGES.length) return;
    const msg = MESSAGES[shown];
    if (msg.from === 'sara') {
      setTyping(true);
      const t = setTimeout(() => { setTyping(false); setShown(s => s + 1); }, 1400);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShown(s => s + 1), 900);
      return () => clearTimeout(t);
    }
  }, [shown]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, typing]);

  return (
    <div className="relative w-full max-w-[300px] mx-auto select-none">
      <div className="absolute -inset-6 bg-green-500/10 blur-3xl rounded-full" />
      <div className="relative rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/5">
        {/* Status bar */}
        <div className="bg-[#111b21] px-5 pt-3 pb-1 flex items-center justify-between">
          <span className="text-white text-[11px] font-medium">9:41</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
            <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
            <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
          </div>
        </div>
        {/* Header */}
        <div className="bg-[#1f2c33] px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#a07840] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">SARA</p>
            <p className="text-green-400 text-[11px]">● online now</p>
          </div>
        </div>
        {/* Messages */}
        <div ref={chatContainerRef} className="bg-[#0b141a] px-3 py-3 space-y-1.5 h-64 overflow-y-auto scrollbar-none">
          {MESSAGES.slice(0, shown).map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animation: 'popIn 0.25s ease forwards' }}>
              <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${
                m.from === 'user'
                  ? 'bg-[#005c4b] text-white rounded-tr-sm'
                  : 'bg-[#1f2c33] text-gray-100 rounded-tl-sm'
              }`}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start" style={{ animation: 'popIn 0.25s ease forwards' }}>
              <div className="bg-[#1f2c33] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* CRM badge */}
      <div className="absolute -bottom-3 -right-4 bg-white rounded-xl shadow-xl px-3 py-2 flex items-center gap-2 border border-gray-100">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[11px] font-semibold text-gray-700">CRM updated</span>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-white text-lg tracking-tight">Direct<span className="text-[#C9A96E]">Key</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white font-medium transition">Sign in</Link>
          <Link href="/register" className="bg-white hover:bg-white/90 text-black text-sm font-semibold px-4 py-2 rounded-full transition">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen bg-black flex items-center overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#C9A96E]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-white/60 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              AI Sales Agent · WhatsApp · Real Estate
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              The sales agent<br />
              <span className="text-[#C9A96E]">that never<br />sleeps.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-md">
              SARA qualifies every lead, speaks any language, updates your CRM, and books viewings — all on WhatsApp, automatically, 24/7.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="bg-white hover:bg-white/90 text-black font-bold px-7 py-3.5 rounded-full transition flex items-center gap-2 text-sm">
                Start free trial
                <ArrowRight size={15} />
              </Link>
              <a href="#features" className="border border-white/15 hover:border-white/30 text-white/70 hover:text-white px-7 py-3.5 rounded-full transition text-sm font-medium">
                See how it works
              </a>
            </div>
            <p className="text-white/20 text-xs mt-5">No credit card required · Setup in 5 minutes</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <WhatsAppChat />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Languages ────────────────────────────────────────────────────────────────
const LANGS = [
  { code: 'IR', lang: 'Persian',  text: 'سلام، دنبال ملک در استانبول هستم',      reply: 'سلام! برای سکونت یا سرمایه‌گذاری؟', delay: 0 },
  { code: 'SA', lang: 'Arabic',   text: 'مرحبا، ابحث عن شقة للاستثمار',          reply: 'أهلاً! ما هي ميزانيتك التقريبية؟', delay: 100 },
  { code: 'RU', lang: 'Russian',  text: 'Здравствуйте, ищу квартиру в Стамбуле', reply: 'Здравствуйте! Для жилья или инвестиций?', delay: 200 },
  { code: 'US', lang: 'English',  text: 'Hi, looking for a 2BR in Istanbul',      reply: 'Hello! Are you buying to live or invest?', delay: 300 },
  { code: 'TR', lang: 'Turkish',  text: 'Merhaba, Istanbul da daire ariyorum',    reply: 'Merhaba! Oturmak icin mi yoksa yatirim mi?', delay: 400 },
  { code: 'CN', lang: 'Chinese',  text: '您好，我想在伊斯坦布尔买套公寓',            reply: '您好！请问是自住还是投资？', delay: 500 },
];

function Languages() {
  const { ref, visible } = useReveal();
  return (
    <section className="bg-black py-28 border-t border-white/5" id="features">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest mb-4">Multilingual</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
            Your clients speak 6 languages.<br />
            <span className="text-white/40">So does SARA.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto">SARA detects the language instantly and responds naturally — no setup, no switching.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANGS.map((l) => (
            <div key={l.lang}
              ref={ref}
              className={`bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/6 hover:border-white/15 transition-all duration-500`}
              style={{
                transitionDelay: `${l.delay}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
              }}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="bg-white/10 text-white/70 text-[10px] font-bold px-2 py-0.5 rounded tracking-widest">{l.code}</span>
                <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{l.lang}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-end">
                  <span className="bg-[#005c4b] text-white/90 text-xs px-3 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] text-right leading-relaxed">{l.text}</span>
                </div>
                <div className="flex justify-start items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#a07840] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">S</div>
                  <span className="bg-white/8 text-white/70 text-xs px-3 py-1.5 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed">{l.reply}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400/70 text-[10px]">Detected & replied instantly</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
function Pipeline() {
  const { ref, visible } = useReveal();
  const steps = [
    { icon: 'MSG', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',   dot: 'bg-blue-400',   label: 'Message arrives', sub: 'Any language, any time' },
    { icon: 'AI',  color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20', dot: 'bg-purple-400', label: 'SARA reads intent', sub: 'Budget, purpose, timeline, nationality' },
    { icon: 'MATCH', color: 'from-[#C9A96E]/20 to-[#C9A96E]/5 border-[#C9A96E]/20', dot: 'bg-[#C9A96E]',  label: 'Property matched', sub: 'From your exact listings' },
    { icon: 'BOOK', color: 'from-green-500/20 to-green-600/10 border-green-500/20', dot: 'bg-green-400',  label: 'Viewing booked', sub: 'Date confirmed automatically' },
    { icon: 'CRM', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/20', dot: 'bg-orange-400', label: 'CRM updated', sub: 'Score, summary, full history' },
  ];
  return (
    <section className="bg-[#0a0a0a] py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest mb-4">The full pipeline</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
            From "Hello" to booked viewing.<br />
            <span className="text-white/40">Without lifting a finger.</span>
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-0">
          {steps.map((s, i) => (
            <div key={i} className="flex md:flex-col items-center flex-1 gap-3 md:gap-0 w-full">
              <div
                className={`flex-1 md:flex-none flex flex-col items-center text-center transition-all duration-700`}
                style={{
                  transitionDelay: `${i * 120}ms`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'scale(1)' : 'scale(0.8)',
                }}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} border flex items-center justify-center mb-3 transition-all hover:scale-105`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-white/50 text-[8px] font-black tracking-widest">{s.icon}</span>
                  </div>
                </div>
                <p className="text-white font-semibold text-sm">{s.label}</p>
                <p className="text-white/45 text-xs mt-1 max-w-[100px] mx-auto">{s.sub}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/10 via-[#C9A96E]/30 to-white/10 mx-3 mt-[-28px]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Block ────────────────────────────────────────────────────────────
function FeatureBlock({
  label, title, subtitle, visual, reverse = false,
}: {
  label: string; title: string; subtitle: string;
  visual: React.ReactNode; reverse?: boolean;
}) {
  const { ref, visible } = useReveal();
  return (
    <section className="bg-[#040404] py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : reverse ? 'opacity-0 translate-x-10' : 'opacity-0 -translate-x-10'} ${reverse ? 'lg:order-2' : ''}`}>
            <p className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest mb-4">{label}</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6 whitespace-pre-line">{title}</h2>
            <p className="text-white/40 text-lg leading-relaxed">{subtitle}</p>
          </div>
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : reverse ? 'opacity-0 -translate-x-10' : 'opacity-0 translate-x-10'} ${reverse ? 'lg:order-1' : ''}`}>
            {visual}
          </div>
        </div>
      </div>
    </section>
  );
}

function QualifyVisual() {
  const qs = [
    { q: 'Investment or residence?', a: 'Investment',  score: 4 },
    { q: 'Approximate budget?',      a: '$200K-$300K', score: 4 },
    { q: 'Preferred area?',          a: 'Besiktas',    score: 5 },
  ];
  return (
    <div className="bg-white/3 border border-white/8 rounded-3xl p-6 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-[#C9A96E] rounded-full animate-pulse" />
        <span className="text-white/40 text-xs">SARA qualifying lead</span>
      </div>
      {qs.map((item, i) => (
        <div key={i}>
          <p className="text-white/30 text-xs mb-1">{item.q}</p>
          <div className="flex items-center justify-between bg-white/4 rounded-xl px-4 py-2.5">
            <span className="text-white text-sm">{item.a}</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(n => (
                <div key={n} className={`w-2 h-2 rounded-full ${n <= item.score ? 'bg-[#C9A96E]' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
        <span className="text-green-400 text-sm font-semibold">Score: Hot</span>
        <span className="text-green-400/60 text-xs">CRM updated</span>
      </div>
    </div>
  );
}

function CRMVisual() {
  const fields = [
    { label: 'Name',     value: 'Ahmad Karimi',   color: 'text-white' },
    { label: 'Budget',   value: '$200K-$300K',    color: 'text-[#C9A96E]' },
    { label: 'Purpose',  value: 'Investment',     color: 'text-blue-400' },
    { label: 'Timeline', value: '1-3 months',     color: 'text-purple-400' },
    { label: 'Score',    value: 'Hot',            color: 'text-orange-400' },
    { label: 'Status',   value: 'Viewing booked', color: 'text-green-400' },
  ];
  return (
    <div className="bg-white/3 border border-white/8 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-white font-semibold text-sm">Lead record</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs">Auto-updated by SARA</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-white/30 text-xs w-20">{f.label}</span>
            <span className={`text-sm font-medium ${f.color}`}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpVisual() {
  const items = [
    { time: 'Day 1',  msg: 'Viewing confirmed',        done: true },
    { time: 'Day 2',  msg: 'Brochure PDF sent',        done: true },
    { time: 'Day 4',  msg: 'Post-viewing check-in',    done: true },
    { time: 'Day 7',  msg: 'New listing match found',  done: false, active: true },
    { time: 'Day 14', msg: 'Monthly market update',    done: false },
  ];
  return (
    <div className="bg-white/3 border border-white/8 rounded-3xl p-6">
      <p className="text-white font-semibold text-sm mb-5">SARA follow-up sequence</p>
      <div className="space-y-3">
        {items.map((t, i) => (
          <div key={i} className={`flex items-start gap-3 ${t.active ? 'opacity-100' : t.done ? 'opacity-60' : 'opacity-25'}`}>
            <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold ${
              t.done ? 'bg-green-500 text-white' : t.active ? 'bg-[#C9A96E] text-black' : 'bg-white/10'
            }`}>
              {t.done ? '✓' : t.active ? '→' : '·'}
            </div>
            <div>
              <p className="text-white/25 text-[10px] mb-0.5">{t.time}</p>
              <p className={`text-sm ${t.active ? 'text-[#C9A96E] font-medium' : t.done ? 'text-white/70' : 'text-white/30'}`}>{t.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const { ref, visible } = useReveal();
  const stats = [
    { value: '< 10s', label: 'Response time' },
    { value: '24/7',  label: 'Always available' },
    { value: '6',     label: 'Languages' },
    { value: '100%',  label: 'Leads answered' },
  ];
  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center transition-all duration-700"
              style={{ transitionDelay: `${i * 100}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}>
              <p className="text-5xl font-extrabold text-white mb-2 tracking-tight">{s.value}</p>
              <p className="text-white/30 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { ref, visible } = useReveal();
  const steps = [
    { n: '01', title: 'Add your listings',       body: 'Upload properties to DirectKey. SARA learns your portfolio — prices, locations, payment plans.' },
    { n: '02', title: 'We connect WhatsApp',      body: 'No technical setup needed. Our team connects your WhatsApp Business number in 24 hours.' },
    { n: '03', title: 'SARA works. You close.',   body: 'SARA handles every inquiry, qualifies leads, and sends you only the hot ones ready to meet.' },
  ];
  return (
    <section id="how" className="bg-[#040404] py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest mb-4">Simple setup</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Up and running in 24 hours.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="transition-all duration-700"
              style={{ transitionDelay: `${i * 150}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)' }}>
              <p className="text-6xl font-extrabold text-white/5 mb-4">{s.n}</p>
              <h3 className="text-white font-bold text-xl mb-3 -mt-6">{s.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const names = ['Torunlar GYO','Sur Yapi','Folkart','Sinpas GYO','RE/MAX Turkey','Century 21','Coldwell Banker','ERA Turkey','Azizi Developments','Bayut Partners','Emlak Konut','Metropol Istanbul'];
  const items = [...names, ...names];
  return (
    <section className="bg-black py-10 border-t border-white/5 overflow-hidden">
      <p className="text-center text-white/15 text-xs font-semibold uppercase tracking-widest mb-6">Trusted by agencies worldwide</p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        <div className="flex gap-3 w-max" style={{ animation: 'ticker-scroll 35s linear infinite' }}>
          {items.map((name, i) => (
            <div key={i} className="flex-shrink-0 bg-white/3 border border-white/6 rounded-full px-5 py-2 text-xs text-white/40 whitespace-nowrap">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { ref, visible } = useReveal();
  return (
    <section className="bg-black py-32 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Ready to never<br /><span className="text-[#C9A96E]">miss a lead again?</span>
          </h2>
          <p className="text-white/35 text-lg mb-10">Join real estate agencies using SARA to automate their sales pipeline.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-black font-bold px-8 py-4 rounded-full transition text-base">
            Start your free trial <ArrowRight size={18} />
          </Link>
          <div className="mt-8 flex justify-center gap-8 text-sm text-white/25 flex-wrap">
            {['No credit card required', 'Setup in 24 hours', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-2"><CheckCircle size={13} className="text-white/20" />{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-bold text-white text-sm">Direct<span className="text-[#C9A96E]">Key</span></span>
        <p className="text-white/15 text-xs">© 2026 DirectKey. All rights reserved.</p>
        <div className="flex items-center gap-6 text-xs text-white/20">
          <Link href="/privacy" className="hover:text-white/50 transition">Privacy</Link>
          <Link href="/terms" className="hover:text-white/50 transition">Terms</Link>
          <Link href="/login" className="hover:text-white/50 transition">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

const globalStyles = `
  @keyframes popIn { from { opacity:0; transform:scale(0.95) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes ticker-scroll { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  .scrollbar-none::-webkit-scrollbar { display:none; }
  .scrollbar-none { -ms-overflow-style:none; scrollbar-width:none; }
  html { scroll-behavior: smooth; }
`;

export default function HomePage() {
  return (
    <>
      <style>{globalStyles}</style>
      <Navbar />
      <Hero />
      <Languages />
      <Pipeline />
      <FeatureBlock label="Smart qualification" title={"Every message\nqualifies itself."} subtitle="SARA asks the right questions from the first reply — budget, purpose, timeline. Your CRM fills itself." visual={<QualifyVisual />} />
      <FeatureBlock label="Automatic CRM" title={"Your CRM updates\nwhile you sleep."} subtitle="Every conversation is scored, summarized, and logged. Open your dashboard and leads are already sorted." visual={<CRMVisual />} reverse />
      <FeatureBlock label="Follow-up automation" title={"SARA follows up.\nEvery time."} subtitle="Brochures, viewing confirmations, check-ins — SARA handles the full sequence so no lead goes cold." visual={<FollowUpVisual />} />
      <Stats />
      <HowItWorks />
      <Ticker />
      <div id="pricing"><PricingSection /></div>
      <CTA />
      <Footer />
    </>
  );
}
