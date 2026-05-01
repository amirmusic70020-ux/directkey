/**
 * Agency subdomain site — e.g. persianjazz.directkey.app
 *
 * Shows the agency's own branding and Airtable projects.
 * WhatsApp button links to the agency's own WhatsApp number.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building2, MessageCircle, MapPin, BedDouble, Maximize2, Phone, Mail, ExternalLink, Bot } from 'lucide-react';
import { findAgencyBySubdomain } from '@/lib/agencies';
import { getProjectsByAgency, Project } from '@/lib/projects';

// Theme color map — matches what agencies can pick in Settings
const THEME_COLORS: Record<string, { bg: string; accent: string; text: string; badge: string }> = {
  blue:   { bg: '#0F2147', accent: '#C9A96E', text: '#C9A96E',  badge: '#C9A96E20' },
  dark:   { bg: '#1a1a2e', accent: '#e94560', text: '#e94560',  badge: '#e9456020' },
  green:  { bg: '#1a3a2a', accent: '#4caf78', text: '#4caf78',  badge: '#4caf7820' },
  teal:   { bg: '#0d3349', accent: '#00b4d8', text: '#00b4d8',  badge: '#00b4d820' },
  purple: { bg: '#2d1b69', accent: '#a78bfa', text: '#a78bfa',  badge: '#a78bfa20' },
  red:    { bg: '#2d0a0a', accent: '#ef4444', text: '#ef4444',  badge: '#ef444420' },
  gold:   { bg: '#1a1200', accent: '#f59e0b', text: '#f59e0b',  badge: '#f59e0b20' },
  slate:  { bg: '#1e293b', accent: '#94a3b8', text: '#94a3b8',  badge: '#94a3b820' },
  rose:   { bg: '#1f0d14', accent: '#f43f5e', text: '#f43f5e',  badge: '#f43f5e20' },
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

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, accent, waNumber }: { project: Project; accent: string; waNumber: string }) {
  const status = statusColor(project.status);
  const price  = formatPrice(project.price, project.currency);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="h-52 bg-gray-100 relative overflow-hidden">
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
        <div
          className="absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          {project.status}
        </div>
        {project.type && (
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {project.type}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 leading-snug">{project.name}</h3>
        {project.location && (
          <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
            <MapPin size={13} /> {project.location}
          </p>
        )}

        {/* Specs */}
        <div className="flex gap-4 mb-4">
          {project.bedrooms && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <BedDouble size={13} />
              {project.bedrooms} bed{parseInt(project.bedrooms) !== 1 ? 's' : ''}
            </div>
          )}
          {project.area && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Maximize2 size={13} />
              {project.area} m²
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {price ? (
            <p className="font-bold text-gray-900 text-lg">{price}</p>
          ) : (
            <p className="text-sm text-gray-400">Price on request</p>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${project.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={15} />
              Enquire
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const revalidate = 60; // refresh every 60s

export default async function AgencySitePage({
  params,
}: {
  params: { subdomain: string };
}) {
  const { subdomain } = params;

  // Fetch agency + its projects in parallel
  const [agency, projects] = await Promise.all([
    findAgencyBySubdomain(subdomain),
    findAgencyBySubdomain(subdomain).then(a =>
      a ? getProjectsByAgency(a.id) : []
    ),
  ]);

  if (!agency) notFound();

  const theme  = THEME_COLORS[agency.theme] ?? THEME_COLORS.blue;
  // Build WhatsApp number from phone field (strip non-digits, remove leading +)
  const waNumber = (agency.phone || '').replace(/[^\d]/g, '');

  const availableProjects  = projects.filter(p => p.status.toLowerCase() === 'available');
  const otherProjects      = projects.filter(p => p.status.toLowerCase() !== 'available');
  const orderedProjects    = [...availableProjects, ...otherProjects];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero / Header ────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: theme.bg }} className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: theme.accent }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-6 flex items-center justify-between">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            {agency.logo ? (
              <img
                src={agency.logo}
                alt={agency.name}
                className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${theme.accent}20` }}
              >
                <Bot size={20} style={{ color: theme.accent }} />
              </div>
            )}
            <span className="text-white font-bold text-lg">{agency.name}</span>
          </div>

          {/* WhatsApp CTA */}
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

        {/* Hero text */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-12 pb-20">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: theme.accent }}
          >
            Real Estate Agency
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {agency.name}
          </h1>
          {agency.address && (
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              <MapPin size={14} />
              {agency.address}
            </p>
          )}

          {/* Stats bar */}
          <div className="flex gap-6 mt-8">
            <div>
              <p className="text-white font-bold text-2xl">{projects.length}</p>
              <p className="text-gray-400 text-xs">Listings</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-white font-bold text-2xl">{availableProjects.length}</p>
              <p className="text-gray-400 text-xs">Available now</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Projects grid ────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-5 py-14">
        {orderedProjects.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Building2 size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No listings yet</p>
            <p className="text-sm mt-1">Check back soon — properties coming soon.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Our Properties
              </h2>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: theme.badge, color: theme.accent }}
              >
                {orderedProjects.length} listings
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {orderedProjects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  accent={theme.accent}
                  waNumber={waNumber}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: theme.bg }} className="py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-white font-bold mb-1">{agency.name}</p>
              {agency.address && <p className="text-gray-400 text-sm">{agency.address}</p>}
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              {agency.phone && (
                <a
                  href={`tel:${agency.phone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
                >
                  <Phone size={14} />
                  {agency.phone}
                </a>
              )}
              {agency.email && (
                <a
                  href={`mailto:${agency.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
                >
                  <Mail size={14} />
                  {agency.email}
                </a>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} {agency.name}. All rights reserved.
            </p>
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

      {/* ── Floating WhatsApp button ──────────────────────────────────────────── */}
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
