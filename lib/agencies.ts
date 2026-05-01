/**
 * Airtable "Agencies" table — CRUD for SaaS tenants
 *
 * Required Airtable table: Agencies
 * Fields: Name, Subdomain, Email, PasswordHash, Plan, Status,
 *         Logo (attachment), Theme, Phone, Address,
 *         StripeCustomerId, StripeSubscriptionId, AirtableBaseId,
 *         WhatsappPhoneId, WhatsappToken, LogoUrl
 */

const API_KEY  = process.env.AIRTABLE_TOKEN!;
const BASE_ID  = process.env.AIRTABLE_BASE_ID!;
const TABLE    = 'Agencies';
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

export type Agency = {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  passwordHash: string;
  plan: 'basic' | 'pro' | 'agency';
  status: 'active' | 'pending' | 'cancelled';
  logo?: string;
  theme: string;
  phone?: string;
  address?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  airtableBaseId?: string;
  whatsappPhoneId?: string;
  whatsappToken?: string;
};

function mapRecord(record: any): Agency {
  const f = record.fields;
  return {
    id:                   record.id,
    name:                 f['Name']                 ?? '',
    subdomain:            f['Subdomain']            ?? '',
    email:                f['Email']               ?? '',
    passwordHash:         f['PasswordHash']         ?? '',
    plan:                 f['Plan']                 ?? 'basic',
    status:               f['Status']               ?? 'pending',
    logo:                 f['LogoUrl']              || f['Logo']?.[0]?.url,
    theme:                f['Theme']                ?? 'blue',
    phone:                f['Phone'],
    address:              f['Address'],
    stripeCustomerId:     f['StripeCustomerId'],
    stripeSubscriptionId: f['StripeSubscriptionId'],
    airtableBaseId:       f['AirtableBaseId'],
    whatsappPhoneId:      f['WhatsappPhoneId'],
    whatsappToken:        f['WhatsappToken'],
  };
}

export async function findAgencyByEmail(email: string): Promise<Agency | null> {
  const formula = encodeURIComponent(`LOWER({Email})="${email.toLowerCase()}"`);
  const res = await fetch(`${BASE_URL}?filterByFormula=${formula}&maxRecords=1`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  const record = data.records?.[0];
  return record ? mapRecord(record) : null;
}

export async function findAgencyByWhatsappPhoneId(phoneId: string): Promise<Agency | null> {
  const formula = encodeURIComponent(`{WhatsappPhoneId}="${phoneId}"`);
  const res = await fetch(`${BASE_URL}?filterByFormula=${formula}&maxRecords=1`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  const record = data.records?.[0];
  return record ? mapRecord(record) : null;
}

export async function findAgencyBySubdomain(subdomain: string): Promise<Agency | null> {
  const formula = encodeURIComponent(`LOWER({Subdomain})="${subdomain.toLowerCase()}"`);
  const res = await fetch(`${BASE_URL}?filterByFormula=${formula}&maxRecords=1`, { headers });
  if (!res.ok) return null;
  const data = await res.json();
  const record = data.records?.[0];
  return record ? mapRecord(record) : null;
}

export async function findAgencyById(id: string): Promise<Agency | null> {
  const res = await fetch(`${BASE_URL}/${id}`, { headers });
  if (!res.ok) return null;
  const record = await res.json();
  return mapRecord(record);
}

export async function createAgency(data: {
  name: string;
  subdomain: string;
  email: string;
  passwordHash: string;
}): Promise<Agency> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fields: {
        Name:         data.name,
        Subdomain:    data.subdomain.toLowerCase(),
        Email:        data.email.toLowerCase(),
        PasswordHash: data.passwordHash,
        Plan:         'basic',
        Theme:        'blue',
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[createAgency] Airtable error:', JSON.stringify(err));
    throw new Error('Failed to create agency');
  }
  return mapRecord(await res.json());
}

export async function updateAgency(
  id: string,
  fields: Partial<{
    name:                 string;
    theme:                string;
    phone:                string;
    address:              string;
    logo:                 string;
    plan:                 string;
    status:               string;
    stripeCustomerId:     string;
    stripeSubscriptionId: string;
    airtableBaseId:       string;
    whatsappPhoneId:      string;
    whatsappToken:        string;
  }>
): Promise<Agency> {
  const airtableFields: Record<string, any> = {};
  if (fields.name)                              airtableFields['Name']                   = fields.name;
  if (fields.theme)                             airtableFields['Theme']                  = fields.theme;
  if (fields.phone    !== undefined)            airtableFields['Phone']                  = fields.phone;
  if (fields.address  !== undefined)            airtableFields['Address']                = fields.address;
  // Logo can be a base64 data URL — requires LogoUrl to be Long Text type in Airtable
  if (fields.logo     !== undefined)            airtableFields['LogoUrl']                = fields.logo;
  if (fields.plan)                              airtableFields['Plan']                   = fields.plan;
  if (fields.status)                            airtableFields['Status']                 = fields.status;
  if (fields.stripeCustomerId)                  airtableFields['StripeCustomerId']       = fields.stripeCustomerId;
  if (fields.stripeSubscriptionId)              airtableFields['StripeSubscriptionId']   = fields.stripeSubscriptionId;
  if (fields.airtableBaseId)                    airtableFields['AirtableBaseId']         = fields.airtableBaseId;
  if (fields.whatsappPhoneId !== undefined)     airtableFields['WhatsappPhoneId']        = fields.whatsappPhoneId;
  if (fields.whatsappToken   !== undefined)     airtableFields['WhatsappToken']          = fields.whatsappToken;

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: airtableFields }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[updateAgency] Airtable error:', JSON.stringify(err));
    throw new Error('Failed to update agency');
  }
  return mapRecord(await res.json());
}
