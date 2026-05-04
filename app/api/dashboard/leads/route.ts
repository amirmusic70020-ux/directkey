/**
 * GET  /api/dashboard/leads  — fetch all leads from Airtable for dashboard
 * POST /api/dashboard/leads  — send follow-up message to a lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { sendTelegramMessage } from '@/lib/telegram';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID  = process.env.AIRTABLE_BASE_ID!;
const TOKEN    = process.env.AIRTABLE_TOKEN!;

const airtableHeaders = () => ({
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
});

// ─── GET — fetch leads ────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!BASE_ID || !TOKEN) {
    return NextResponse.json({ leads: [], total: 0 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all | hot | mid | cold
    const page   = parseInt(searchParams.get('page') || '1');
    const limit  = 50;

    let formula = '';
    if (filter === 'hot')  formula = `&filterByFormula={Lead Score}>3`;
    if (filter === 'mid')  formula = `&filterByFormula=AND({Lead Score}>=2,{Lead Score}<=3)`;
    if (filter === 'cold') formula = `&filterByFormula={Lead Score}<2`;

    const url = `${BASE_URL}/${BASE_ID}/Leads?maxRecords=${limit}&sort[0][field]=Created&sort[0][direction]=desc${formula}`;
    const res = await fetch(url, { headers: airtableHeaders() });

    if (!res.ok) {
      console.error('[Dashboard Leads] Airtable error:', await res.text());
      return NextResponse.json({ leads: [], total: 0 });
    }

    const data = await res.json();
    const leads = (data.records || []).map((r: any) => ({
      id:          r.id,
      name:        r.fields['Name']         || r.fields['Full Name'] || '—',
      phone:       r.fields['WhatsApp']     || '—',
      budget:      r.fields['Budget']       || '—',
      purpose:     r.fields['Purpose']      || '—',
      score:       r.fields['Lead Score']   || 0,
      status:      r.fields['Status']       || '—',
      projectInterest: r.fields['Project Interest'] || '—',
      summary:     r.fields['Conversation Summary'] || '',
      requiresHuman: r.fields['Requires Human'] || false,
      createdAt:   r.fields['Created']      || r.createdTime,
      channel:     (r.fields['WhatsApp'] || '').startsWith('tg:') ? 'telegram' : 'whatsapp',
    }));

    // Stats
    const statsUrl = `${BASE_URL}/${BASE_ID}/Leads?maxRecords=200&fields[]=Lead Score&fields[]=Created`;
    const statsRes = await fetch(statsUrl, { headers: airtableHeaders() });
    const statsData = await statsRes.json();
    const allRecords = statsData.records || [];

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total:     allRecords.length,
      hot:       allRecords.filter((r: any) => (r.fields['Lead Score'] || 0) > 3).length,
      mid:       allRecords.filter((r: any) => { const s = r.fields['Lead Score'] || 0; return s >= 2 && s <= 3; }).length,
      cold:      allRecords.filter((r: any) => (r.fields['Lead Score'] || 0) < 2).length,
      thisWeek:  allRecords.filter((r: any) => new Date(r.createdTime) > weekAgo).length,
      needsHuman: allRecords.filter((r: any) => r.fields['Requires Human']).length,
    };

    return NextResponse.json({ leads, stats });
  } catch (err: any) {
    console.error('[Dashboard Leads] Error:', err.message);
    return NextResponse.json({ leads: [], total: 0 });
  }
}

// ─── POST — send follow-up ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phone, message, channel } = await request.json();
  if (!phone || !message) {
    return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
  }

  try {
    if (channel === 'telegram') {
      const chatId = parseInt(phone.replace('tg:', ''));
      const result = await sendTelegramMessage(chatId, message);
      if (!result.success) throw new Error(result.error);
    } else {
      const result = await sendWhatsAppMessage(phone, message);
      if (!result.success) throw new Error(result.error);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
