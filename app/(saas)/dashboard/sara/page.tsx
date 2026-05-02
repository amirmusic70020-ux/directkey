'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Check, MessageCircle, Clock, Zap, XCircle, Bot, Upload, X, ChevronDown } from 'lucide-react';

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

export default function SaraPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [countryCode, setCountryCode] = useState('+90');
  const [showCodes,   setShowCodes]   = useState(false);

  const [form, setForm] = useState({
    whatsappNumber: '',
    saraName:       '',
    saraStyle:      'professional',
    saraAbout:      '',
    saraMarkets:    '',
    logo:           '',
  });

  const [status,    setStatus]    = useState<'inactive' | 'pending' | 'active'>('inactive');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/sara').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([sara, settings]) => {
      // parse stored number: "+905551234567" → code "+90", number "5551234567"
      const stored = sara.whatsappNumber || '';
      const matched = COUNTRY_CODES.find(c => stored.startsWith(c.code));
      if (matched) {
        setCountryCode(matched.code);
        setForm(p => ({ ...p, whatsappNumber: stored.slice(matched.code.length) }));
      }
      setForm(p => ({
        ...p,
        saraName:    sara.saraName    || '',
        saraStyle:   sara.saraStyle   || 'professional',
        saraAbout:   sara.saraAbout   || '',
        saraMarkets: sara.saraMarkets || '',
        logo:        settings.logo    || '',
      }));
      setStatus(sara.whatsappStatus || 'inactive');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Logo must be under 5 MB'); return; }
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      setForm(p => ({ ...p, logo: dataUrl }));
      // also save to settings
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: dataUrl }),
      });
    } catch { setError('Image processing failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.whatsappNumber.trim()) { setError('Please enter your WhatsApp number'); return; }
    setSaving(true);
    setError('');

    const fullNumber = `${countryCode}${form.whatsappNumber.replace(/\s/g, '')}`;

    const res = await fetch('/api/sara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsappNumber: fullNumber,
        saraName:       form.saraName,
        saraStyle:      form.saraStyle,
        saraAbout:      form.saraAbout,
        saraMarkets:    form.saraMarkets,
      }),
    });

    setSaving(false);
    if (!res.ok) { setError('Failed to save. Please try again.'); return; }

    // Send email notifications
    await fetch('/api/notify-sara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsappNumber: fullNumber, saraName: form.saraName }),
    }).catch(() => {}); // don't block UI if email fails

    setStatus('pending');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const statusConfig = {
    inactive: { bg: 'bg-gray-50',   border: 'border-gray-200',  dot: 'bg-gray-400',   text: 'Not set up yet',                      icon: XCircle,  iconColor: 'text-gray-400'  },
    pending:  { bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-500',  text: 'Request received — activating within 24h', icon: Clock,    iconColor: 'text-amber-500' },
    active:   { bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500 animate-pulse',  text: 'SARA is live and responding',          icon: Zap,      iconColor: 'text-green-500' },
  }[status];

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
        {status === 'active' && (
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Active</span>
        )}
        {status === 'pending' && (
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">Pending</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">

          {/* 1. WhatsApp Number */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle size={18} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-navy-900">WhatsApp Business Number</h2>
                <p className="text-xs text-gray-400">The number SARA will use to talk to your clients</p>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Country code picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCodes(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium whitespace-nowrap"
                >
                  {COUNTRY_CODES.find(c => c.code === countryCode)?.flag} {countryCode}
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {showCodes && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-52 max-h-64 overflow-y-auto">
                    {COUNTRY_CODES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => { setCountryCode(c.code); setShowCodes(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm text-left"
                      >
                        <span>{c.flag}</span>
                        <span className="flex-1 text-gray-700">{c.name}</span>
                        <span className="text-gray-400 font-mono">{c.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Number input */}
              <input
                value={form.whatsappNumber}
                onChange={e => setForm(p => ({ ...p, whatsappNumber: e.target.value }))}
                placeholder="555 123 45 67"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enter your WhatsApp Business number. We will activate SARA within 24 hours.
            </p>
          </div>

          {/* 2. WhatsApp Profile Logo */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
                  {uploading ? (
                    <Loader2 size={20} className="animate-spin text-gray-300" />
                  ) : form.logo ? (
                    <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Bot size={28} className="text-gray-300" />
                  )}
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
                  Agent name <span className="text-gray-400 font-normal">(default: SARA)</span>
                </label>
                <input
                  value={form.saraName}
                  onChange={e => setForm(p => ({ ...p, saraName: e.target.value }))}
                  placeholder="SARA"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">The name your clients will see (e.g. Sara, Alex, Nour)</p>
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-3">Communication style</label>
                <div className="grid grid-cols-3 gap-3">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, saraStyle: s.id }))}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        form.saraStyle === s.id
                          ? 'border-navy-900 bg-navy-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
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

              {/* About */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  About your agency <span className="text-gray-400 font-normal">(SARA's brain)</span>
                </label>
                <textarea
                  value={form.saraAbout}
                  onChange={e => setForm(p => ({ ...p, saraAbout: e.target.value }))}
                  rows={5}
                  placeholder={`Tell SARA everything about your agency:\n- What makes you unique\n- Types of properties you focus on\n- Payment plans you offer\n- Key selling points\n- Anything else clients often ask`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1">The more detail you give, the better SARA performs for your agency.</p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : saved ? 'Saved! We\'ll activate SARA within 24h' : 'Save & Request Activation'}
          </button>

        </form>
      )}
    </div>
  );
}
