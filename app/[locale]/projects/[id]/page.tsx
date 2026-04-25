'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Bed, Maximize2, CheckCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getProjectBySlug, getAllProjects } from '@/lib/projects';
import LeadForm from '@/components/LeadForm';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function ProjectDetailPage({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const t = useTranslations('project');
  const tForm = useTranslations('form');
  const project = getProjectBySlug(id);

  const [activeImg, setActiveImg] = useState(0);
  const [showForm, setShowForm] = useState(false);

  if (!project) {
    notFound();
    return null;
  }

  const nextImg = () => setActiveImg((i) => (i + 1) % project.images.length);
  const prevImg = () => setActiveImg((i) => (i - 1 + project.images.length) % project.images.length);

  const STATUS_COLORS: Record<string, string> = {
    'Ready to Move': 'bg-emerald-100 text-emerald-700',
    'Under Construction': 'bg-amber-100 text-amber-700',
    'Pre-Sale': 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      <div className="pt-20 bg-gray-50 min-h-screen">
        {/* Back link */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy-800 font-medium transition"
          >
            <ChevronLeft size={16} />
            {t('backToProjects')}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 mb-3">
                <Image
                  src={project.images[activeImg]}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {project.badge && (
                  <div className="absolute top-4 left-4 bg-gold-500 text-navy-950 text-sm font-bold px-3 py-1.5 rounded-xl">
                    {project.badge}
                  </div>
                )}
                {project.images.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-xl shadow transition">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-xl shadow transition">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-lg">
                  {activeImg + 1}/{project.images.length}
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2">
                {project.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 transition ${i === activeImg ? 'border-gold-500' : 'border-transparent'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <MapPin size={13} />
                  {project.location}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">{project.title}</h1>
              <div className="text-gold-600 font-bold text-2xl mb-6">{project.priceLabel}</div>

              {/* Specs */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Bed size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-500 text-xs">Bedrooms</div>
                    <div className="font-semibold text-gray-900">{project.bedrooms}</div>
                  </div>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex items-center gap-2 text-sm">
                  <Maximize2 size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-500 text-xs">Size</div>
                    <div className="font-semibold text-gray-900">{project.size}</div>
                  </div>
                </div>
                <div className="w-px bg-gray-100" />
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <div>
                    <div className="text-gray-500 text-xs">City</div>
                    <div className="font-semibold text-gray-900">{project.city}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">{t('overview')}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{project.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-3">{t('amenities')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {project.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold py-4 rounded-2xl transition hover:scale-[1.02] active:scale-95"
                >
                  <Calendar size={18} />
                  {t('bookVisit')}
                </button>
                <WhatsAppButton
                  message={project.whatsappText}
                  label={t('whatsappChat')}
                  variant="inline"
                  className="flex-1 justify-center py-4 rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          projectTitle={project.title}
          whatsappText={project.whatsappText}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
