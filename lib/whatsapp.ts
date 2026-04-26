/**
 * WhatsApp Cloud API — Meta
 * مسئول ارسال پیام به مشتری از طریق WhatsApp Business API
 */

const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ─── Send a text message ──────────────────────────────────────────────────────

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) {
    console.error('[WhatsApp] Missing WHATSAPP_PHONE_ID or WHATSAPP_TOKEN env vars');
    return { success: false, error: 'WhatsApp credentials not configured' };
  }

  // Normalize phone number — remove any non-digit chars except leading +
  const normalizedTo = to.replace(/[^\d+]/g, '').replace(/^\+/, '');

  try {
    const res = await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedTo,
        type: 'text',
        text: {
          preview_url: false,
          body: text,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[WhatsApp] API error:', JSON.stringify(data));
      return {
        success: false,
        error: data?.error?.message || 'Unknown WhatsApp API error',
      };
    }

    const messageId = data?.messages?.[0]?.id;
    console.log(`[WhatsApp] Message sent to ${normalizedTo}, id: ${messageId}`);
    return { success: true, messageId };

  } catch (err: any) {
    console.error('[WhatsApp] Fetch failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Mark message as read ─────────────────────────────────────────────────────

export async function markAsRead(messageId: string): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneId || !token) return;

  try {
    await fetch(`${GRAPH_API_BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch {
    // Non-critical — don't throw
  }
}

// ─── Extract incoming message from Meta webhook payload ───────────────────────

export interface IncomingWhatsAppMessage {
  from: string;           // sender phone number
  messageId: string;      // WhatsApp message ID
  text: string;           // message body text
  timestamp: string;      // unix timestamp string
  buttonPayload?: string; // if message came from a quick-reply button
  projectName?: string;   // extracted from button payload (e.g. "Sky Residence Istanbul")
}

export function parseWebhookPayload(body: any): IncomingWhatsAppMessage | null {
  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Ignore status updates (delivered, read, etc.)
    if (value?.statuses) return null;

    const message = value?.messages?.[0];
    if (!message) return null;

    // Only handle text and button reply messages
    const text =
      message?.text?.body ||
      message?.button?.text ||
      message?.interactive?.button_reply?.title ||
      '';

    if (!text) return null;

    // Extract project name from button payload if available
    // Format we set in WhatsApp links: "Interested in: Sky Residence Istanbul"
    const buttonPayload =
      message?.button?.payload ||
      message?.interactive?.button_reply?.id ||
      '';

    const projectMatch = buttonPayload.match(/^project:(.+)$/);
    const projectName = projectMatch ? projectMatch[1].trim() : undefined;

    return {
      from: message.from,
      messageId: message.id,
      text,
      timestamp: message.timestamp,
      buttonPayload,
      projectName,
    };
  } catch (err) {
    console.error('[WhatsApp] Failed to parse webhook payload:', err);
    return null;
  }
}
