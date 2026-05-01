'use client';

import { useState } from 'react';
import {
  MapPin, BedDouble, Maximize2, ChevronLeft, ChevronRight,
  MessageCircle, Calendar, ArrowLeft, CheckCircle, Building2,
  Waves, Dumbbell, Car, Shield, Sparkles, Baby, Umbrella,
  Eye, Leaf, Wind, Cpu, Thermometer, Trophy, Phone, Mail,
} from 'lucide-react';
import type { Project } from '@/lib/projects';
import type { Agency } from '@/lib/agencies';

// ── Facility → icon ─────────────────────────────────────────────────────────
const FACILITY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'Swimming Pool': Waves,
  'Gym':           Dumbbell,
  'Parking':       Car,
  '24h Security':  Shield,
  'Concierge':     Sparkles,
  'Spa':           Sparkles,
  'Kids Area':     Baby,
  'Beach Access':  Umbrella,
  'Sea View':      Eye,
  'Garden':        Leaf,
  'Balcony':       Wind,
  'Smart Home':    Cpu,
  'Central A/C':   Thermometer,
  'Sauna':         Thermometer,
  'Tennis Court':  Trophy,
};

// ── Theme map ────────────────────────────────────────────────────────────────
const THEME_COLORS: Record<string, { bg: string; accent: string; badge: string }> = {
  blue:   { bg: '#0F2147', accent: '#C9A96E', badge: '#C9A96E20' },
  dark:   { bg: '#1a1a2e', accent: '#e94560', badge: '#e9456020' },
  green:  { bg: '#1a3a2a', accent: '#4caf78', badge: '#4caf7820' },
  teal:   { bg: '#0d3349', accent: '#00b4d8', badge: '#00b4d820' },
  purple: { bg: '#2d1b69', accent: '#a78bfa', badge: '#a78bfa20' },
  red:    { bg: '#2d0a0a', accent: '#ef4444', badge: '#ef444420' },
  gold:   { bg: '#1a1200', accent: '#f59e0b', badge: '#f59e0b20' },
  slate:  { bg: '#1e293b', accent: '#94a3b8', badge: '#94a3b820' },
  rose:   { bg: '#1f0d14', accent: '#f43f5e', badge: '#f43f5e20' },
};

function statusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'available') return { bg: '#d1fae5', text: '#065f46' };
  if (s === 'reserved')  return { bg: '#fef3c7', text: '#92400e' };
  if (s === 'sold')      return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#f3f4f6', text: '#374151' };
}

function formatPrice(price: string, currency: string) {
  if (!price) return null;
  const num = parseFloat(price.replace(/[^\d.]/g, ''));
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currency || 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(num);
}

// ── Component ────────────────────────────────────────────────────────────────
interface Props {
  project: Project;
  agency: Agency;
}

export default function AgencyProjectDetail({ project, agency }: Props) {
  const [activeImg, setActiveImg] = useState(0);

  const theme      = THEME_COLORS[agency.theme] ?? THEME_COLORS.blue;
  const waNumber   = (agency.phone || '').replace(/[^\d]/g, '');
  const status     = statusColor(project.status);
  const price      = formatPrice(project.price, project.currency);
  const facilities = project.facilities
    ? project.facilities.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Images: prefer the full array, fall back to single thumbnail
  const images = project.images?.length
    ? project.images
    : project.imageUrl
    ? [project.imageUrl]
    : [];

  const nextImg = () => setActiveImg(i => (i + 1) % images.length);
  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length);

  const enquireText = encodeURIComponent(
    `Hi, I'm interested in ${project.name}. Can you provide more details?`
  );
  const visitText = encodeURIComponent(
    `Hi, I'd like to book a visit for ${project.name}. When would be a good time?`
  );
  const waEnquire = waNumber ? `https://wa.me/${waNumber}?text=${enquireText}` : null;
  const waVisit   = waNumber ? `https://wa.me/${waNumber}?text=${visitText}`   : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <div style={{ backgroundColor: theme.bg }} className="sticky top-0 z-40 py-4 px-5 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition"
          >
            <ArrowLeft size={16} />
            Back to listings
          </button>
          <div className="flex items-center gap-3">
            {agency.logo ? (
              <img src={agency.logo} alt={agency.name} className="h-8 object-contain" />
            ) : (
              <span className="text-white font-bold text-sm">{agency.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* ── Left: image gallery ── */}
          <div className="lg:col-span-3">

            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[4/3] mb-3 shadow-md">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 size={56} className="text-gray-300" />
                </div>
              )}

              {/* Status badge */}
              <div
                className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full shadow"
                style={{ backgroundColor: status.bg, color: status.text }}
              >
                {project.status}
              </div>

              {/* Type badge */}
              {project.type && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {project.type}
                </div>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  {activeImg + 1} / {images.length}
                </div>
              )}

              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-xl shadow transition"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-xl shadow transition"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all"
                    style={{
                      borderColor: i === activeImg ? theme.accent : 'transparent',
                      opacity:     i === activeImg ? 1 : 0.55,
                    }}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description — visible below gallery on mobile / desktop */}
            {project.description && (
              <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">
                  Overview
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
              </div>
            )}

            {/* Facilities grid — below description on larger screens */}
            {facilities.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">
                  Amenities & Facilities
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {facilities.map(fac => {
                    const Icon = FACILITY_ICONS[fac];
                    return (
                      <div key={fac} className="flex items-center gap-2.5 text-sm text-gray-700">
                        {Icon ? (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.badge }}
                          >
                            <Icon size={15} style={{ color: theme.accent }} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={15} className="text-emerald-500" />
                          </div>
                        )}
                        {fac}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: details + CTA ── */}
          <div className="lg:col-span-2 lg:sticky lg:top-24">

            {/* Title + location */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {project.name}
            </h1>
            {project.location && (
              <p className="flex items-center gap-1.5 text-gray-500 text-sm mb-5">
                <MapPin size={14} />
                {project.location}
              </p>
            )}

            {/* Price */}
            {price ? (
              <p className="text-3xl font-bold mb-6" style={{ color: theme.accent }}>
                {price}
              </p>
            ) : (
              <p className="text-gray-400 text-sm mb-6 italic">Price on request</p>
            )}

            {/* Stats row */}
            {(project.bedrooms || project.area) && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {project.bedrooms && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <BedDouble size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Bedrooms</p>
                      <p className="text-sm font-bold text-gray-900">{project.bedrooms}</p>
                    </div>
                  </div>
                )}
                {project.area && (
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Maximize2 size={20} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] text-gray-400 font-medium">Area</p>
                      <p className="text-sm font-bold text-gray-900">{project.area} m²</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3 mb-8">
              {waEnquire && (
                <a
                  href={waEnquire}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-2xl transition text-sm shadow-md hover:shadow-lg"
                >
                  <MessageCircle size={20} />
                  Enquire on WhatsApp
                </a>
              )}
              {waVisit && (
                <a
                  href={waVisit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 font-bold py-4 rounded-2xl transition text-sm border-2 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm"
                >
                  <Calendar size={20} />
                  Book a Visit
                </a>
              )}
            </div>

            {/* Agency card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Listed by</p>
              <div className="flex items-center gap-3 mb-3">
                {agency.logo ? (
                  <img src={agency.logo} alt={agency.name} className="w-10 h-10 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.badge }}
                  >
                    <Building2 size={18} style={{ color: theme.accent }} />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900 text-sm">{agency.name}</p>
                  {agency.address && <p className="text-xs text-gray-400 mt-0.5">{agency.address}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {agency.phone && (
                  <a
                    href={`tel:${agency.phone}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition"
                  >
                    <Phone size={12} />
                    {agency.phone}
                  </a>
                )}
                {agency.email && (
                  <a
                    href={`mailto:${agency.email}`}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition"
                  >
                    <Mail size={12} />
                    {agency.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Floating WhatsApp ── */}
      {waEnquire && (
        <a
          href={waEnquire}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-4 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition-all"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={22} />
          <span className="text-sm hidden sm:block">Chat with us</span>
        </a>
      )}
    </div>
  );
}
