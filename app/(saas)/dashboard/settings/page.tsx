'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Save, Loader2, Check, ExternalLink, Upload, X } from 'lucide-react';

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

/** Resize image client-side to max 300px, compress as JPEG 80% quality.
 *  Result is a base64 data URL — typically 15–40 KB, safe for Airtable Long Text. */
function resizeImage(file: File, maxPx = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    address: '',
    theme:   'blue',
    logo:    '',
  });
  const [saved,      setSaved]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [uploading,  setUploading]  = useState(false);

  // Load agency data from API (not from session — logo can be large base64)
  useEffect(() => {
    if (!user?.agencyId) return;
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.error) return;
        setForm({
          name:    data.name    || '',
          phone:   data.phone   || '',
          address: data.address || '',
          theme:   data.theme   || 'blue',
          logo:    data.logo    || '',
        });
      })
      .catch(console.error);
  }, [user?.agencyId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo must be smaller than 5 MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const dataUrl = await resizeImage(file, 300);
      setForm(p => ({ ...p, logo: dataUrl }));
    } catch {
      setError('Failed to process image — try a different file.');
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (fileRef.current) fileRef.current.value = '';
    }
  }

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

    await update({ name: form.name, theme: form.theme, logo: form.logo });

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

        {/* Logo upload */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Agency logo</h2>
          <p className="text-xs text-gray-400 mb-5">
            Upload a PNG, JPG, or SVG — max 5 MB. Automatically resized & compressed.
          </p>

          <div className="flex items-center gap-5">
            {/* Preview */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {uploading ? (
                  <Loader2 size={20} className="animate-spin text-gray-300" />
                ) : form.logo ? (
                  <img src={form.logo} alt="Logo preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-bold">AG</span>
                    </div>
                  </div>
                )}
              </div>
              {form.logo && !uploading && (
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, logo: '' }))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
                  title="Remove logo"
                >
                  <X size={10} className="text-white" />
                </button>
              )}
            </div>

            {/* Upload button */}
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed cursor-pointer transition text-sm font-medium
                  ${uploading
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-navy-200 text-navy-700 hover:border-navy-400 hover:bg-navy-50'
                  }`}
              >
                {uploading ? (
                  <><Loader2 size={15} className="animate-spin" /> Processing…</>
                ) : (
                  <><Upload size={15} /> {form.logo ? 'Replace logo' : 'Upload logo'}</>
                )}
              </label>
              <p className="text-xs text-gray-400 mt-2">
                PNG · JPG · SVG · WebP — up to 5 MB
              </p>
            </div>
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
        <div className="bg-navy-50 rounded-2xl border border-navy-100 p-6">
          <h2 className="font-semibold text-navy-900 mb-1">Your agency site</h2>
          <p className="text-xs text-gray-500 mb-3">Share this link with your clients</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-navy-800 font-mono">
              {user?.subdomain}.directkey.app
            </code>
            <a
              href={`https://${user?.subdomain}.directkey.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-navy-900 text-white text-sm rounded-xl hover:bg-navy-800 transition font-medium"
            >
              <ExternalLink size={14} />
              Visit
            </a>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </button>

      </form>
    </div>
  );
}
