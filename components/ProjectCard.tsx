'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, Maximize2, ArrowRight } from 'lucide-react';
import type { Project } from '@/lib/projects';

interface Props {
  project: Project;
}

const STATUS_COLORS: Record<string, string> = {
  'Ready to Move': 'bg-emerald-100 text-emerald-700',
  'Under Construction': 'bg-amber-100 text-amber-700',
  'Pre-Sale': 'bg-blue-100 text-blue-700',
};

export default function ProjectCard({ project }: Props) {
  const t = useTranslations('projects');
  const locale = useLocale();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={project.images[0]}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badge */}
        {project.badge && (
          <div className="absolute top-3 left-3 bg-gold-500 text-navy-950 text-xs font-bold px-2.5 py-1 rounded-lg">
            {project.badge}
          </div>
        )}
        {/* Status */}
        <div className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-700'}`}>
          {project.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
          <MapPin size={13} />
          <span>{project.location}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-navy-800 transition">
          {project.title}
        </h3>

        {/* Price */}
        <div className="text-gold-600 font-bold text-xl mb-4">
          {project.priceLabel}
        </div>

        {/* Specs */}
        <div className="flex gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
          <span className="flex items-center gap-1">
            <Bed size={13} />
            {project.bedrooms} {t('bedrooms')}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} />
            {project.size}
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/projects/${project.slug}`}
          className="flex items-center justify-center gap-2 w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl text-sm transition"
        >
          {t('viewDetails')}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
