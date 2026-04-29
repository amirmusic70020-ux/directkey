'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X, Send, CheckCircle } from 'lucide-react';

interface Props {
  projectTitle: string;
  whatsappText: string;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '905551005587';

export default function LeadForm({ projectTitle, whatsappText, onClose }: Props) {
  const t = useTranslations('form');
  const locale = useLocale();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    budget: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.budget) return;

    setStatus('submitting');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          project: projectTitle,
          locale,
          source: 'website',
        }),
      });

      if (!res.ok) throw new Error('Failed');

      setStatus('success');

      // Redirect to WhatsApp after 1.5 seconds
      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
        onClose();
      }, 1500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition ml-4 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Project label */}
        <div className="mx-6 mb-4 px-4 py-2.5 bg-navy-50 rounded-xl text-sm">
          <span className="text-gray-500">{t('project')}: </span>
          <span className="text-navy-900 font-semibold">{projectTitle}</span>
        </div>

        {status === 'success' ? (
          <div className="px-6 pb-8 text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">{t('success')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/10 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder={t('phonePlaceholder')}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/10 transition"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('budget')} <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/10 transition bg-white"
              >
                <option value="">{t('budgetSelect')}</option>
                <option value={t('budget1')}>{t('budget1')}</option>
                <option value={t('budget2')}>{t('budget2')}</option>
                <option value={t('budget3')}>{t('budget3')}</option>
                <option value={t('budget4')}>{t('budget4')}</option>
                <option value={t('budget5')}>{t('budget5')}</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('message')}
              </label>
              <textarea
                rows={3}
                placeholder={t('messagePlaceholder')}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/10 transition resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500 text-center">{t('error')}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition"
            >
              {status === 'submitting' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {t('submitting')}
                </span>
              ) : (
                <>
                  <Send size={16} />
                  {t('submit')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
