'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = LANGS.find((l) => l.code === locale) || LANGS[0];

  const switchLocale = (code: string) => {
    // Replace current locale prefix with new one
    const segments = pathname.split('/');
    segments[1] = code;
    router.push(segments.join('/'));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
      >
        <Globe size={15} className="text-gray-500" />
        <span>{current.flag} {current.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                  lang.code === locale ? 'bg-navy-50 text-navy-900 font-medium' : 'text-gray-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
