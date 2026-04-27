/**
 * Airtable CRM — DirectKey
 * مدیریت لیدها، تاریخچه مکالمه، و notification به صاحب کسب‌وکار
 */

import type { CrmUpdate, ConversationMessage } from './sara';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AirtableLead {
  id: string;           // Airtable record ID (recXXXX)
  name?: string;
  whatsapp: string;
  leadScore?: number;
  projectInterest?: string;
  nationality?: string;
  requiresHuman?: boolean;
  saraHandled?: boolean;
  nextFollowUp?: string;
  conversationSummary?: string;
  notes?: string;
  budget?: string;
  purpose?: string;
  timeline?: string;
  language?: string;
  status?: string;
  // We store conversation history as JSON in the Notes field
  conversationHistory?: ConversationMessage[];
}

// ─── Find lead by WhatsApp number ─────────────────────────────────────────────

export async function findLeadByPhone(phone: string): Promise<AirtableLead | null> {
  if (!BASE_ID || !TOKEN) return null;

  // Normalize phone for search
  const normalized = phone.replace(/[^\d]/g, '');

  try {
    const formula = encodeURIComponent(`SEARCH("${normalized}", SUBSTITUTE({WhatsApp}, "+", ""))`);
    const res = await fetch(
      `${BASE_URL}/${BASE_ID}/Leads?filterByFormula=${formula}&maxRecords=1`,
      { headers: headers() }
    );

    if (!res.ok) {
      console.error('[Airtable] findLeadByPhone error:', await res.text());
      return null;
    }

    const data = await res.json();
    const record = data?.records?.[0];
    if (!record) return null;

    return mapRecord(record);
  } catch (err: any) {
    console.error('[Airtable] findLeadByPhone failed:', err.message);
    return null;
  }
}

// ─── Create new lead ──────────────────────────────────────────────────────────

export async function createLead(
  phone: string,
  projectName?: string,
  initialMessage?: string
): Promise<AirtableLead | null> {
  if (!BASE_ID || !TOKEN) return null;

  const initialHistory: ConversationMessage[] = initialMessage
    ? [{ role: 'user', content: initialMessage }]
    : [];

  try {
    const res = await fetch(`${BASE_URL}/${BASE_ID}/Leads`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        records: [{
          fields: {
            'WhatsApp': phone,
            'Project Interest': projectName || '',
            'Lead Score': 1,
            'SARA Handled': true,
            'Conversation Summary': 'New WhatsApp lead — SARA engaged.',
            'Notes': JSON.stringify({ conversationHistory: initialHistory }),
          },
        }],
      }),
    });

    if (!res.ok) {
      console.error('[Airtable] createLead error:', await res.text());
      return null;
    }

    const data = await res.json();
    const record = data?.records?.[0];
    if (!record) return null;

    console.log('[Airtable] New lead created:', record.id, phone);
    return mapRecord(record);
  } catch (err: any) {
    console.error('[Airtable] createLead failed:', err.message);
    return null;
  }
}

// ─── Update lead after each SARA message ─────────────────────────────────────

export async function updateLead(
  recordId: string,
  crmUpdate: CrmUpdate,
  newHistory: ConversationMessage[],
  clientName?: string
): Promise<void> {
  if (!BASE_ID || !TOKEN) return;

  // ── Core fields: definitely text / number / checkbox / date ─────────────────
  // These never cause INVALID_MULTIPLE_CHOICE_OPTIONS errors.
  const coreFields: Record<string, any> = {
    'SARA Handled': true,
    'Notes': JSON.stringify({ conversationHistory: newHistory }),
  };

  if (crmUpdate.leadScore !== undefined) coreFields['Lead Score'] = crmUpdate.leadScore;
  if (crmUpdate.summary) coreFields['Conversation Summary'] = crmUpdate.summary;
  if (crmUpdate.requiresHuman !== undefined) coreFields['Requires Human'] = crmUpdate.requiresHuman;
  if (crmUpdate.clientName) coreFields['Name'] = crmUpdate.clientName;
  else if (clientName) coreFields['Name'] = clientName;

  // Next follow-up: set to tomorrow if conversation is active
  if (!crmUpdate.requiresHuman && crmUpdate.status !== 'Booked') {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    coreFields['Next Follow-up'] = tomorrow;
  }

  // Patch 1: core fields (must succeed)
  try {
    const res = await fetch(`${BASE_URL}/${BASE_ID}/Leads/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields: coreFields }),
    });

    if (!res.ok) {
      console.error('[Airtable] updateLead (core) error:', await res.text());
    } else {
      console.log('[Airtable] Lead updated (core):', recordId);
    }
  } catch (err: any) {
    console.error('[Airtable] updateLead (core) failed:', err.message);
  }

  // ── Select / text fields: may fail if Airtable field type is Single Select
  // and the option isn't configured yet. We attempt separately so core never blocks.
  const selectFields: Record<string, any> = {};

  if (crmUpdate.budget && crmUpdate.budget !== 'unknown') selectFields['Budget'] = crmUpdate.budget;
  if (crmUpdate.purpose && crmUpdate.purpose !== 'Unknown') selectFields['Purpose'] = crmUpdate.purpose;
  if (crmUpdate.timeline && crmUpdate.timeline !== 'unknown') selectFields['Timeline'] = crmUpdate.timeline;
  if (crmUpdate.language) selectFields['Language'] = crmUpdate.language;
  if (crmUpdate.status) selectFields['Status'] = crmUpdate.status;

  if (Object.keys(selectFields).length === 0) return;

  // Patch 2: select/enum fields (non-critical — failure logged but ignored)
  try {
    const res = await fetch(`${BASE_URL}/${BASE_ID}/Leads/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields: selectFields }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(
        '[Airtable] updateLead (select fields) failed — ' +
        'check that Airtable Single Select fields have the correct options, ' +
        'or change them to Single Line Text. Fields attempted:',
        Object.keys(selectFields),
        'Error:', errText
      );
    } else {
      console.log('[Airtable] Lead updated (select fields):', recordId);
    }
  } catch (err: any) {
    console.warn('[Airtable] updateLead (select fields) exception:', err.message);
  }
}

// ─── Log interaction ──────────────────────────────────────────────────────────

export async function logInteraction(
  leadRecordId: string,
  direction: 'inbound' | 'outbound',
  message: string,
  handledBy: 'SARA' | 'Human' = 'SARA'
): Promise<void> {
  if (!BASE_ID || !TOKEN) return;

  try {
    // Check if Interactions table exists — if not, skip gracefully
    const res = await fetch(`${BASE_URL}/${BASE_ID}/Interactions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        records: [{
          fields: {
            'Lead': [leadRecordId],
            'Type': 'WhatsApp',
            'Direction': direction,
            'Message': message.slice(0, 500), // Airtable text field limit
            'Handled By': handledBy,
            'Date': new Date().toISOString().split('T')[0],
          },
        }],
      }),
    });

    if (!res.ok) {
      // Interactions table might not be set up — log and continue
      console.warn('[Airtable] logInteraction skipped (table may not exist)');
    }
  } catch {
    // Non-critical
  }
}

// ─── Get conversation history from lead record ────────────────────────────────

export function extractConver