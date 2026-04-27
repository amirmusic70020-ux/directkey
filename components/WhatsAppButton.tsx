'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '905551005587';
const DEFAULT_MESSAGE = "Hi, I'm interested in properties in Turkey. Can you help me?";

interface Props {
  message?: string;
  label?: string;
  className?: string;
  variant?: 'floating' | 'inline';
}

export default function WhatsAppButton({ message = DEFAULT_MESSAGE, label, className = '', variant = 'floating' }: Props) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  if (variant === 'inline') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-5 py-3 rounded-xl transition ${className}`}
      >
        <MessageCircle size={18} />
        {label || 'WhatsApp'}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-4 py-3.5 rounded-2xl shadow-lg shadow-green-500/30 hover:scale-105 transition-all"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} />
      <span className="text-sm hidden sm:block">WhatsApp</span>
    </a>
  );
}
