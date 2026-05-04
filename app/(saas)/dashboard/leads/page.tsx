'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send, MessageCircle, Users, Flame, TrendingUp, AlertCircle, Search, RefreshCw } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  phone: string;
  budget: string;
  purpose: string;
  score: number;
  status: string;
  projectInterest: string;
  summary: string;
  requiresHuman: boolean;
  createdAt: string;
  channel: 'whatsapp' | 'telegram';
};

type Stats = {
  total: number;
  hot: number;
  mid: number;
  cold: number;
  thisWeek: number;
  needsHuman: number;
};

function ScoreBadge({ score }: { score: number }) {
  if (score > 3) return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Hot</span>;
  if (score >= 2) return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Mid</span>;
  return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">Cold</span>;
}

function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'telegram')
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">✈ Telegram</span>;
  return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">● WhatsApp</span>;
}

function timeAgo(dateStr: string) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

export default function LeadsPage() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [sendOk, setSendOk]     = useState(false);

  async function fetchLeads(f = filter) {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/leads?filter=${f}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setStats(data.stats || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLeads(); }, []);

  function changeFilter(f: string) {
    setFilter(f);
    fetchLeads(f);
  }

  const filtered = leads.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.projectInterest.toLowerCase().includes(search.toLowerCase())
  );

  async function sendFollowUp() {
    if (!selected || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/dashboard/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selected.phone, message, channel: selected.channel }),
      });
      if (res.ok) {
        setSendOk(true);
        setMessage('');
        setTimeout(() => setSendOk(false), 3000);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Leads</h1>
          <p className="text-gray-400 text-sm mt-0.5">All conversations handled by SARA</p>
        </div>
        <button onClick={() => fetchLeads()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total leads',   value: stats.total,      icon: Users,       color: 'text-navy-700',   bg: 'bg-navy-50'   },
            { label: 'Hot leads',     value: stats.hot,        icon: Flame,       color: 'text-red-600',    bg: 'bg-red-50'    },
            { label: 'This week',     value: stats.thisWeek,   icon: TrendingUp,  color: 'text-green-600',  bg: 'bg-green-50'  },
            { label: 'Needs human',   value: stats.needsHuman, icon: AlertCircle, color: 'text-amber-600',  bg: 'bg-amber-50'  },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-6">

        {/* Left — Lead list */}
        <div className="flex-1 min-w-0">

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex gap-2">
              {['all','hot','mid','cold'].map(f => (
                <button key={f} onClick={() => changeFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                    filter === f
                      ? 'bg-navy-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>{f}</button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, phone…"
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No leads found</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(lead => (
                  <button key={lead.id} onClick={() => setSelected(lead)}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition flex items-center gap-4 ${selected?.id === lead.id ? 'bg-navy-50' : ''}`}>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                      {(lead.name || '?')[0].toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-navy-900 text-sm">{lead.name}</span>
                        {lead.requiresHuman && <AlertCircle size={12} className="text-amber-500" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{lead.summary || lead.projectInterest || lead.phone}</p>
                    </div>
                    {/* Right */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <ScoreBadge score={lead.score} />
                      <ChannelBadge channel={lead.channel} />
                      <span className="text-[10px] text-gray-300">{timeAgo(lead.createdAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Lead detail + follow up */}
        <div className="w-80 flex-shrink-0">
          {selected ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sticky top-8">
              {/* Name + badges */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-navy-900">{selected.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{selected.phone}</p>
                </div>
                <ScoreBadge score={selected.score} />
              </div>

              {/* Fields */}
              <div className="space-y-2.5 mb-5">
                {[
                  { label: 'Channel',  value: selected.channel === 'telegram' ? '✈ Telegram' : '● WhatsApp' },
                  { label: 'Budget',   value: selected.budget },
                  { label: 'Purpose',  value: selected.purpose },
                  { label: 'Project',  value: selected.projectInterest },
                  { label: 'Status',   value: selected.status },
                ].map(f => f.value && f.value !== '—' ? (
                  <div key={f.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 w-16">{f.label}</span>
                    <span className="text-xs font-medium text-navy-900 text-right flex-1">{f.value}</span>
                  </div>
                ) : null)}
              </div>

              {/* Summary */}
              {selected.summary && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
                  <p className="text-xs text-gray-400 mb-1">SARA summary</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{selected.summary}</p>
                </div>
              )}

              {/* Follow up */}
              <div>
                <p className="text-xs font-semibold text-navy-900 mb-2">Send follow-up</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Type your message…"
                  className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-navy-500 leading-relaxed"
                />
                <button onClick={sendFollowUp} disabled={sending || !message.trim()}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {sendOk ? 'Sent!' : sending ? 'Sending…' : `Send via ${selected.channel === 'telegram' ? 'Telegram' : 'WhatsApp'}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center sticky top-8">
              <MessageCircle size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Select a lead to view details and send a follow-up</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
