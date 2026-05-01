'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Save, Loader2, Check, ExternalLink, Image } from 'lucide-react';

const THEMES = [
  { id: 'blue',   label: 'Navy Blue',  bg: '#0F2147', ring: '#C9A96E' },
  { id: 'dark',   label: 'Charcoal',   bg: '#1a1a2e', ring: '#e94560' },
  { id: 'green',  label: 'Forest',     bg: '#1a3a2a', ring: '#4caf78' },
  { id: 'teal',   label: 'Teal',       bg: '#0d3349', ring: '#00b4d8' },
  { id: 'purple', label: 'Royal',      bg: '#2d1b69', ring: '#a78bfa' },
  { id: 'red',    label: 'Crimson',    bg: '#2d0a0a', ring: '#ef4444' },
  { id: 'gold',   label: 'Gold',       bg: '#1a1200', ring: '#f59e0b' },
  { id: 'slate',  label: 'Slate',      bg: '#1e293b', ring: '#94a3b8' },
  { id: 'rose',   label: 'Rose',       bg: '#1f0d14', ring: '#f43f5e' },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;

  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    address: '',
    theme:   'blue',
    logo:    '',
  });
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name:    user.name    || '',
        theme:   user.theme   || 'blue',
        logo:    user.logo    || '',
        phone:   user.phone   || '',
        address: user.address || '',
      }));
    }
  }, [user?.agencyId]); // only run once per session

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      setError('Failed to save settings');
      return;
    }

    // Update the NextAuth session so theme/name reflect immediately
    await update({ name: form.name, theme: form.theme });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your agency profile and appearance</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Agency info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-navy-900 mb-5">Agency information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Agency name</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Phone number</label>
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+971 50 000 0000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Office address</label>
              <input
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Dubai Marina, UAE"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Agency logo</h2>
          <p className="text-xs text-gray-400 mb-4">Paste a public image URL (PNG, JPG, SVG recommended)</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Image size={22} className="text-gray-300" />
              )}
            </div>
            <input
              value={form.logo}
              onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
              placeholder="https://your-cdn.com/logo.png"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
            />
          </div>
        </div>

        {/* Theme picker */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-navy-900 mb-2">Color theme</h2>
          <p className="text-xs text-gray-400 mb-5">Sets your agency site&apos;s primary color</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm(p => ({ ...p, theme: t.id }))}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                  form.theme === t.id ? 'border-navy-900 bg-navy-50' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: t.bg }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.ring }} />
                </div>
                <p className="text-xs font-medium text-navy-900 text-left">{t.label}</p>
                {form.theme === t.id && <Check size={14} className="text-navy-900 ml-auto flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Your site link */}
        <div className="bg-navy-50 rounde