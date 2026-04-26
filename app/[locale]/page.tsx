import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

// Revalidate every 60 seconds — picks up new Sanity projects automatically
export const revalidate = 60;
import Link from 'next/link';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import { getFeaturedProjects } from '@/lib/projects';
import { getFeaturedProjectsFromSanity } from '@/sanity/queries';
import { ArrowRight, Search, CalendarCheck, FileCheck, Star, Shield, TrendingUp } from 'lucide-react';

async function HowItWorks({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'how' });
  const steps = [
    { icon: Search, title: t('step1_title'), desc: t('step1_desc'), num: '01' },
    { icon: CalendarCheck, title: t('step2_title'), desc: t('step2_desc'), num: '02' },
    { icon: FileCheck, title: t('step3_title'), desc: t('step3_desc'), num: '03' },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">{t('title')}</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-px bg-gradient-to-r from-gold-300 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-navy-50 group-hover:bg-navy-900 rounded-2xl mb-5 transition-colors">
                  <step.icon className="text-navy-700 group-hover:text-gold-400 transition-colors" size={28} />
                </div>
                <div className="text-xs font-bold text-gold-500 mb-2">{step.num}</div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function WhyUs() {
  const reasons = [
    { icon: Shield, title: 'Zero Hidden Fees', desc: 'Full transparency on all costs and commissions' },
    { icon: Star, title: 'Expert Guidance', desc: 'Dedicated consultant for your entire journey' },
    { icon: TrendingUp, title: 'Best Investment Returns', desc: 'Curated projects with strong rental yields' },
  ];
  return (
    <section className="py-16 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
                <r.icon size={20} className="text-gold-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{r.title}</h4>
                <p className="text-gray-400 text-sm">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function CTASection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'cta' });
  return (
    <section className="py-20 bg-gradient-to-br from-gold-500 to-gold-600">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-navy-950 mb-4">{t('title')}</h2>
        <p className="text-navy-800 text-lg mb-8">{t('subtitle')}</p>
        <Link
          href={`/${locale}/projects`}
          className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold px-8 py-4 rounded-2xl transition hover:scale-105 active:scale-95 shadow-lg"
        >
          {t('button')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'featured' });
  let featured;
  try {
    featured = await getFeaturedProjectsFromSanity();
    if (!featured.length) featured = getFeaturedProjects();
  } catch {
    featured = getFeaturedProjects();
  }

  return (
    <>
      <Hero />
      <WhyUs />
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">{t('title')}</h2>
              <p className="text-gray-500 mt-2">{t('subtitle')}</p>
            </div>
            <Link
              href={`/${locale}/projects`}
              className="hidden sm:flex items-center gap-1.5 text-navy-800 hover:text-gold-600 font-semibold text-sm transition"
            >
              {t('viewAll')}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="sm:hidden text-center mt-8">
            <Link href={`/${locale}/projects`} className="inline-flex items-center gap-2 text-navy-800 font-semibold">
              {t('viewAll')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <HowItWorks locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}
