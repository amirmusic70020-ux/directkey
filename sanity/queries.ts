import { client, urlFor } from './client';
import type { Project } from '@/lib/projects';

const PROJECT_FIELDS = `
  _id,
  "id": slug.current,
  "slug": slug.current,
  title,
  location,
  city,
  priceMin,
  priceMax,
  priceLabel,
  bedrooms,
  size,
  status,
  featured,
  badge,
  "images": images[].asset->url,
  description,
  amenities,
  whatsappText,
  brochureUrl
`;

function mapProject(p: any): Project {
  return {
    id: p.slug || p._id,
    slug: p.slug || p._id,
    title: p.title || '',
    location: p.location || '',
    city: p.city || '',
    priceMin: p.priceMin || 0,
    priceMax: p.priceMax || 0,
    priceLabel: p.priceLabel || '',
    bedrooms: p.bedrooms || '',
    size: p.size || '',
    status: p.status || 'Ready to Move',
    featured: p.featured || false,
    badge: p.badge || '',
    images: (p.images || []).filter(Boolean),
    description: p.description || '',
    amenities: p.amenities || [],
    whatsappText: p.whatsappText || '',
    brochureUrl: p.brochureUrl || '',
  };
}

export async function getAllProjectsFromSanity(): Promise<Project[]> {
  const data = await client.fetch(`*[_type == "project"] | order(_createdAt desc) { ${PROJECT_FIELDS} }`);
  return data.map(mapProject);
}

export async function getFeaturedProjectsFromSanity(): Promise<Project[]> {
  const data = await client.fetch(`*[_type == "project" && featured == true] | order(_createdAt desc) { ${PROJECT_FIELDS} }`);
  return data.map(mapProject);
}

export async function getProjectBySlugFromSanity(slug: string): Promise<Project | null> {
  const data = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0] { ${PROJECT_FIELDS} }`,
    { slug }
  );
  return data ? mapProject(data) : null;
}
