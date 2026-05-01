'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Check, MessageCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function SaraPage() {
  const [form, setForm] = useState({ whatsappPhoneId: '', whatsappToken: '' });
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState('');

  useEffect(() => {
    fetch('/api/sara')
      .then(r => r.json())
      .then(d => {
        setForm({ whatsappPhoneId: d.whatsappPhoneId || '', whatsappToken: d.whatsappToken || '' });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/sara', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError('Failed to save'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const isConnected = !!(form.whatsappPhoneId && form.whatsappToken);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">SARA — AI Agent</h1>
        <p className="text-gray-500 text-sm mt-1">Connect your WhatsApp Business account to activate SARA</p>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6 ${
        isConnected ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
        <p className="text-sm font-medium">
          {isConnected ? 'SARA is active and ready to respond' : 'Not connected yet — add your WhatsApp credentials below'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">

          {/* Credentials */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle size={18} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-navy-900">WhatsApp Business API</h2>
                <p className="text-xs text-gray-400">From Meta Business → WhatsApp → API Setup</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Phone Number ID
                </label>
                <input
                  value={form.whatsappPhoneId}
                  onChange={e => setForm(p => ({ ...p, whatsappPhoneId: e.target.value }))}
                  placeholder="109876543210123"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Found in Meta for Developers → WhatsApp → Getting Started</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">
                  Permanent Access Token
                </label>
                <input
                  type="password"
                  value={form.whatsappToken}
                  onChange={e => setForm(p => ({ ...p, whatsappToken: e.target.value }))}
                  placeholder="EAAxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">Generate a permanent token from System Users in Meta Business Manager</p>
              </div>
            </div>
          </div>

          {/* Webhook info */}
          <div className="bg-navy-50 rounded-2xl border border-navy-100 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-navy-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-navy-900 text-sm mb-2">Webhook setup (one-time)</h3>
                <p className="text-xs text-gray-600 mb-3">
                  In Meta for Developers → WhatsApp → Configuration, set your webhook URL and verify token:
                </p>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg px-3 py-2 border border-navy-100">
                    <p className="text-xs text-gray-400">Webhook URL</p>
                    <code className="text-xs text-navy-800 font-mono">https://directkey.app/api/whatsapp</code>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-navy-100">
                    <p className="text-xs text-gray-400">Verify Token</p>
                    <code className="text-xs text-navy-800 font-mono">directkey-sara-2024</code>
                  </div>
                </div>
                <a
                  href="https://developers.facebook.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-navy-700 font-medium mt-3 hover:underline"
                >
                  Open Meta for Developers <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save credentials'}
          </button>
        </form>
      )}
    </div>
  );
}
