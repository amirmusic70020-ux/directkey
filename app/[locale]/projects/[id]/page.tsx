import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { findAgencyBySubdomain } from '@/lib/agencies';
import { getProjectById } from '@/lib/projects';
import AgencyProjectDetail from '@/components/AgencyProjectDetail';

// Legacy Sanity imports (main site only)
import { unstable_setRequestLocale } from 'next-intl/server';
import { getProjectBySlugFromSanity } from '@/sanity/queries';
import ProjectDetail from './ProjectDetail';

export const revalidate = 60;

export default async function ProjectDetailPage({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const subdomain = headers().get('x-subdomain');

  // ── Agency subdomain: fetch project from Airtable ─────────────────────────
  if (subdomain) {
    const agency = await findAgencyBySubdomain(subdomain);
    if (!agency) notFound();

    const project = await getProjectById(id);
    // Make sure this project belongs to this agency
    if (!project || project.agencyId !== agency.id) notFound();

    return <AgencyProjectDetail project={project} agency={agency} />;
  }

  // ── Main site: legacy Sanity / static data behaviour ─────────────────────
  unstable_setRequestLocale(locale);

  let project: any = null;
  try {
    project = await getProjectBySlugFromSanity(id);
  } catch {
    // Sanity unavailable — fall through to notFound
  }

  if (!project) notFound();
  return <ProjectDetail project={project} locale={locale} />;
}
