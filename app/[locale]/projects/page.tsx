import { headers } from 'next/headers';
import { unstable_setRequestLocale } from 'next-intl/server';
import { getAllProjectsFromSanity } from '@/sanity/queries';
import { getAllProjects, getProjectsByAgency } from '@/lib/projects';
import { findAgencyBySubdomain } from '@/lib/agencies';
import ProjectsList from './ProjectsList';
import AgencyProjectsPage from './AgencyProjectsPage';

// Revalidate every 60 seconds — picks up new projects automatically
export const revalidate = 60;

export default async function ProjectsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // ── Agency subdomain: show all agency projects ───────────────────────────
  const subdomain = headers().get('x-subdomain');
  if (subdomain) {
    const agency = await findAgencyBySubdomain(subdomain);
    const projects = agency ? await getProjectsByAgency(agency.id) : [];
    return <AgencyProjectsPage agency={agency} projects={projects} />;
  }

  // ── Main site: existing Sanity/fallback list ─────────────────────────────
  unstable_setRequestLocale(locale);

  let projects;
  try {
    projects = await getAllProjectsFromSanity();
    if (!projects.length) projects = getAllProjects();
  } catch {
    projects = getAllProjects();
  }

  return <ProjectsList projects={projects} />;
}
