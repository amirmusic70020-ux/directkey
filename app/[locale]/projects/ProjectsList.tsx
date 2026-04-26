'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ProjectCard from '@/components/ProjectCard';
import { SlidersHorizontal } from 'lucide-react';
import type { Project } from '@/lib/projects';

const CITIES = ['all', 'Istanbul', 'Antalya', 'Bodrum', 'Izmir'];

export default function ProjectsList({ projects }: { projects: Project[] }) {
  const t = useTranslations('projects');
  const [activeCity, setActiveCity] = useState('all');

  const filtered = useMemo(() => {
    if (activeCity === 'all') return projects;
    return projects.filter((p) => p.city.toLowerCase() === activeCity.toLowerCase());
  }, [activeCity, projects]);

  const filterLabels: Record<string, string> = {
    all: t('filter_all'),
    Istanbul: t('filter_istanbul'),
    Antalya: t('filter_antalya'),
    Bodrum: t('filter_bodrum'),
    Izmir: t('filter_izmir'),
  };

  return (
    <>
      {/* Page Hero */}
      <div className="bg-gradient-to-br from-navy-950 to-navy-800 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            <SlidersHorizontal size={16} className="text-gray-400 flex-shrink-0 mr-1" />
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCity === city
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterLabels[city]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">{t('noProjects')}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-gray-500">{filtered.length} properties</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
