/**
 * Airtable "Projects" table — real estate listings per agency
 *
 * Primary key field in Airtable is "Project Name" (existing table)
 * AgencyId links each project to its agency
 */

const API_KEY  = process.env.AIRTABLE_TOKEN!;
const BASE_ID  = process.env.AIRTABLE_BASE_ID!;
const TABLE    = 'Projects';
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export type Project = {
  id:          string;
  name:        string;
  agencyId:    string;
  description: string;
  price:       string;
  currency:    string;
  location:    string;
  type:        string;
  bedrooms:    string;
  area:        string;
  status:      string;
  imageUrl:    string;    // first image (thumbnail)
  images:      string[];  // all images (Cloudinary URLs, stored as JSON in Airtable)
  facilities:  string;    // comma-separated list, e.g. "Pool,Gym,Parking"
};

function mapRecord(r: any): Project {
  const f = r.fields;
  return {
    id:          r.id,
    name:        f['Project Name'] ?? f['Name'] ?? '',
    agencyId:    f['AgencyId']    ?? '',
    description: f['Description'] ?? f['Notes'] ?? '',
    price:       f['Price']       ?? '',
    currency:    f['Currency']    ?? 'USD',
    location:    f['Location']    ?? f['City']?.name ?? f['City'] ?? '',
    type:        f['Type']        ?? '',
    bedrooms:    f['Bedrooms']    ?? '',
    area:        f['Area']        ?? '',
    status:      typeof f['Status'] === 'object' ? (f['Status']?.name ?? '') : (f['Status'] ?? 'Available'),
    // Images: stored as JSON array in Airtable Long text field "Images"
    images:      (() => { try { return JSON.parse(f['Images'] ?? '[]'); } catch { return []; } })(),
    // imageUrl: first image for thumbnail, fallback to legacy ImageData/ImageUrl
    imageUrl:    (() => { try { const arr = JSON.parse(f['Images'] ?? '[]'); return arr[0] ?? f['ImageData'] ?? f['ImageUrl'] ?? ''; } catch { return f['ImageData'] ?? f['ImageUrl'] ?? ''; } })(),
    facilities:  f['Facilities']  ?? '',
  };
}

export async function getProjectsByAgency(agencyId: string): Promise<Project[]> {
  const formula = encodeURIComponent(`{AgencyId}="${agencyId}"`);
  const res = await fetch(
    `${BASE_URL}?filterByFormula=${formula}&maxRecords=100`,
    { headers }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.records || []).map(mapRecord);
}

export async function createProject(data: Omit<Project, 'id'>): Promise<Project> {
  // Core fields that must exist in Airtable
  const coreFields: Record<string, any> = {
    'Project Name': data.name,
    AgencyId:       data.agencyId,
    Description:    data.description,
    Price:          data.price,
    Currency:       data.currency,
    Location:       data.location,
    Type:           data.type,
    Bedrooms:       data.bedrooms,
    Area:           data.area,
    Status:         data.status,
  };

  // Extended fields — only add if non-empty
  const imagesJson = data.images?.length ? JSON.stringify(data.images) : '';
  const allFields = {
    ...coreFields,
    ...(imagesJson       ? { Images:     imagesJson       } : {}),
    ...(data.facilities  ? { Facilities: data.facilities  } : {}),
  };

  let res = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fields: allFields }),
  });

  // If Airtable rejects (e.g. unknown field), fall back to core fields only
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error('[createProject] Airtable error:', JSON.stringify(errBody));

    if (res.status === 422) {
      // Retry with core fields only — Images/Facilities fields may not exist yet
      res = await fetch(BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields: coreFields }),
      });
    }

    if (!res.ok) {
      const fallbackErr = await res.json().catch(() => ({}));
      