'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, MessageCircle, CheckCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '905XXXXXXXXX';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />

      {/* Decorative circles */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-navy-600/20 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,169,110,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <CheckCircle size={14} />
            {t('badge')}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/projects`}
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold-500/20"
            >
              {t('cta_primary')}
              <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all"
            >
              <MessageCircle size={18} />
              {t('cta_secondary')}
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/10">
            {[
              { val: t('stat1_value'), label: t('stat1_label') },
              { val: t('stat2_value'), label: t('stat2_label') },
              { val: t('stat3_value'), label: t('stat3_label') },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-gold-400">{stat.val}</div>
                <div className="text-sm text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
