/**
 * AgencySite — renders an agency's branded real-estate site.
 * Used by app/[locale]/page.tsx when a subdomain header is detected.
 * Lives inside the [locale] layout so html/body structure is correct.
 */

import { Building2, MessageCircle, MapPin, BedDouble, Maximize2, Phone, Mail, ExternalLink, Bot, Waves, Dumbbell, Car, Shield, Sparkles, Baby, Umbrella, Eye, Leaf, Wind, Cpu, Thermometer, Trophy, ArrowRight, Search, CalendarCheck, KeyRound } from 'lucide-react';
import type { Agency } from '@/lib/agencies';
import type { Project } from '@/lib/projects';

// Theme color map — matches Settings page choices
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

// Maps facility name → icon component
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

function AgencyProjectCard({ project, accent }: { project: Project; accent: string }) {
  const price = formatPrice(project.price, project.currency);
  const status = project.status;
  const statusBadgeStyle =
    status.toLowerCase() === 'available' ? { bg: '#dcfce7', text: '#15803d' } :
    status.toLowerCase() === 'reserved'  ? { bg: '#fef9c3', text: '#a16207' } :
                                           { bg: '#fee2e2', text: '#b91c1c' };

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-100">
      {/* Image */}
      <div className="h-72 bg-gray-100 relative overflow-hidden flex-shrink-0">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={40} className="text-gray-300" />
          </div>
        )}
        {/* Type badge — left */}
        {project.type && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-lg"
            style={{ backgroundColor: accent, color: '#fff' }}>
            {project.type}
          </span>
        )}
        {/* Status badge — right */}
        <span className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-lg"
          style={{ backgroundColor: statusBadgeStyle.bg, color: statusBadgeStyle.text }}>
          {status}
        </span>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {project.location && (
          <p className="text-gray-400 text-xs flex items-center gap-1 mb-1">
            <MapPin size={11} /> {project.location}
          </p>
        )}
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">{project.name}</h3>

        {/* Price */}
        {price ? (
          <p className="text-lg font-bold mb-3" style={{ color: accent }}>{price}</p>
        ) : (
          <p className="text-sm text-gray-400 mb-3">Price on request</p>
        )}

        {/* Beds + Area */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
          {project.bedrooms && (
            <span className="flex items-center gap-1.5">
              <BedDouble size={14} />
              {project.bedrooms} Bed{parseInt(project.bedrooms) !== 1 ? 's' : ''}
            </span>
          )}
          {project.area && (
            <span className="flex items-center gap-1.5">
              <Maximize2 size={14} />
              {project.area} m²
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 group-hover:bg-gray-700 transition-colors">
            View Details <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  agency: Agency | null;
  projects: Project[];
}

export default function AgencySite({ agency, projects }: Props) {
  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 size={40} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl font-bold text-gray-700">Agency not found</h1>
          <p className="text-gray-400 text-sm mt-2">This agency doesn't exist or hasn't been set up yet.</p>
        </div>
      </div>
    );
  }

  const theme     = THEME_COLORS[agency.theme] ?? THEME_COLORS.blue;
  const waNumber  = (agency.phone || '').replace(/[^\d]/g, '');

  const available = projects.filter(p => p.status.toLowerCase() === 'available');
  const ordered   = [...available, ...projects.filter(p => p.status.toLowerCase() !== 'available')];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <header style={{ backgroundColor: theme.bg }} className="relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: theme.accent }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agency.logo ? (
              <img src={agency.logo} alt={agency.name} className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.accent}20` }}>
                <Bot size={20} style={{ color: theme.accent }} />
              </div>
            )}
            <span className="text-white font-bold text-lg">{agency.name}</span>
          </div>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-24">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: theme.accent }}>
            Real Estate Agency
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-5 leading-tight max-w-2xl">
            {agency.name}
          </h1>
          {agency.description && (
            <p className="text-gray-300 text-lg mb-8 max-w-xl leading-relaxed">
              {agency.description}
            </p>
          )}
          {!agency.description && (
            <p className="text-gray-300 text-lg mb-8 max-w-xl leading-relaxed">
              Premium properties in Turkey's most desirable locations.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <a href="#properties"
              className="flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition"
              style={{ backgroundColor: theme.accent, color: '#fff' }}>
              Explore Properties <ArrowRight size={15} />
            </a>
            {waNumber && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-xl transition backdrop-blur-sm">
                <MessageCircle size={15} /> Talk to Us
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
            <div>
              <p className="text-white font-bold text-3xl">{projects.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Total Listings</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-white font-bold text-3xl">{available.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Available Now</p>
            </div>
            {agency.address && (
              <>
                <div className="w-px bg-white/10" />
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin size={14} style={{ color: theme.accent }} />
                  {agency.address}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.accent }}>Simple Process</p>
            <h2 className="text-3xl font-bold text-gray-900">How to Buy in 3 Steps</h2>
            <p className="text-gray-400 text-sm mt-2">We guide you from search to keys — with full transparency</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Search,       step: '01', title: 'Browse & Choose',    desc: 'Explore our curated listings and shortlist the properties that match your needs and budget.' },
              { icon: CalendarCheck, step: '02', title: 'Book a Consultation', desc: 'Speak with our experts via WhatsApp or call. We answer every question and arrange viewings.' },
              { icon: KeyRound,     step: '03', title: 'Close & Move In',    desc: 'We handle all paperwork, legal checks, and title deed transfer. You just sign and get your keys.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative text-center px-4">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accent}15` }}>
                  <Icon size={28} style={{ color: theme.accent }} />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: theme.accent, color: '#fff' }}>
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties — show top 3 on homepage */}
      <main id="properties" className="max-w-6xl mx-auto px-5 py-14">
        {ordered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Building2 size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1">Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Our Properties</h2>
                <p className="text-gray-400 text-sm mt-0.5">Click any property to see full details</p>
              </div>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: theme.badge, color: theme.accent }}
              >
                {ordered.length} listings
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordered.slice(0, 3).map(p => (
                <a
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block group focus:outline-none focus-visible:ring-2 rounded-2xl"
                  style={{ textDecoration: 'none' }}
                >
                  <AgencyProjectCard project={p} accent={theme.accent} />
                </a>
              ))}
            </div>

            {/* View All button */}
            <div className="mt-10 text-center">
              <a
                href="/projects"
                className="inline-flex items-center gap-2 font-semibold text-sm px-8 py-4 rounded-2xl border-2 transition hover:opacity-90"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                View All {ordered.length} Properties <ArrowRight size={16} />
              </a>
            </div>
          </>
        )}
      </main>

      {/* FAQ */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.accent }}>FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-400 text-sm mt-2">Everything you need to know before buying</p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Can foreigners buy property in Turkey?',
                a: 'Yes. Citizens of most countries can purchase property in Turkey. The process is straightforward and the title deed (TAPU) is fully transferable to foreign nationals. Our team handles all legal steps on your behalf.',
              },
              {
                q: 'Can I get Turkish citizenship by buying property?',
                a: 'Yes — investing a minimum of $400,000 USD in Turkish real estate makes you eligible to apply for Turkish citizenship for yourself and your family. We guide you through the full citizenship-by-investment process.',
              },
              {
                q: 'What documents do I need to buy a property?',
                a: 'You typically need a valid passport, a Turkish tax number (which we obtain for you in one day), and a bank account in Turkey. We coordinate everything so you can complete the purchase even remotely.',
              },
              {
                q: 'How long does the buying process take?',
                a: 'From signing the reservation agreement to receiving your title deed usually takes 2–6 weeks for cash purchases. Mortgage or off-plan transactions may take longer depending on the developer timeline.',
              },
              {
                q: 'What taxes and fees should I expect?',
                a: 'The main costs are: title deed tax (4% of the declared value), VAT (exempt for foreign buyers in some cases), and notary fees. We provide a full cost breakdown upfront — no surprises.',
              },
              {
                q: 'Do you offer installment or payment plans?',
                a: 'Many of our off-plan projects offer flexible payment plans directly with the developer — typically 30–50% upfront and the rest in installments over 12–48 months. Contact us to find options that fit your budget.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group border border-gray-200 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 font-semibold text-gray-900 list-none select-none hover:bg-gray-50 transition">
                  {q}
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold transition"
                    style={{ backgroundColor: theme.accent }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 pt-1 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      {waNumber && (
        <section style={{ backgroundColor: theme.bg }} className="py-14">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to find your property?</h2>
            <p className="text-gray-400 text-sm mb-7">Our team is available to answer your questions and arrange viewings.</p>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-8 py-4 rounded-2xl transition text-sm"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: theme.bg }} className="py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              {agency.logo ? (
                <img src={agency.logo} alt={agency.name} className="h-8 object-contain mb-2 opacity-80" />
              ) : null}
              <p className="text-white font-bold">{agency.name}</p>
              {agency.address && <p className="text-gray-500 text-sm mt-0.5">{agency.address}</p>}
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              {agency.phone && (
                <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
                  <Phone size={13} /> {agency.phone}
                </a>
              )}
              {(agency.contactEmail || agency.email) && (
                <a href={`mailto:${agency.contactEmail || agency.email}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
                  <Mail size={13} /> {agency.contactEmail || agency.email}
                </a>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">© {new Date().getFullYear()} {agency.name}. All rights reserved.</p>
            <a
              href="https://directkey.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-400 text-xs transition"
            >
              Powered by DirectKey <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}`}
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
