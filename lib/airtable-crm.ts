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

  const fields: Record<string, any> = {
    'SARA Handled': true,
    'Notes': JSON.stringify({ conversationHistory: newHistory }),
  };

  if (crmUpdate.leadScore !== undefined) fields['Lead Score'] = crmUpdate.leadScore;
  if (crmUpdate.summary) fields['Conversation Summary'] = crmUpdate.summary;
  if (crmUpdate.requiresHuman !== undefined) fields['Requires Human'] = crmUpdate.requiresHuman;
  if (clientName) fields['Name'] = clientName;

  // Next follow-up: set to tomorrow if conversation is active
  if (!crmUpdate.requiresHuman && crmUpdate.status !== 'Booked') {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    fields['Next Follow-up'] = tomorrow;
  }

  try {
    const res = await fetch(`${BASE_URL}/${BASE_ID}/Leads/${recordId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      console.error('[Airtable] updateLead error:', await res.text());
    } else {
      console.log('[Airtable] Lead updated:', recordId);
    }
  } catch (err: any) {
    console.error('[Airtable] updateLead failed:', err.message);
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

export function extractConversationHistory(lead: AirtableLead): ConversationMessage[] {
  try {
    if (lead.notes) {
      const parsed = JSON.parse(lead.notes);
      return parsed?.conversationHistory || [];
    }
  } catch {
    // Notes field might have non-JSON content from manual entry
  }
  return [];
}

// ─── Send owner notification (WhatsApp to owner's personal number) ────────────

export async function notifyOwner(
  clientPhone: string,
  clientName: string | undefined,
  reason: string,
  lastMessage: string
): Promise<void> {
  const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER;
  if (!ownerPhone) {
    console.warn('[Notify] OWNER_WHATSAPP_NUMBER not set — skipping notification');
    return;
  }

  const { sendWhatsAppMessage } = await import('./whatsapp');

  const notification = [
    '🔔 *DirectKey — نیاز به مداخله*',
    '',
    `👤 مشتری: ${clientName || clientPhone}`,
    `📱 شماره: ${clientPhone}`,
    `⚠️ دلیل: ${reason}`,
    '',
    `💬 آخرین پیام:`,
    `"${lastMessage.slice(0, 200)}"`,
    '',
    'لطفاً هرچه زودتر پاسخ دهید.',
  ].join('\n');

  try {
    await sendWhatsAppMessage(ownerPhone, notification);
    console.log('[Notify] Owner notified about:', clientPhone);
  } catch (err: any) {
    console.error('[Notify] Failed to notify owner:', err.message);
  }
}

// ─── Helper: map Airtable record to AirtableLead ──────────────────────────────

function mapRecord(record: any): AirtableLead {
  const f = record.fields || {};
  return {
    id: record.id,
    name: f['Name'],
    whatsapp: f['WhatsApp'] || '',
    leadScore: f['Lead Score'],
    projectInterest: f['Project Interest'],
    nationality: f['Nationality'],
    requiresHuman: f['Requires Human'],
    saraHandled: f['SARA Handled'],
    nextFollowUp: f['Next Follow-up'],
    conversationSummary: f['Conversation Summary'],
    notes: f['Notes'],
  };
}
