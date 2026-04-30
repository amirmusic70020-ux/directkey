/**
 * WhatsApp Webhook -- DirectKey / SARA
 *
 * GET  /api/whatsapp  -> Meta webhook verification
 * POST /api/whatsapp  -> Incoming messages from WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { callSARA, ClientProfile } from '@/lib/sara';
import { sendWhatsAppMessage, sendWhatsAppDocument, markAsRead, parseWebhookPayload } from '@/lib/whatsapp';
import { getProjectBySlugFromSanity } from '@/sanity/queries';
import {
  findLeadByPhone,
  createLead,
  updateLead,
  logInteraction,
  extractConversationHistory,
  notifyOwner,
} from '@/lib/airtable-crm';

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

  console.warn('[WhatsApp Webhook] Verification failed -- token mismatch');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  waitUntil(
    processIncomingMessage(body).catch(err =>
      console.error('[WhatsApp Webhook] Unhandled error in processIncomingMessage:', err)
    )
  );

  return NextResponse.json({ status: 'ok' }, { status: 200 });
}

async function processIncomingMessage(body: any) {
  const incoming = parseWebhookPayload(body);
  if (!incoming) return;

  const { from, messageId, text, projectName } = incoming;
  console.log(`[SARA] Incoming from ${from}: "${text.slice(0, 80)}"`);

  markAsRead(messageId).catch(() => {});

  let lead = await findLeadByPhone(from);
  if (!lead) {
    console.log(`[SARA] New lead from ${from} -- creating in Airtable`);
    lead = await createLead(from, projectName, text);
  }

  const conversationHistory = lead ? extractConversationHistory(lead) : [];
  const recentHistory = conversationHistory.slice(-20);

  const clientProfile: ClientProfile = {
    budget: lead?.budget,
    purpose: lead?.purpose as ClientProfile['purpose'],
    timeline: lead?.timeline,
    language: lead?.language,
    status: lead?.status,
    summary: lead?.conversationSummary,
    nationality: lead?.nationality,
  };

  const saraContext = {
    projectName: projectName || lead?.projectInterest,
    clientName: lead?.name,
    clientPhone: from,
    clientProfile,
    conversationHistory: recentHistory,
  };

  let saraResult;
  try {
    saraResult = await callSARA(text, saraContext);
  } catch (err: any) {
    console.error('[SARA] Claude API error:', err.message);
    await sendWhatsAppMessage(from, 'Hi! Sorry, there was a technical issue. My colleague will reply shortly.');
    return;
  }

  const { response, needsHuman, crmUpdate, brochureProjectSlug, projectLinkSlug } = saraResult;
  console.log(`[SARA] Response to ${from}: "${response.slice(0, 80)}..."`);
  console.log(`[SARA] Needs human: ${needsHuman}, Lead score: ${crmUpdate?.leadScore}, Brochure: ${brochureProjectSlug || 'none'}, Link: ${projectLinkSlug || 'none'}`);

  console.log(`[SARA] Sending reply to ${from} (length: ${response.length} chars)`);
  const sendResult = await sendWhatsAppMessage(from, response);
  if (!sendResult.success) {
    console.error('[SARA] FAILED to send WhatsApp message to', from, '-- error:', sendResult.error);
  } else {
    console.log('[SARA] WhatsApp reply sent successfully, messageId:', sendResult.messageId);
  }

  // ── Send project link if SARA requested it ───────────────────────────────
  if (projectLinkSlug) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://directkey.vercel.app';
      const projectUrl = `${siteUrl}/en/projects/${projectLinkSlug}`;
      const linkResult = await sendWhatsAppMessage(from, projectUrl);
      if (linkResult.success) {
        console.log(`[SARA] Project link sent for "${projectLinkSlug}" to ${from}`);
      } else {
        console.error('[SARA] Failed to send project link:', linkResult.error);
      }
    } catch (err: any) {
      console.error('[SARA] Error sending project link:', err.message);
    }
  }

  // ── Send brochure PDF if SARA requested it ────────────────────────────────
  if (brochureProjectSlug) {
    try {
      const project = await getProjectBySlugFromSanity(brochureProjectSlug);
      if (project?.brochureUrl) {
        const brochureResult = await sendWhatsAppDocument(
          from,
          project.brochureUrl,
          `${project.title} - Brochure.pdf`,
          `📋 ${project.title}`
        );
        if (brochureResult.success) {
          console.log(`[SARA] Brochure sent for "${project.title}" to ${from}`);
        } else {
          console.error('[SARA] Failed to send brochure:', brochureResult.error);
        }
      } else {
        console.warn(`[SARA] Brochure requested for slug "${brochureProjectSlug}" but no brochureUrl found`);
      }
    } catch (err: any) {
      console.error('[SARA] Error sending brochure:', err.message);
    }
  }

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
      lead.name
    );
    await logInteraction(lead.id, 'inbound', text, 'SARA');
    await logInteraction(lead.id, 'outbound', response, 'SARA');
  }

  if (needsHuman) {
    console.log(`[SARA] Human needed for ${from} -- notifying owner`);
    await notifyOwner({
      clientPhone: from,
      clientName: crmUpdate?.clientName || lead?.name,
      reason: crmUpdate?.summary || 'Client needs human advisor',
      conversationSummary: crmUpdate?.summary || lead?.conversationSummary,
      budget: crmUpdate?.budget || lead?.budget,
      purpose: crmUpdate?.purpose || lead?.purpose,
      timeline: crmUpdate?.timeline || lead?.timeline,
      projectInterest: projectName || lead?.projectInterest,
      lastUserMessage: text,
    });
  }
}
