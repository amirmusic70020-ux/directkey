/**
 * WhatsApp Webhook — DirectKey / SARA
 *
 * GET  /api/whatsapp  → Meta webhook verification
 * POST /api/whatsapp  → Incoming messages from WhatsApp
 *
 * Flow:
 * 1. Receive message from Meta
 * 2. Find or create lead in Airtable
 * 3. Load conversation history + client profile
 * 4. Call SARA (Claude API) with full context
 * 5. Send SARA's reply back via WhatsApp API
 * 6. Update Airtable CRM with new history + all CRM fields
 * 7. If human needed → notify owner with full summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { callSARA, ClientProfile } from '@/lib/sara';
import { sendWhatsAppMessage, markAsRead, parseWebhookPayload } from '@/lib/whatsapp';
import {
  findLeadByPhone,
  createLead,
  updateLead,
  logInteraction,
  extractConversationHistory,
  notifyOwner,
} from '@/lib/airtable-crm';

// ─── GET: Meta webhook verification ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[WhatsApp Webhook] Verification failed — token mismatch');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ─── POST: Incoming WhatsApp message ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Meta requires 200 OK quickly — process async
  waitUntil(
    processIncomingMessage(body).catch(err =>
      console.error('[WhatsApp Webhook] Unhandled error in processIncomingMessage:', err)
    )
  );

  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

// ─── Core processing logic ────────────────────────────────────────────────────

async function processIncomingMessage(body: any) {
  const incoming = parseWebhookPayload(body);
  if (!incoming) return;

  const { from, messageId, text, projectName } = incoming;
  console.log(`[SARA] Incoming from ${from}: "${text.slice(0, 80)}"`);

  // Mark as read (blue ticks)
  markAsRead(messageId).catch(() => {});

  // ── 1. Find or create lead ────────────────────────────────────────────────
  let lead = await findLeadByPhone(from);
  if (!lead) {
    console.log(`[SARA] New lead from ${from} — creating in Airtable`);
    lead = await createLead(from, projectName, text);
  }

  // ── 2. Load conversation history ──────────────────────────────────────────
  const conversationHistory = lead ? extractConversationHistory(lead) : [];
  const recentHistory = conversationHistory.slice(-20);

  // ── 3. Build client profile from existing CRM data ────────────────────────
  const clientProfile: ClientProfile = {
    budget: lead?.budget,
    purpose: lead?.purpose as ClientProfile['purpose'],
    timeline: lead?.timeline,
    language: lead?.language,
    status: lead?.status,
    summary: lead?.conversationSummary,
    nationality: lead?.nationality,
  };

  // ── 4. Build SARA context ─────────────────────────────────────────────────
  const saraContext = {
    projectName: projectName || lead?.projectInterest,
    clientName: lead?.name,
    clientPhone: from,
    clientProfile,
    conversationHistory: recentHistory,
  };

  // ── 5. Call SARA ──────────────────────────────────────────────────────────
  let saraResult;
  try {
    saraResult = await callSARA(text, saraContext);
  } catch (err: any) {
    console.error('[SARA] Claude API error:', err.message);
    await sendWhatsAppMessage(
      from,
      'سلام! متأسفم، یه مشکل فنی پیش اومد. همکارم به زودی پاسخ میده. 🙏'
    );
    return;
  }

  const { response, needsHuman, crmUpdate } = saraResult;
  console.log(`[SARA] Response to ${from}: "${response.slice(0, 80)}..."`);
  console.log(`[SARA] Needs human: ${needsHuman}, Lead score: ${crmUpdate?.leadScore}`);

  // ── 6. Send reply via WhatsApp ────────────────────────────────────────────
  console.log(`[SARA] Sending reply to ${from} (length: ${response.length} chars)`);
  const sendResult = await sendWhatsAppMessage(from, response);
  if (!sendResult.success) {
    console.error('[SARA] ❌ Failed to send WhatsApp message to', from, '— error:', sendResult.error);
  } else {
    console.log('[SARA] ✅ WhatsApp reply sent successfully, messageId:', sendResult.messageId);
  }

  // ── 7. Update conversation history ────────────────────────────────────────
  const newHistory = [
    ...recentHistory,
    { role: 'user' as const, content: text },
    { role: 'assistant' as const, content: response },
  ];

  // ── 8. Update Airtable with full CRM data ────────────────────────────────
  if (lead?.id) {
    await updateLead(
      lead.id,
      crmUpdate || { requiresHuman: needsHuman },
      newHistory,
      lead.name
    );

    await logInteraction(lead.id, 'inbound', text, 'SARA');
    await logInteraction(lead.id, 'outbound', response, 'SARA');
  }

  // ── 9. Notify owner if human needed ──────────────────────────────────────
  if (needsHuman) {
    console.log(`[SARA] Human needed for ${from} — notifying owner`);
    await notifyOwner({
      clientPhone: from,
      clientName: crmUpdate?.clientName || lead?.name,
      reason: crmUpdate?.summary || 'مشتری نیاز به مشاور انسانی دار�