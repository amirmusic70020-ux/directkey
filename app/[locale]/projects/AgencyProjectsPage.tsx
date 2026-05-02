import { Building2, MapPin, BedDouble, Maximize2, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import type { Agency } from '@/lib/agencies';
import type { Project } from '@/lib/projects';

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

function formatPrice(price: string, currency: string) {
  if (!price) return null;
  const num = parseFloat(price.replace(/[^\d.]/g, ''));
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: currency || 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(num);
}

interface Props {
  agency: Agency | null;
  projects: Project[];
}

export default function AgencyProjectsPage({ agency, projects }: Props) {
  const theme  = THEME_COLORS[agency?.theme ?? 'blue'] ?? THEME_COLORS.blue;
  const waNum  = (agency?.phone || '').replace(/[^\d]/g, '');

  const available = projects.filter(p => p.status.toLowerCase() === 'available');
  const ordered   = [...available, ...projects.filter(p => p.status.toLowerCase() !== 'available')];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header bar */}
      <header style={{ backgroundColor: theme.bg }} className="py-10 px-5">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="inline-flex items-center gap-2 text-sm mb-6 opacity-60 hover:opacity-100 transition"
            style={{ color: theme.accent }}>
            <ArrowLeft size={14} /> Back to home
          </a>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: theme.accent }}>
                All Listings
              </p>
              <h1 className="text-3xl font-bold text-white">
                {agency?.name ?? 'Properties'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {ordered.length} {ordered.length === 1 ? 'property' : 'properties'} ·{' '}
                {available.length} available
              </p>
            </div>
            {waNum && (
              <a
                href={`https://wa.me/${waNum}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm px-5 py-3 rounded-xl transition"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-5 py-12">
        {ordered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Building2 size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordered.map(p => {
              const price = formatPrice(p.price, p.currency);
              const statusStyle =
                p.status.toLowerCase() === 'available' ? { bg: '#dcfce7', text: '#15803d' } :
                p.status.toLowerCase() === 'reserved'  ? { bg: '#fef9c3', text: '#a16207' } :
                                                         { bg: '#fee2e2', text: '#b91c1c' };
              return (
                <a
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100 focus:outline-none"
                  style={{ textDecoration: 'none' }}
                >
                  {/* Image */}
                  <div className="h-56 bg-gray-100 relative overflow-hidden flex-shrink-0">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={36} className="text-gray-300" />
                      </div>
                    )}
                    {p.type && (
                      <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-lg text-white"
                        style={{ backgroundColor: theme.accent }}>
                        {p.type}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-lg"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                      {p.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    {p.location && (
                      <p className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                        <MapPin size={11} /> {p.location}
                      </p>
                    )}
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-2">{p.name}</h3>
                    {price ? (
                      <p className="text-lg font-bold mb-3" style={{ color: theme.accent }}>{price}</p>
                    ) : (
                      <p className="text-sm text-gray-400 mb-3">Price on request</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {p.bedrooms && (
                        <span className="flex items-center gap-1.5">
                          <BedDouble size={14} />
                          {p.bedrooms} Bed{parseInt(p.bedrooms) !== 1 ? 's' : ''}
                        </span>
                      )}
                      {p.area && (
                        <span className="flex items-center gap-1.5">
                          <Maximize2 size={14} />
                          {p.area} m²
                        </span>
                      )}
                    </div>
                    <div className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 group-hover:bg-gray-700 transition-colors">
                      View Details <ArrowRight size={14} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
