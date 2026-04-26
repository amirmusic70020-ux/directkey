'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const WHATSAPP_NUMBER = '905376724979';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-navy-700 to-navy-900 rounded-lg flex items-center justify-center">
              <span className="text-gold-500 font-bold text-sm">DK</span>
            </div>
            <span className={`font-bold text-xl tracking-tight ${scrolled ? 'text-navy-900' : 'text-white'}`}>
              DirectKey
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className={`text-sm font-medium hover:text-gold-500 transition ${scrolled ? 'text-gray-700' : 'text-white/90'}`}
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/projects`}
              className={`text-sm font-medium hover:text-gold-500 transition ${scrolled ? 'text-gray-700' : 'text-white/90'}`}
            >
              {t('projects')}
            </Link>
            <LanguageSwitcher />
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <Phone size={15} />
              {t('bookConsultation')}
            </a>
          </nav>

          {/* Mobile: Lang + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-lg ${scrolled ? 'text-navy-900' : 'text-white'}`}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-3">
            <Link
              href={`/${locale}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-800 font-medium"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/projects`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-800 font-medium"
            >
              {t('projects')}
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 justify-center bg-navy-900 text-white font-semibold px-4 py-3 rounded-xl mt-2"
            >
              <Phone size={16} />
              {t('bookConsultation')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
