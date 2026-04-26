'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '905XXXXXXXXX';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-navy-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-navy-700 to-navy-900 border border-gold-500/30 rounded-lg flex items-center justify-center">
                <span className="text-gold-500 font-bold text-sm">DK</span>
              </div>
              <span className="text-white font-bold text-xl">DirectKey</span>
            </div>
            <p className="text-sm leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Properties</h4>
            <div className="space-y-2 text-sm">
              <Link href={`/${locale}/projects`} className="block hover:text-gold-400 transition">Istanbul</Link>
              <Link href={`/${locale}/projects`} className="block hover:text-gold-400 transition">Antalya</Link>
              <Link href={`/${locale}/projects`} className="block hover:text-gold-400 transition">Bodrum</Link>
              <Link href={`/${locale}/projects`} className="block hover:text-gold-400 transition">Izmir</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('contact')}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gold-500 flex-shrink-0" />
                <span>Istanbul, Turkey</span>
              </div>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold-400 transition">
                <Phone size={14} className="text-gold-500 flex-shrink-0" />
                <span>+90 5XX XXX XXXX</span>
              </a>
              <a href="mailto:info@directkey.com" className="flex items-center gap-2 hover:text-gold-400 transition">
                <Mail size={14} className="text-gold-500 flex-shrink-0" />
                <span>info@directkey.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>{t('rights')}</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gold-400 transition">{t('privacy')}</Link>
            <Link href="#" className="hover:text-gold-400 transition">{t('terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
