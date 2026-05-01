'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Building2, Upload, ImageIcon } from 'lucide-react';

type Project = {
  id: string; name: string; agencyId: string; description: string;
  price: string; currency: string; location: string; type: string;
  bedrooms: string; area: string; status: string; imageUrl: string;
  images: string[]; facilities: string;
};

const EMPTY: Omit<Project, 'id' | 'agencyId'> = {
  name: '', description: '', price: '', currency: 'USD',
  location: '', type: 'Apartment', bedrooms: '', area: '',
  status: 'Available', imageUrl: '', images: [], facilities: '',
};

const TYPES    = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Residential Complex', 'Tower', 'Compound', 'Office', 'Land', 'Commercial'];
const STATUSES = ['Available', 'Reserved', 'Sold'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'TRY', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR'];

const FACILITIES = [
  'Swimming Pool', 'Gym', 'Parking', '24h Security', 'Concierge',
  'Spa', 'Kids Area', 'Beach Access', 'Sea View', 'Garden',
  'Balcony', 'Smart Home', 'Central A/C', 'Sauna', 'Tennis Court',
  'BBQ Area', 'Jogging Track', 'Retail Outlets', 'Maids Room', 'Storage Room',
];

export default function ProjectsPage() {
  const [projects, setProjects]       = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [editing, setEditing]         = useState<Project | null>(null);
  const [form, setForm]               = useState({ ...EMPTY });
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [uploadingImgs, setUploadingImgs] = useState(false);
  const [saveError, setSaveError]     = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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
    setSaveError('');
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price, currency: p.currency,
      location: p.location, type: p.type, bedrooms: p.bedrooms, area: p.area,
      status: p.status, imageUrl: p.images?.[0] ?? p.imageUrl,
      images: p.images ?? [], facilities: p.facilities ?? '',
    });
    setSaveError('');
    setShowForm(true);
  }

  async function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImgs(true);
    setSaveError('');
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Upload failed');
        }
        const { url } = await res.json();
        urls.push(url);
      }
      setForm(p => ({ ...p, images: [...p.images, ...urls] }));
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setUploadingImgs(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeImage(idx: number) {
    setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  }

  function moveImage(from: number, to: number) {
    setForm(p => {
      const imgs = [...p.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...p, images: imgs };
    });
  }

  function toggleFacility(name: string) {
    setForm(p => {
      const current = p.facilities ? p.facilities.split(',').map(s => s.trim()).filter(Boolean) : [];
      const exists  = current.includes(name);
      const updated = exists ? current.filter(f => f !== name) : [...current, name];
      return { ...p, facilities: updated.join(',') };
    });
  }

  function isFacilityChecked(name: string) {
    if (!form.facilities) return false;
    return form.facilities.split(',').map(s => s.trim()).includes(name);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    const body = editing
      ? { ...form, id: editing.id }
      : form;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `Error ${res.status}`);
        return;
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setSaveError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
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

  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Add your property listings — SARA uses these to answer buyer questions</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition">
          <Plus size={16} /> Add project
        </button>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-semibold text-navy-900">{editing ? 'Edit project' : 'Add new project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* ── Image gallery upload ───────────────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">
                  Property photos
                  <span className="text-gray-400 font-normal ml-2">— first photo is the cover</span>
                </label>

                {/* Grid of uploaded images */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {form.images.map((url, i) => (
                      <div key={url} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {/* Cover badge */}
                        {i === 0 && (
                          <div className="absolute top-1.5 left-1.5 bg-navy-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Cover
                          </div>
                        )}
                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          {i > 0 && (
                            <button type="button" onClick={() => moveImage(i, i - 1)}
                              className="bg-white/90 text-navy-900 text-xs font-semibold px-2 py-1 rounded-lg">
                              ← Move
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(i)}
                            className="bg-red-500/90 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                <label htmlFor="proj-imgs"
                  className={`flex items-center justify-center gap-3 h-20 rounded-2xl border-2 border-dashed cursor-pointer transition
                    ${uploadingImgs ? 'border-gray-200 bg-gray-50' : 'border-navy-200 hover:border-navy-400 hover:bg-navy-50'}`}>
                  {uploadingImgs ? (
                    <><Loader2 size={18} className="animate-spin text-gray-400" /><span className="text-sm text-gray-400">Uploading…</span></>
                  ) : (
                    <><Upload size={18} className="text-navy-500" /><span className="text-sm font-medium text-navy-700">
                      {form.images.length ? 'Add more photos' : 'Upload photos'} — click or drag
                    </span></>
                  )}
                </label>
                <input ref={fileRef} id="proj-imgs" type="file" accept="image/*" multiple
                  onChange={handleImageFiles} className="hidden" />
                <p className="text-xs text-gray-400 mt-1">PNG · JPG · WebP — multiple files supported · max 10 MB each</p>
              </div>

              {/* ── Project name ─────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Project name *</label>
                <input required value={form.name} onChange={f('name')} placeholder="Palm Residences"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>

              {/* ── Type + Status ─────────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Type</label>
                  <select value={form.type} onChange={f('type')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm bg-white">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Status</label>
                  <select value={form.status} onChange={f('status')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm bg-white">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Price + Currency ─────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Price</label>
                  <input value={form.price} onChange={f('price')} placeholder="500000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Currency</label>
                  <select value={form.currency} onChange={f('currency')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm bg-white">
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Bedrooms + Area ──────────────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Bedrooms</label>
                  <input value={form.bedrooms} onChange={f('bedrooms')} placeholder="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-900 mb-1.5">Area (m²)</label>
                  <input value={form.area} onChange={f('area')} placeholder="150"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
                </div>
              </div>

              {/* ── Location ─────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Location</label>
                <input value={form.location} onChange={f('location')} placeholder="Istanbul, Maslak"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>

              {/* ── Description ──────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Description</label>
                <textarea value={form.description} onChange={f('description')} rows={4}
                  placeholder="Luxury sea-view apartment in prime location..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm resize-none" />
              </div>

              {/* ── Facilities ───────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">Facilities & Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACILITIES.map(facility => {
                    const checked = isFacilityChecked(facility);
                    return (
                      <button key={facility} type="button" onClick={() => toggleFacility(facility)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition ${
                          checked ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-gray-100 hover:border-gray-300 text-gray-600'
                        }`}>
                        <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition ${
                          checked ? 'bg-navy-900 border-navy-900' : 'border-gray-300'
                        }`}>
                          {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-medium leading-tight">{facility}</span>
                      </button>
                    );
                  })}
                </div>
                {form.facilities && (
                  <p className="text-xs text-gray-400 mt-2">
                    {form.facilities.split(',').filter(Boolean).length} selected
                  </p>
                )}
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  ⚠️ {saveError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploadingImgs}
                  className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Project list ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No projects yet</p>
          <button onClick={openAdd}
            className="mt-5 inline-flex items-center gap-2 bg-navy-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-navy-800 transition">
            <Plus size={15} /> Add first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => {
            const thumb = p.images?.[0] ?? p.imageUrl;
            const facilityList = p.facilities ? p.facilities.split(',').map(s => s.trim()).filter(Boolean) : [];
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
                {thumb ? (
                  <img src={thumb} alt={p.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
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
                      {p.images?.length > 0 && (
                        <span className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon size={10} /> {p.images.length}
                        </span>
                      )}
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                        {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    {p.price && <span className="font-semibold text-navy-800">{p.currency} {Number(p.price).toLocaleString()}</span>}
                    {p.bedrooms && <span>{p.bedrooms} bed</span>}
                    {p.area && <span>{p.area} m²</span>}
                  </div>
                  {facilityList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {facilityList.slice(0, 4).map(f => (
                        <span key={f} className="text-[10px] bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full font-medium">{f}</span>
                      ))}
                      {facilityList.length > 4 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">+{facilityList.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
