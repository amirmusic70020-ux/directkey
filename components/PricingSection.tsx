'use client';

import { Check, X, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

type Feature = { text: string; included: boolean };

type Plan = {
  name: string;
  badge?: string;
  price: number;
  period: string;
  leads: string;
  features: Feature[];
  cta: string;
  ctaHref: string;
  style: 'basic' | 'pro' | 'elite';
};

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 99,
    period: '/ month',
    leads: 'Up to 50 conversations / month',
    style: 'basic',
    cta: 'Get Started',
    ctaHref: '/register',
    features: [
      { text: 'AI sales agent on WhatsApp', included: true },
      { text: 'Automated lead qualification', included: true },
      { text: 'Smart CRM — auto-updated', included: true },
      { text: 'Human handoff alerts', included: true },
      { text: '5 active property listings', included: true },
      { text: 'Email support', included: true },
      { text: 'Daily performance reports', included: false },
      { text: 'Automated follow-up sequences', included: false },
      { text: 'Digital brochure delivery', included: false },
      { text: 'Social media auto-posting', included: false },
      { text: 'Branded visual carousels', included: false },
      { text: 'White-label & custom branding', included: false },
    ],
  },
  {
    name: 'Pro',
    badge: 'Most Popular',
    price: 249,
    period: '/ month',
    leads: 'Up to 200 conversations / month',
    style: 'pro',
    cta: 'Start Free Trial',
    ctaHref: '/register',
    features: [
      { text: 'AI sales agent on WhatsApp', included: true },
      { text: 'Automated lead qualification', included: true },
      { text: 'Smart CRM — auto-updated', included: true },
      { text: 'Human handoff alerts', included: true },
      { text: 'Daily performance reports', included: true },
      { text: 'Automated follow-up sequences', included: true },
      { text: 'Digital brochure delivery', included: true },
      { text: 'Social media auto-posting', included: true },
      { text: '15 active property listings', included: true },
      { text: 'Priority support', included: true },
      { text: 'Branded visual carousels', included: false },
      { text: 'White-label & custom branding', included: false },
    ],
  },
  {
    name: 'Pro Agency',
    price: 499,
    period: '/ month',
    leads: 'Unlimited conversations',
    style: 'elite',
    cta: 'Contact Sales',
    ctaHref: '/register',
    features: [
      { text: 'AI sales agent on WhatsApp', included: true },
      { text: 'Automated lead qualification', included: true },
      { text: 'Smart CRM — auto-updated', included: true },
      { text: 'Human handoff alerts', included: true },
      { text: 'Daily performance reports', included: true },
      { text: 'Automated follow-up sequences', included: true },
      { text: 'Digital brochure delivery', included: true },
      { text: 'Social media auto-posting', included: true },
      { text: 'Branded visual carousels', included: true },
      { text: 'Unlimited property listings', included: true },
      { text: 'White-label & custom branding', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
  },
];

const roiStats = [
  { icon: DollarSign, value: '$2,000+', label: 'Average cost of a sales receptionist in Dubai per month' },
  { icon: TrendingUp, value: '18x', label: 'Average ROI on Pro plan vs manual follow-up' },
  { icon: Users, value: '6,000+', label: 'Real estate agencies registered with RERA in Dubai' },
  { icon: Clock, value: '24/7', label: 'Your AI agent responds to leads even while you sleep' },
];

const cardStyles = {
  basic: {
    wrapper: 'bg-white border border-gray-200',
    name: 'text-navy-900',
    price: 'text-navy-900',
    period: 'text-gray-400',
    leads: 'text-amber-600',
    divider: 'bg-gray-100',
    featureText: 'text-gray-700',
    checkBg: 'bg-green-50',
    checkColor: 'text-green-600',
    cta: 'bg-navy-900 hover:bg-navy-800 text-white',
  },
  pro: {
    wrapper: 'bg-navy-900 text-white shadow-2xl ring-2 ring-amber-500',
    name: 'text-white',
    price: 'text-white',
    period: 'text-gray-300',
    leads: 'text-amber-400',
    divider: 'bg-white/10',
    featureText: 'text-gray-200',
    checkBg: 'bg-amber-500/20',
    checkColor: 'text-amber-400',
    cta: 'bg-amber-500 hover:bg-amber-400 text-navy-950',
  },
  elite: {
    wrapper: 'bg-[#0a0a0a] border border-white/10 shadow-2xl',
    name: 'text-white',
    price: 'text-white',
    period: 'text-gray-500',
    leads: 'text-amber-400',
    divider: 'bg-white/10',
    featureText: 'text-gray-300',
    checkBg: 'bg-amber-500/10',
    checkColor: 'text-amber-400',
    cta: 'bg-white hover:bg-gray-100 text-black font-bold',
  },
};

export default function PricingSection() {
  return (
    <section className="py-24 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold tracking-widest text-amber-600 uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Replace a $2,000/month receptionist with an AI that never misses a lead — starting at $99.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-start">
          {plans.map((plan) => {
            const s = cardStyles[plan.style];
            const included = plan.features.filter(f => f.included);
            const excluded = plan.features.filter(f => !f.included);

            return (
              <div key={plan.name} className={`relative rounded-3xl p-8 flex flex-col ${s.wrapper}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-amber-500 text-navy-950 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-4 ${s.name}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-4xl font-bold ${s.price}`}>${plan.price}</span>
                    <span className={`text-sm ${s.period}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm ${s.leads}`}>{plan.leads}</p>
                </div>

                <div className={`h-px mb-6 ${s.divider}`} />

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {included.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${s.checkBg}`}>
                        <Check size={11} className={s.checkColor} strokeWidth={3} />
                      </div>
                      <span className={`text-sm leading-relaxed ${s.featureText}`}>{f.text}</span>
                    </li>
                  ))}
                  {excluded.map((f) => (
                    <li key={f.text} className="flex items-start gap-3 opacity-35">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-gray-200/30">
                        <X size={10} className="text-gray-400" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm leading-relaxed text-gray-400">{f.text}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  className={`block text-center py-3.5 px-6 rounded-2xl font-semibold text-sm transition hover:scale-105 active:scale-95 ${s.cta}`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        {/* ROI strip */}
        <div className="bg-navy-950 rounded-3xl p-10">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-2">Why agencies choose SARA</h3>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Every lead that goes unanswered is a deal your competitor closes. SARA makes sure that never happens.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {roiStats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-500/10 rounded-xl mb-3">
                  <stat.icon size={18} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Annual plans available — save 2 months.{' '}
              <a href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition">
                Talk to us →
              </a>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
