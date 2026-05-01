'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Building2 } from 'lucide-react';

type Project = {
  id: string; name: string; agencyId: string; description: string;
  price: string; currency: string; location: string; type: string;
  bedrooms: string; area: string; status: string; imageUrl: string;
};

const EMPTY: Omit<Project, 'id' | 'agencyId'> = {
  name: '', description: '', price: '', currency: 'USD',
  location: '', type: 'Apartment', bedrooms: '', area: '', status: 'Available', imageUrl: '',
};

const TYPES    = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Office', 'Land', 'Commercial'];
const STATUSES = ['Available', 'Reserved', 'Sold'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Project | null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res  = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price, currency: p.currency,
      location: p.location, type: p.type, bedrooms: p.bedrooms, area: p.area,
      status: p.status, imageUrl: p.imageUrl,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = editing ? { ...form, id: editing.id } : form;
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    setDeleting(id);
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Add your property listings — SARA uses these to answer buyer questions</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus size={16} /> Add project
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-navy-900">{editing ? 'Edit project' : 'Add new project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Project name *</label>
                <input required value={form.name} onChange={f('name')} placeholder="Palm Residences"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">Type</label>
                  <select value={form.type} onChange={f('type')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm bg-white">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">Status</label>
                  <select value={form.status} onChange={f('status')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm bg-white">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">Price</label>
                  <input value={form.price} onChange={f('price')} placeholder="500000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">Currency</label>
                  <input value={form.currency} onChange={f('currency')} placeholder="USD"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">Bedrooms</label>
                  <input value={form.bedrooms} onChange={f('bedrooms')} placeholder="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1">Area (m²)</label>
                  <input value={form.area} onChange={f('area')} placeholder="150"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Location</label>
                <input value={form.location} onChange={f('location')} placeholder="Istanbul, Beylikdüzü"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Description</label>
                <textarea value={form.description} onChange={f('description')} rows={3}
                  placeholder="Luxury sea-view apartment in prime location..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1">Image URL</label>
                <input value={form.imageUrl} onChange={f('imageUrl')} placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No projects yet</p>
          <p className="text-gray-300 text-xs mt-1">Add your first property listing so SARA can answer buyer questions</p>
          <button onClick={openAdd}
            className="mt-5 inline-flex items-center gap-2 bg-navy-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-navy-800 transition">
            <Plus size={15} /> Add first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Building2 size={22} className="text-gray-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-navy-900 text-sm">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.type} · {p.location}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === 'Available' ? 'bg-green-50 text-green-700' :
                      p.status === 'Reserved'  ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                      {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {p.price && <span className="font-semibold text-navy-800">{p.currency} {Number(p.price).toLocaleString()}</span>}
                  {p.bedrooms && <span>{p.bedrooms} bed</span>}
                  {p.area && <span>{p.area} m²</span>}
                </div>
                {p.description && <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{p.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
