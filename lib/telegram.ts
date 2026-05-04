/**
 * Telegram Bot — DirectKey / SARA
 * ارسال و دریافت پیام از طریق Telegram Bot API
 */

export interface TelegramCredentials {
  token: string;
}

export interface IncomingTelegramMessage {
  chatId: number;
  messageId: number;
  text: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  /** Identifier used in Airtable — format: tg:{chatId} */
  from: string;
}

// ─── Parse incoming webhook payload ──────────────────────────────────────────

export function parseTelegramWebhook(body: any): IncomingTelegramMessage | null {
  try {
    const message = body?.message || body?.edited_message;
    if (!message) return null;

    const text: string = message?.text || '';
    if (!text.trim()) return null;

    const chatId: number = message.chat?.id;
    if (!chatId) return null;

    return {
      chatId,
      messageId: message.message_id,
      text: text.trim(),
      firstName: message.from?.first_name,
      lastName:  message.from?.last_name,
      username:  message.from?.username,
      from: `tg:${chatId}`,
    };
  } catch {
    return null;
  }
}

// ─── Send text message ────────────────────────────────────────────────────────

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  creds?: TelegramCredentials
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const token = creds?.token || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { success: false, error: 'No Telegram bot token configured' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    if (!data.ok) return { success: false, error: data.description };
    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── Send document (brochure PDF) ────────────────────────────────────────────

export async function sendTelegramDocument(
  chatId: number,
  url: string,
  caption: string,
  creds?: TelegramCredentials
): Promise<{ success: boolean; error?: string }> {
  const token = creds?.token || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { success: false, error: 'No Telegram bot token configured' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        document: url,
        caption,
      }),
    });
    const data = await res.json();
    if (!data.ok) return { success: false, error: data.description };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
