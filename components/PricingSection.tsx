'use client';

import { Check, X, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

type Feature = {
  text: string;
  included: boolean;
};

type Plan = {
  name: string;
  badge?: string;
  price: number;
  period: string;
  leads: string;
  features: Feature[];
  cta: string;
  highlighted: boolean;
};

const plans: Plan[] = [
  {
    name: 'Basic',
    price: 99,
    period: '/ month',
    leads: 'Up to 50 active leads / month',
    highlighted: false,
    cta: 'Get Started',
    features: [
      { text: 'SARA AI on WhatsApp', included: true },
      { text: 'Automatic CRM (Airtable)', included: true },
      { text: 'Human handoff alerts', included: true },
      { text: '5 active project listings', included: true },
      { text: 'Email support', included: true },
      { text: 'Daily performance reports', included: false },
      { text: 'Automated follow-ups', included: false },
      { text: 'PDF brochure sending', included: false },
      { text: 'Instagram auto-posting', included: false },
      { text: 'Graphic carousel (Bannerbear)', included: false },
      { text: 'White-label branding', included: false },
    ],
  },
  {
    name: 'Pro',
    badge: 'Most Popular',
    price: 249,
    period: '/ month',
    leads: 'Up to 200 active leads / month',
    highlighted: true,
    cta: 'Start Free Trial',
    features: [
      { text: 'SARA AI on WhatsApp', included: true },
      { text: 'Automatic CRM (Airtable)', included: true },
      { text: 'Human handoff alerts', included: true },
      { text: 'Daily performance reports', included: true },
      { text: 'Automated follow-ups', included: true },
      { text: 'PDF brochure sending', included: true },
      { text: 'Instagram auto-posting', included: true },
      { text: '15 active project listings', included: true },
      { text: 'Priority support', included: true },
      { text: 'Graphic carousel (Bannerbear)', included: false },
      { text: 'White-label branding', included: false },
    ],
  },
  {
    name: 'Agency',
    price: 499,
    period: '/ month',
    leads: 'Unlimited active leads',
    highlighted: false,
    cta: 'Contact Sales',
    features: [
      { text: 'SARA AI on WhatsApp', included: true },
      { text: 'Automatic CRM (Airtable)', included: true },
      { text: 'Human handoff alerts', included: true },
      { text: 'Daily performance reports', included: true },
      { text: 'Automated follow-ups', included: true },
      { text: 'PDF brochure sending', included: true },
      { text: 'Instagram auto-posting', included: true },
      { text: 'Graphic carousel (Bannerbear)', included: true },
      { text: 'Unlimited project listings', included: true },
      { text: 'White-label branding', included: true },
      { text: 'Dedicated account manager', included: true },
    ],
  },
];

const roiStats = [
  {
    icon: DollarSign,
    value: '$2,000+',
    label: 'Average receptionist cost in Dubai per month',
  },
  {
    icon: TrendingUp,
    value: '18x',
    label: 'ROI on Pro plan vs hiring a full-time agent',
  },
  {
    icon: Users,
    value: '6,000+',
    label: 'Real estate agencies registered with RERA in Dubai',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'SARA responds to leads even while you sleep',
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold tracking-widest text-gold-600 uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Replace a $2,000/month receptionist with SARA — starting at $99.
            Every plan includes a one-time onboarding fee.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => {
            const includedFeatures = plan.features.filter((f) => f.included);
            const excludedFeatures = plan.features.filter((f) => !f.included);

            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 flex flex-col ${
                  plan.highlighted
                    ? 'bg-navy-900 text-white shadow-2xl ring-2 ring-gold-500'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-block bg-gold-500 text-navy-950 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      plan.highlighted ? 'text-white' : 'text-navy-900'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className={`text-4xl font-bold ${
                        plan.highlighted ? 'text-white' : 'text-navy-900'
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlighted ? 'text-gray-300' : 'text-gray-400'
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      plan.highlighted ? 'text-gold-400' : 'text-gold-600'
                    }`}
                  >
                    {plan.leads}
                  </p>
                </div>

                <div
                  className={`h-px mb-6 ${
                    plan.highlighted ? 'bg-white/10' : 'bg-gray-100'
                  }`}
                />

                {/* Included features first */}
                <ul className="space-y-3 flex-1 mb-8">
                  {includedFeatures.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.highlighted
                            ? 'bg-gold-500/20'
                            : 'bg-green-50'
                        }`}
                      >
                        <Check
                          size={11}
                          className={
                            plan.highlighted ? 'text-gold-400' : 'text-green-600'
                          }
                          strokeWidth={3}
                        />
                      </div>
                      <span
                        className={`text-sm leading-relaxed ${
                          plan.highlighted ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}

                  {/* Excluded features after */}
                  {excludedFeatures.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3 opacity-40">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 bg-gray-100">
                        <X size={10} className="text-gray-400" strokeWidth={2.5} />
                      </div>
                      <span
                        className={`text-sm leading-relaxed ${
                          plan.highlighted ? 'text-gray-400' : 'text-gray-400'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/971000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center py-3.5 px-6 rounded-2xl font-semibold text-sm transition hover:scale-105 active:scale-95 ${
                    plan.highlighted
                      ? 'bg-gold-500 hover:bg-gold-400 text-navy-950'
                      : 'bg-navy-900 hover:bg-navy-800 text-white'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        {/* ROI Analysis strip */}
        <div className="bg-navy-950 rounded-3xl p-10">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-2">
              Why agencies choose SARA
            </h3>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Dubai real estate moves fast. SARA qualifies leads, sends brochures,
              and books viewings — while your team focuses on closing deals.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {roiStats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gold-500/10 rounded-xl mb-3">
                  <stat.icon size={18} className="text-gold-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Annual plans available — save 2 months.{' '}
              <a
                href="https://wa.me/971000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400 hover:text-gold-300 font-medium transition"
              >
                Talk to us →
              </a>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
