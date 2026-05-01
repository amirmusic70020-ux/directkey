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
  imageUrl:    string;
  facilities:  string;   // comma-separated list, e.g. "Pool,Gym,Parking"
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
    // Accept base64 from ImageData (Long Text) first, fall back to ImageUrl (URL field)
    imageUrl:    f['ImageData']   ?? f['ImageUrl'] ?? '',
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

  // Extended fields — only add if non-empty (avoids rejection if field doesn't exist yet)
  // ImageData = Long Text field for base64 images; Facilities = Long Text for amenities list
  const allFields = {
    ...coreFields,
    ...(data.imageUrl   ? { ImageData:  data.imageUrl   } : {}),
    ...(data.facilities ? { Facilities: data.facilities } : {}),
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
      // Retry with core fields only — extended fields don't exist in Airtable yet
      res = await fetch(BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields: coreFields }),
      });
    }

    if (!res.ok) {
      const fallbackErr = await res.json().catch(() => ({}));
      console.error('[createProject] fallback error:', JSON.stringify(fallbackErr));
      throw new Error(`Airtable error: ${JSON.stringify(fallbackErr)}`);
    }
  }

  return mapRecord(await res.json());
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'agencyId'>>
): Promise<Project> {
  const fields: Record<string, any> = {};
  if (data.name        !== undefined) fields['Project Name'] = data.name;
  if (data.description !== undefined) fields['Description']  = data.description;
  if (data.price       !== undefined) fields['Price']        = data.price;
  if (data.currency    !== undefined) fields['Currency']     = data.currency;
  if (data.location    !== undefined) fields['Location']     = data.location;
  if (data.type        !== undefined) fields['Type']         = data.type;
  if (data.bedrooms    !== undefined) fields['Bedrooms']     = data.bedrooms;
  if (data.area        !== undefined) fields['Area']         = data.area;
  if (data.status      !== undefined) fields['Status']       = data.status;
  // Only include extended fields if they have values (avoids rejection if field missing in Airtable)
  if (data.imageUrl)   fields['ImageData']  = data.imageUrl;   // Long Text field for base64
  if (data.facilities) fields['Facilities'] = data.facilities; // Long Text field

  let res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields }),
  });

  // If Airtable rejects extended fields, retry with core fields only
  if (!res.ok && res.status === 422) {
    const coreFields = { ...fields };
    delete coreFields['ImageData'];
    delete coreFields['Facilities'];
    res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields: coreFields }),
    });
  }

  if (!res.ok) throw new Error('Failed to update project');
  return mapRecord(await res.json());
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`${BASE_URL}/${id}`, { method: 'DELETE', headers });
}
