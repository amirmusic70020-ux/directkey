'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Building2, Upload, Image as ImageIcon } from 'lucide-react';

type Project = {
  id: string; name: string; agencyId: string; description: string;
  price: string; currency: string; location: string; type: string;
  bedrooms: string; area: string; status: string; imageUrl: string;
  facilities: string;
};

const EMPTY: Omit<Project, 'id' | 'agencyId'> = {
  name: '', description: '', price: '', currency: 'USD',
  location: '', type: 'Apartment', bedrooms: '', area: '',
  status: 'Available', imageUrl: '', facilities: '',
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

/** Smart compression: resize + reduce quality until base64 fits in Airtable (~75KB limit). */
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
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', quality);
        };

        // Try progressively smaller until under 75,000 chars (~56KB base64)
        let result = compress(800, 0.85);
        if (result.length > 75000) result = compress(600, 0.80);
        if (result.length > 75000) result = compress(400, 0.75);
        if (result.length > 75000) result = compress(300, 0.65);

        resolve(result);
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Project | null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState('');
  const [saveError, setSaveError] = useState('');
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
    setImgError('');
    setSaveError('');
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price, currency: p.currency,
      location: p.location, type: p.type, bedrooms: p.bedrooms, area: p.area,
      status: p.status, imageUrl: p.imageUrl, facilities: p.facilities ?? '',
    });
    setImgError('');
    setSaveError('');
    setShowForm(true);
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setImgError('Image must be smaller than 10 MB');
      return;
    }
    setImgUploading(true);
    setImgError('');
    try {
      const dataUrl = await resizeImage(file, 800);
      setForm(p => ({ ...p, imageUrl: dataUrl }));
    } catch {
      setImgError('Failed to process image — try another file.');
    } finally {
      setImgUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
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
    const body = editing ? { ...form, id: editing.id } : form;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `Server error (${res.status}) — check Vercel logs`);
        setSaving(false);
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
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-semibold text-navy-900">{editing ? 'Edit project' : 'Add new project'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* ── Image upload ─────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Property image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden">
                  {form.imageUrl ? (
                    <div className="relative group">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <label
                          htmlFor="proj-img-upload"
                          className="cursor-pointer flex items-center gap-2 bg-white/90 hover:bg-white text-navy-900 text-sm font-medium px-4 py-2 rounded-xl transition"
                        >
                          <Upload size={14} /> Replace
                        </label>
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, imageUrl: '' }))}
                          className="flex items-center gap-2 bg-red-500/90 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="proj-img-upload"
                      className="flex flex-col items-center justify-center gap-3 h-44 cursor-pointer hover:bg-gray-50 transition"
                    >
                      {imgUploading ? (
                        <Loader2 size={28} className="animate-spin text-gray-300" />
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <ImageIcon size={24} className="text-gray-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-navy-800">Click to upload image</p>
                            <p className="text-xs text-gray-400 mt-0.5">PNG · JPG · WebP — max 10 MB</p>
                          </div>
                        </>
                      )}
                    </label>
                  )}
                </div>
                <input
                  ref={fileRef}
                  id="proj-img-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
                {imgError && <p className="text-red-500 text-xs mt-1">{imgError}</p>}
              </div>

              {/* ── Project name ──────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Project name *</label>
                <input required value={form.name} onChange={f('name')} placeholder="Palm Residences"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>

              {/* ── Type + Status ─────────────────────────────────────── */}
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

              {/* ── Price + Currency ──────────────────────────────────── */}
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

              {/* ── Bedrooms + Area ───────────────────────────────────── */}
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

              {/* ── Location ─────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Location</label>
                <input value={form.location} onChange={f('location')} placeholder="Istanbul, Beylikdüzü"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm" />
              </div>

              {/* ── Description ──────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Description</label>
                <textarea value={form.description} onChange={f('description')} rows={3}
                  placeholder="Luxury sea-view apartment in prime location..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm resize-none" />
              </div>

              {/* ── Facilities checkboxes ─────────────────────────────── */}
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-3">Facilities & Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACILITIES.map(facility => {
                    const checked = isFacilityChecked(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition ${
                          checked
                            ? 'border-navy-900 bg-navy-50 text-navy-900'
                            : 'border-gray-100 hover:border-gray-300 text-gray-600'
                        }`}
                      >
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

              {/* ── Save error ───────────────────────────────────────── */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  ⚠️ {saveError}
                </div>
              )}

              {/* ── Buttons ───────────────────────────────────────────── */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving || imgUploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-3 rounded-xl transition">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Project list ──────────────────────────────────────────────── */}
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
          {projects.map(p => {
            const facilityList = p.facilities ? p.facilities.split(',').map(s => s.trim()).filter(Boolean) : [];
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
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
                  {p.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description}</p>}
                  {facilityList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {facilityList.slice(0, 5).map(f => (
                        <span key={f} className="text-[10px] bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full font-medium">
                          {f}
                        </span>
                      ))}
                      {facilityList.length > 5 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          +{facilityList.length - 5} more
                        </span>
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
