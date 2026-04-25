import projectsData from '@/data/projects.json';

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  city: string;
  priceMin: number;
  priceMax: number;
  priceLabel: string;
  bedrooms: string;
  size: string;
  status: string;
  featured: boolean;
  badge: string;
  images: string[];
  description: string;
  amenities: string[];
  whatsappText: string;
}

export function getAllProjects(): Project[] {
  return projectsData as Project[];
}

export function getFeaturedProjects(): Project[] {
  return (projectsData as Project[]).filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return (projectsData as Project[]).find((p) => p.slug === slug);
}

export function getProjectsByCity(city: string): Project[] {
  if (!city || city === 'all') return projectsData as Project[];
  return (projectsData as Project[]).filter(
    (p) => p.city.toLowerCase() === city.toLowerCase()
  );
}
