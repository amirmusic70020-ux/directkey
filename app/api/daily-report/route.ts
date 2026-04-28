/**
 * Daily Report API — DirectKey / SARA
 * هر شب ساعت ۱۱ شب یه گزارش کامل به واتساپ صاحب کسب‌وکار می‌فرسته
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

const headers = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

export async function GET(request: NextRequest) {
  // Security: only allow Vercel cron or manual call with secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Turkey time = UTC+3
    const TURKEY_OFFSET = 3 * 60 * 60 * 1000;
    const nowTurkey = new Date(Date.now() + TURKEY_OFFSET);
    const todayStr = nowTurkey.toISOString().split('T')[0]; // e.g. "2026-04-29"

    // ── Fetch all leads ────────────────────────────────────────────────────────
    const leadsRes = await fetch(
      `${BASE_URL}/${BASE_ID}/Leads?maxRecords=200`,
      { headers: headers() }
    );
    const leadsData = await leadsRes.json();
    const allLeads: any[] = leadsData.records || [];

    // ── Filter today's new leads (by Airtable createdTime) ────────────────────
    const todayLeads = allLeads.filter((r: any) => {
      const createdTurkey = new Date(new Date(r.createdTime).getTime() + TURKEY_OFFSET);
      return createdTurkey.toISOString().split('T')[0] === todayStr;
    });

    // ── Categorize ────────────────────────────────────────────────────────────
    const hotLeads = allLeads.filter((r: any) => (r.fields['Lead Score'] || 0) >= 7);
    const needsHuman = allLeads.filter((r: any) => r.fields['Requires Human'] === true);

    // ── Fetch today's interactions ─────────────────────────────────────────────
    let todayInbound = 0;
    try {
      const formula = encodeURIComponent(`{Date}='${todayStr}'`);
      const intRes = await fetch(
        `${BASE_URL}/${BASE_ID}/Interactions?filterByFormula=${formula}&maxRecords=200`,
        { headers: headers() }
      );
      const intData = await intRes.json();
      const todayInts: any[] = intData.records || [];
      todayInbound = todayInts.filter((r: any) => r.fields['Direction'] === 'inbound').length;
    } catch {
      // Interactions table might not exist yet — skip
    }

    // ── Build Farsi report ─────────────────────────────────────────────────────
    const persianDate = nowTurkey.toLocaleDateString('fa-IR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const lines: string[] = [
      `📊 *گزارش روزانه DirectKey*`,
      `📅 ${persianDate}`,
      ``,
      `━━━━━━━━━━━━━━━`,
      `💬 پیام‌های دریافتی: *${todayInbound} نفر*`,
      `👥 لیدهای جدید امروز: *${todayLeads.length} نفر*`,
      `🔥 Hot Leads فعال: *${hotLeads.length} نفر*`,
      `⚠️ نیاز به پیگیری انسانی: *${needsHuman.length} نفر*`,
      ``,
    ];

    // Today's new leads
    if (todayLeads.length > 0) {
      lines.push(`━━━━━━━━━━━━━━━`);
      lines.push(`👥 *لیدهای امروز:*`);
      todayLeads.slice(0, 5).forEach((r: any) => {
        const f = r.fields;
        const name = f['Name'] || 'ناشناس';
        const budget = f['Budget'] && f['Budget'] !== 'unknown' ? ` | ${f['Budget']}` : '';
        const purpose = f['Purpose'] === 'Investment' ? ' | سرمایه‌گذاری' : f['Purpose'] === 'Residence' ? ' | سکونت' : '';
        const lang = f['Language'] ? ` | ${f['Language']}` : '';
        lines.push(`• ${name}${budget}${purpose}${lang}`);
      });
      if (todayLeads.length > 5) lines.push(`  و ${todayLeads.length - 5} نفر دیگر...`);
      lines.push('');
    }

    // Hot leads details
    if (hotLeads.length > 0) {
      lines.push(`━━━━━━━━━━━━━━━`);
      lines.push(`🔥 *Hot Leads (امتیاز ۷+):*`);
      hotLeads.slice(0, 4).forEach((r: any) => {
        const f = r.fields;
        const name = f['Name'] || 'ناشناس';
        const score = f['Lead Score'] || 0;
        const budget = f['Budget'] || '';
        const summary = f['Conversation Summary'] || '';
        lines.push(`• *${name}* — امتیاز ${score}/10`);
        if (budget && budget !== 'unknown') lines.push(`  💰 ${budget}`);
        if (summary) lines.push(`  📝 ${summary.slice(0, 100)}${summary.length > 100 ? '...' : ''}`);
      });
      lines.push('');
    }

    // Needs human
    if (needsHuman.length > 0) {
      lines.push(`━━━━━━━━━━━━━━━`);
      lines.push(`⚠️ *نیاز به تماس فوری:*`);
      needsHuman.slice(0, 5).forEach((r: any) => {
        const f = r.fields;
        const name = f['Name'] || 'ناشناس';
        const phone = f['WhatsApp'] || '';
        const project = f['Project Interest'] || '';
        lines.push(`• *${name}*${project ? ` | ${project}` : ''}`);
        if (phone) lines.push(`  📱 wa.me/${phone}`);
      });
      lines.push('');
    }

    // If no activity today
    if (todayLeads.length === 0 && todayInbound === 0) {
      lines.push(`━━━━━━━━━━━━━━━`);
      lines.push(`امروز پیام جدیدی دریافت نشد.`);
      lines.push(`می‌تونی محتوا پست کنی یا تبلیغ فعال کنی. 💡`);
      lines.push('');
    }

    lines.push(`━━━━━━━━━━━━━━━`);
    lines.push(`شب بخیر 🌙 | SARA | DirectKey`);

    const message = lines.join('\n');

    // ── Send to owner ──────────────────────────────────────────────────────────
    const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER;
    if (!ownerPhone) {
      return NextResponse.json({ error: 'OWNER_WHATSAPP_NUMBER not set' }, { status: 500 });
    }

    const sendResult = await sendWhatsAppMessage(ownerPhone, message);
    if (!sendResult.success) {
      console.error('[Daily Report] Failed to send:', sendResult.error);
      return NextResponse.json({ error: sendResult.error }, { status: 500 });
    }

    console.log('[Daily Report] Sent successfully');
    return NextResponse.json({
      success: true,
      todayLeads: todayLeads.length,
      hotLeads: hotLeads.length,
      needsHuman: needsHuman.length,
    });

  } catch (err: any) {
    console.error('[Daily Report] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
