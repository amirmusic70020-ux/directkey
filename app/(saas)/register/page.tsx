'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', subdomain: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'subdomain' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '') : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    router.push('/login?registered=1');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-navy-900 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-gold-400" />
            </div>
            <span className="text-xl font-bold text-navy-900">DirectKey</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 mb-1">Start your free trial</h1>
          <p className="text-gray-500 text-sm">14 days free. No credit card required.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Agency name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="RE/MAX Dubai"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Subdomain</label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-navy-500">
                <input
                  name="subdomain"
                  value={form.subdomain}
                  onChange={handleChange}
                  required
                  placeholder="remax"
                  className="flex-1 px-4 py-3 text-sm focus:outline-none"
                />
                <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-l border-gray-200 whitespace-nowrap">
                  .directkey.app
                </span>
              </div>
              {form.subdomain && (
                <p className="text-xs text-gray-400 mt-1">
                  Your site: <span className="text-navy-700 font-medium">{form.subdomain}.directkey.app</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@agency.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-navy-950 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create free account'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By registering you agree to our{' '}
              <Link href="/terms" className="underline">Terms</Link> and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-navy-800 font-semibold hover:text-gold-600 transition">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
