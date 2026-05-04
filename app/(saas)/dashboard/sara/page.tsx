'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Check, MessageCircle, Clock, Zap, XCircle, Bot, Upload, X, ChevronDown, AlertCircle } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
];

const STYLES = [
  { id: 'professional', label: 'Professional', desc: 'Formal, precise, trust-building' },
  { id: 'friendly',     label: 'Friendly',     desc: 'Warm, approachable, conversational' },
  { id: 'luxury',       label: 'Luxury',       desc: 'Elegant, exclusive, high-end' },
];

// Key questions that feed into SARA's brain
const SARA_QUESTIONS = [
  {
    key: 'q_properties',
    label: 'What types of properties do you sell?',
    placeholder: 'e.g. Luxury apartments, sea-view villas, off-plan projects in Istanbul and Antalya...',
    minLength: 30,
  },
  {
    key: 'q_payment',
    label: 'What payment plans do you offer?',
    placeholder: 'e.g. 30% down payment + 24 months installments, cash discount available, bank financing supported...',
    minLength: 30,
  },
  {
    key: 'q_advantage',
    label: 'What makes your agency different from competitors?',
    placeholder: 'e.g. 10 years experience, citizenship consultancy included, full after-sale support, no hidden fees...',
    minLength: 40,
  },
  {
    key: 'q_clients',
    label: 'Who are your typical clients?',
    placeholder: 'e.g. Middle East investors looking for citizenship, European retirees, local Turkish buyers...',
    minLength: 30,
  },
  {
    key: 'q_extra',
    label: 'Anything else SARA must always know?',
    placeholder: 'e.g. We offer free airport pickup, our office is open 7 days, we speak Arabic and Farsi...',
    minLength: 0,
  },
];

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const compress = (maxPx: number, quality: number): string => {
          const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width  = Math.round(img.width  * ratio);
          canvas.height = Math.round(img.height * ratio);
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', quality);
        };
        let result = compress(300, 0.85);
        if (result.length > 75000) result = compress(200, 0.75);
        resolve(result);
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function RequiredStar() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

export default function SaraPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [countryCode, setCountryCode] = useState('+90');
  const [showCodes,   setShowCodes]   = useState(false);

  const [form, setForm] = useState({
    whatsappNumber:  '',
    telegramBotName: '',
    saraName:        '',
    saraStyle:       'professional',
    saraMarkets:     '',
    logo:            '',
    q_properties:    '',
    q_payment:       '',
    q_advantage:     '',
    q_clients:       '',
    q_extra:         '',
  });

  const [status,    setStatus]    = useState<'inactive' | 'pending' | 'active'>('inactive');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const isLocked = status === 'pending' || status === 'active';

  useEffect(() => {
    Promise.all([
      fetch('/api/sara').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([sara, settings]) => {
      const stored = sara.whatsappNumber || '';
      const matched = COUNTRY_CODES.find(c => stored.startsWith(c.code));
      if (matched) {
        setCountryCode(matched.code);
        setForm(p => ({ ...p, whatsappNumber: stored.slice(matched.code.length) }));
      }

      // Parse saraAbout back into questions if stored as JSON
      let questions: Record<string, string> = {};
      try { questions = JSON.parse(sara.saraAbout || '{}'); } catch { questions = {}; }

      setForm(p => ({
        ...p,
        saraName:     sara.saraName    || '',
        saraStyle:    sara.saraStyle   || 'professional',
        saraMarkets:  sara.saraMarkets || '',
        logo:         settings.logo    || '',
        q_properties: questions.q_properties || '',
        q_payment:    questions.q_payment    || '',
        q_advantage:  questions.q_advantage  || '',
        q_clients:    questions.q_clients    || '',
        q_extra:      questions.q_extra      || '',
      }));
      setStatus(sara.whatsappStatus || 'inactive');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, logo: 'Max 5 MB' })); return; }
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      setForm(p => ({ ...p, logo: dataUrl }));
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: dataUrl }),
      });
    } catch { setErrors(p => ({ ...p, logo: 'Failed to process image' })); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.whatsappNumber.trim())
      e.whatsappNumber = 'WhatsApp number is required';
    if (!form.saraName.trim())
      e.saraName = 'Agent name is required';
    SARA_QUESTIONS.forEach(q => {
      if (q.minLength > 0 && (form[q.key as keyof typeof form] || '').length < q.minLength)
        e[q.key] = `Please write at least ${q.minLength} characters`;
    });
    return e;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});

    const fullNumber = `${countryCode}${form.whatsappNumber.replace(/\s/g, '')}`;

    // Store all questions as JSON in saraAbout
    const saraAbout = JSON.stringify({
      q_properties: form.q_properties,
      q_payment:    form.q_payment,
      q_advantage:  form.q_advantage,
      q_clients:    form.q_clients,
      q_extra:      form.q_extra,
    });

    const res = await fetch('/api/sara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsappNumber:  fullNumber,
        telegramBotName: form.telegramBotName,
        saraName:        form.saraName,
        saraStyle:       form.saraStyle,
        saraAbout,
        saraMarkets:     form.saraMarkets,
      }),
    });

    setSaving(false);
    if (!res.ok) { setErrors({ form: 'Failed to save. Please try again.' }); return; }

    // Send email notifications
    await fetch('/api/notify-sara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappNumber: fullNumber, saraName: form.saraName, telegramBotName: form.telegramBotName }),
    }).catch(() => {});

    setStatus('pending');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const statusConfig = {
    inactive: { bg: 'bg-gray-50',   border: 'border-gray-200',  dot: 'bg-gray-400',              text: 'Not set up yet — fill in the form below',         badge: null },
    pending:  { bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-500',              text: 'Request received — our team will activate SARA as soon as possible', badge: 'Pending' },
    active:   { bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500 animate-pulse', text: 'SARA is live and responding to your clients',      badge: 'Active' },
  }[status];

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">SARA — AI Agent</h1>
        <p className="text-gray-500 text-sm mt-1">Set up your AI sales agent and customize her personality</p>
      </div>

      {/* Status banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6 ${statusConfig.bg} ${statusConfig.border}`}>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
        <p className="text-sm font-medium text-gray-800 flex-1">{statusConfig.text}</p>
        {statusConfig.badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>{statusConfig.badge}</span>
        )}
      </div>

      {/* Locked message */}
      {isLocked && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6">
          <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            {status === 'pending'
              ? 'Your request is being processed. Contact us at info@directkey.app if you need to make changes.'
              : 'SARA is active. Contact info@directkey.app to update your settings.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. WhatsApp Number */}
        <div className={`bg-white rounded-2xl border p-6 transition ${isLocked ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageCircle size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">WhatsApp Business Number <RequiredStar /></h2>
              <p className="text-xs text-gray-400">The number SARA will use to talk to your clients</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button type="button" onClick={() => setShowCodes(p => !p)}
                className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium whitespace-nowrap">
                {COUNTRY_CODES.find(c => c.code === countryCode)?.flag} {countryCode}
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showCodes && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-52 max-h-64 overflow-y-auto">
                  {COUNTRY_CODES.map(c => (
                    <button key={c.code} type="button"
                      onClick={() => { setCountryCode(c.code); setShowCodes(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-left">
                      <span>{c.flag}</span>
                      <span className="flex-1 text-gray-700">{c.name}</span>
                      <span className="text-gray-400 font-mono">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              value={form.whatsappNumber}
              onChange={e => setForm(p => ({ ...p, whatsappNumber: e.target.value }))}
              placeholder="555 123 45 67"
              className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm ${errors.whatsappNumber ? 'border-red-400' : 'border-gray-200'}`}
            />
          </div>
          {errors.whatsappNumber && <p className="text-red-500 text-xs mt-1.5">{errors.whatsappNumber}</p>}
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Important:</strong> This number must <strong>not</strong> be registered on regular WhatsApp or WhatsApp Business app. It must be a dedicated number used only for the API. If the number already has WhatsApp, the connection will fail.
            </p>
          </div>
        </div>

        {/* 2. Telegram Bot */}
        <div className={`bg-white rounded-2xl border p-6 transition ${isLocked ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <MessageCircle size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Telegram Bot <span className="text-xs font-normal text-gray-400 ml-1">(for Iranian clients)</span></h2>
              <p className="text-xs text-gray-400">SARA will also respond on Telegram — ideal for clients who can't use WhatsApp</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Bot name you want</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-mono">@</span>
              <input
                value={form.telegramBotName || ''}
                onChange={e => setForm(p => ({ ...p, telegramBotName: e.target.value.replace(/\s/g, '') }))}
                placeholder="YourAgencySaraBot"
                maxLength={32}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Must end in <span className="font-mono">Bot</span> · e.g. <span className="font-mono">NivakSaraBot</span></p>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Our team will create this Telegram bot for you and connect it to SARA. Your clients can message <span className="font-mono">@{form.telegramBotName || 'YourBot'}</span> on Telegram and get instant replies — same as WhatsApp.
            </p>
          </div>
        </div>

        {/* 3. Profile Picture */}
        <div className={`bg-white rounded-2xl border p-6 transition ${isLocked ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-navy-50 rounded-xl flex items-center justify-center">
              <Bot size={18} className="text-navy-700" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">SARA Profile Picture</h2>
              <p className="text-xs text-gray-400">Used as SARA's WhatsApp profile photo</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {uploading ? <Loader2 size={20} className="animate-spin text-gray-300" />
                  : form.logo ? <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                  : <Bot size={28} className="text-gray-300" />}
              </div>
              {form.logo && !uploading && (
                <button type="button" onClick={() => setForm(p => ({ ...p, logo: '' }))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="sara-logo" />
              <label htmlFor="sara-logo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-navy-200 text-navy-700 hover:border-navy-400 hover:bg-navy-50 cursor-pointer transition text-sm font-medium">
                <Upload size={14} /> {form.logo ? 'Replace photo' : 'Upload photo'}
              </label>
              <p className="text-xs text-gray-400 mt-1.5">PNG · JPG · Square preferred</p>
            </div>
          </div>
        </div>

        {/* 3. SARA Personality */}
        <div className={`bg-white rounded-2xl border p-6 transition ${isLocked ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">SARA Personality</h2>
              <p className="text-xs text-gray-400">This shapes how SARA talks to your clients</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Agent name <RequiredStar />
                <span className="text-gray-400 font-normal ml-1">(what clients see)</span>
              </label>
              <input
                value={form.saraName}
                onChange={e => setForm(p => ({ ...p, saraName: e.target.value }))}
                placeholder="SARA"
                maxLength={20}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm ${errors.saraName ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.saraName && <p className="text-red-500 text-xs mt-1">{errors.saraName}</p>}
              <p className="text-xs text-gray-400 mt-1">e.g. Sara, Alex, Nour, Layla</p>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-3">Communication style</label>
              <div className="grid grid-cols-3 gap-3">
                {STYLES.map(s => (
                  <button key={s.id} type="button"
                    onClick={() => setForm(p => ({ ...p, saraStyle: s.id }))}
                    className={`p-3 rounded-xl border-2 text-left transition ${form.saraStyle === s.id ? 'border-navy-900 bg-navy-50' : 'border-gray-100 hover:border-gray-300'}`}>
                    <p className="text-sm font-semibold text-navy-900">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target markets */}
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Target markets</label>
              <input
                value={form.saraMarkets}
                onChange={e => setForm(p => ({ ...p, saraMarkets: e.target.value }))}
                placeholder="e.g. Middle East investors, European buyers, Turkish locals"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 4. Key Questions for SARA's brain */}
        <div className={`bg-white rounded-2xl border p-6 transition ${isLocked ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-200'}`}>
          <div className="mb-5">
            <h2 className="font-semibold text-navy-900">Train SARA's Brain <RequiredStar /></h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Answer these questions carefully — this is what makes SARA smart about your agency
            </p>
          </div>

          <div className="space-y-5">
            {SARA_QUESTIONS.map((q, i) => (
              <div key={q.key}>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  {i + 1}. {q.label}
                  {q.minLength > 0 && <RequiredStar />}
                </label>
                <textarea
                  value={form[q.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [q.key]: e.target.value }))}
                  rows={3}
                  placeholder={q.placeholder}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm resize-none leading-relaxed ${errors[q.key] ? 'border-red-400' : 'border-gray-200'}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors[q.key]
                    ? <p className="text-red-500 text-xs">{errors[q.key]}</p>
                    : <span />}
                  {q.minLength > 0 && (
                    <p className={`text-xs ${
                      (form[q.key as keyof typeof form] || '').length >= q.minLength
                        ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {(form[q.key as keyof typeof form] || '').length} / {q.minLength} min
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {errors.form && <p className="text-red-600 text-sm">{errors.form}</p>}

        {!isLocked && (
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Zap size={16} />}
            {saving ? 'Saving…' : saved ? 'Sent! We\'ll activate SARA soon' : 'Save & Request Activation'}
          </button>
        )}

      </form>
    </div>
  );
}
