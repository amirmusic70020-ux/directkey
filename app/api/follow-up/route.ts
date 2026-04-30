/**
 * Follow-up API — DirectKey / SARA
 * لیدهایی که Follow Up = true دارن و ۴۸ ساعته بی‌جواب موندن رو پیدا می‌کنه
 * و template واتساپ براشون می‌فرسته
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppTemplate } from '@/lib/whatsapp';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

const airtableHeaders = () => ({
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
    // Fetch leads where Follow Up = true
    const formula = encodeURIComponent(`{Follow Up} = TRUE()`);
    const res = await fetch(
      `${BASE_URL}/${BASE_ID}/Leads?filterByFormula=${formula}&maxRecords=50`,
      { headers: airtableHeaders() }
    );
    const data = await res.json();
    const leads: any[] = data.records || [];

    const HOURS_48 = 48 * 60 * 60 * 1000;
    const now = Date.now();

    let sent = 0;
    let skipped = 0;
    const results: string[] = [];

    for (const lead of leads) {
      const f = lead.fields;
      const phone = f['WhatsApp'];
      const name = f['Name'] || 'مشتری عزیز';
      const project = f['Project Interest'] || 'ملک در استانبول';
      const lastContact = f['Last Contact'] || lead.createdTime;

      if (!phone) { skipped++; continue; }

      // Check 48h since last contact
      const lastContactTime = new Date(lastContact).getTime();
      if (now - lastContactTime < HOURS_48) {
        skipped++;
        console.log(`[Follow-up] Skipping ${name} — less than 48h`);
        continue;
      }

      // Send template
      const result = await sendWhatsAppTemplate(phone, name, project);

      if (result.success) {
        sent++;
        results.push(`sent: ${name} (${phone})`);
        console.log(`[Follow-up] Sent to ${name} (${phone})`);

        // Uncheck Follow Up so they don't get it again
        await fetch(`${BASE_URL}/${BASE_ID}/Leads/${lead.id}`, {
          method: 'PATCH',
          headers: airtableHeaders(),
          body: JSON.stringify({
            fields: {
              'Follow Up': false,
              'Notes': (f['Notes'] ? f['Notes'] + '\n' : '') +
                `Follow-up sent: ${new Date().toLocaleDateString('fa-IR')}`,
            },
          }),
        });
      } else {
        results.push(`failed: ${name} — ${result.error}`);
        console.error(`[Follow-up] Failed for ${name}:`, result.error);
      }
    }

    return NextResponse.json({ success: true, total: leads.length, sent, skipped, results });

  } catch (err: any) {
    console.error('[Follow-up] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
