/**
 * Telegram Webhook — DirectKey / SARA
 *
 * POST /api/telegram → پیام‌های ورودی از Telegram
 *
 * راه‌اندازی webhook:
 * https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://directkey.app/api/telegram
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { callSARA, ClientProfile } from '@/lib/sara';
import { parseTelegramWebhook, sendTelegramMessage, sendTelegramDocument } from '@/lib/telegram';
import { getProjectBySlugFromSanity } from '@/sanity/queries';
import {
  findLeadByPhone,
  createLead,
  updateLead,
  logInteraction,
  extractConversationHistory,
  notifyOwner,
} from '@/lib/airtable-crm';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  waitUntil(
    processTelegramMessage(body).catch(err =>
      console.error('[Telegram Webhook] Unhandled error:', err)
    )
  );

  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

async function processTelegramMessage(body: any) {
  const incoming = parseTelegramWebhook(body);
  if (!incoming) return;

  const { chatId, text, from, firstName, lastName } = incoming;
  const clientName = [firstName, lastName].filter(Boolean).join(' ') || undefined;

  console.log(`[SARA/TG] Incoming from ${from} (${clientName || 'unknown'}): "${text.slice(0, 80)}"`);

  // ── Find or create lead ───────────────────────────────────────────────────
  let lead = await findLeadByPhone(from);
  if (!lead) {
    console.log(`[SARA/TG] New Telegram lead from ${from} — creating in Airtable`);
    lead = await createLead(from, undefined, text);
    // Save name if available
    if (lead?.id && clientName) {
      await updateLead(lead.id, { clientName }, [], clientName);
    }
  }

  const conversationHistory = lead ? extractConversationHistory(lead) : [];
  const recentHistory = conversationHistory.slice(-20);

  const clientProfile: ClientProfile = {
    budget:   lead?.budget,
    purpose:  lead?.purpose as ClientProfile['purpose'],
    timeline: lead?.timeline,
    language: lead?.language,
    status:   lead?.status,
    summary:  lead?.conversationSummary,
    nationality: lead?.nationality,
  };

  const saraContext = {
    clientName: clientName || lead?.name,
    clientPhone: from,
    clientProfile,
    conversationHistory: recentHistory,
  };

  // ── Call SARA ─────────────────────────────────────────────────────────────
  let saraResult;
  try {
    saraResult = await callSARA(text, saraContext);
  } catch (err: any) {
    console.error('[SARA/TG] Claude API error:', err.message);
    await sendTelegramMessage(chatId, 'سلام! متأسفم، مشکل فنی داریم. همکارم بزودی پاسخ می‌دهد.');
    return;
  }

  const { response, needsHuman, crmUpdate, brochureProjectSlug, projectLinkSlug } = saraResult;
  console.log(`[SARA/TG] Response to ${from}: "${response.slice(0, 80)}..."`);

  // ── Send reply ────────────────────────────────────────────────────────────
  const sendResult = await sendTelegramMessage(chatId, response);
  if (!sendResult.success) {
    console.error('[SARA/TG] FAILED to send message:', sendResult.error);
  }

  // ── Send project link ─────────────────────────────────────────────────────
  if (projectLinkSlug) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://directkey.vercel.app';
    const projectUrl = `${siteUrl}/en/projects/${projectLinkSlug}`;
    await sendTelegramMessage(chatId, projectUrl);
  }

  // ── Send brochure PDF ─────────────────────────────────────────────────────
  if (brochureProjectSlug) {
    try {
      const project = await getProjectBySlugFromSanity(brochureProjectSlug);
      if (project?.brochureUrl) {
        await sendTelegramDocument(
          chatId,
          project.brochureUrl,
          `📋 ${project.title}`
        );
      }
    } catch (err: any) {
      console.error('[SARA/TG] Error sending brochure:', err.message);
    }
  }

  // ── Update CRM ────────────────────────────────────────────────────────────
  const newHistory = [
    ...recentHistory,
    { role: 'user' as const, content: text },
    { role: 'assistant' as const, content: response },
  ];

  if (lead?.id) {
    await updateLead(
      lead.id,
      crmUpdate || { requiresHuman: needsHuman },
      newHistory,
      clientName || lead.name
    );
    await logInteraction(lead.id, 'inbound', text, 'SARA');
    await logInteraction(lead.id, 'outbound', response, 'SARA');
  }

  // ── Notify owner if needed ────────────────────────────────────────────────
  if (needsHuman) {
    console.log(`[SARA/TG] Human needed for ${from} — notifying owner`);
    await notifyOwner({
      clientPhone: from,
      clientName: clientName || lead?.name,
      reason: crmUpdate?.summary || 'Client needs human advisor (Telegram)',
      conversationSummary: crmUpdate?.summary || lead?.conversationSummary,
      budget: crmUpdate?.budget || lead?.budget,
      purpose: crmUpdate?.purpose || lead?.purpose,
      timeline: crmUpdate?.timeline || lead?.timeline,
      lastUserMessage: text,
    });
  }
}
