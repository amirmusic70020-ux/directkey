import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findAgencyById } from '@/lib/agencies';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const agency = await findAgencyById(user.agencyId);
  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { whatsappNumber, saraName } = await request.json();
  const agentName = saraName || 'SARA';

  try {
    // 1. Notify DirectKey team
    await resend.emails.send({
      from: 'DirectKey <info@directkey.app>',
      to:   'info@directkey.app',
      subject: `🤖 New SARA Activation Request — ${agency.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#0F2147">New SARA Activation Request</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tr><td style="padding:8px 0;color:#666;width:140px">Agency</td><td style="padding:8px 0;font-weight:600">${agency.name}</td></tr>
            <tr><td style="padding:8px 0;color:#666">WhatsApp</td><td style="padding:8px 0;font-weight:600">${whatsappNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Agent name</td><td style="padding:8px 0;font-weight:600">${agentName}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${agency.email}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Plan</td><td style="padding:8px 0">${agency.plan}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb">
            <p style="margin:0;color:#374151;font-size:14px">
              Go to <a href="https://airtable.com" style="color:#0F2147">Airtable</a> → Agencies → find <strong>${agency.name}</strong> → set WhatsApp credentials and update <strong>WhatsappStatus</strong> to <code>active</code>.
            </p>
          </div>
        </div>
      `,
    });

    // 2. Confirm to agency
    await resend.emails.send({
      from: 'DirectKey <info@directkey.app>',
      to:   agency.email,
      subject: `Your ${agentName} activation request has been received`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="text-align:center;margin-bottom:32px">
            <div style="display:inline-block;background:#0F2147;border-radius:12px;padding:12px 24px">
              <span style="color:#C9A96E;font-size:20px;font-weight:700">DirectKey</span>
            </div>
          </div>
          <h2 style="color:#0F2147;margin-bottom:8px">Request received, ${agency.name}!</h2>
          <p style="color:#6b7280;line-height:1.6">
            We've received your request to activate <strong>${agentName}</strong> on WhatsApp for <strong>${whatsappNumber}</strong>.
          </p>
          <div style="margin:24px 0;padding:20px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0">
            <p style="margin:0;color:#15803d;font-weight:600">✓ Our team will activate ${agentName} as soon as possible.</p>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6">
            Once activated, ${agentName} will automatically respond to your clients on WhatsApp, qualify leads, and book viewings — 24/7.
          </p>
          <p style="color:#6b7280;font-size:14px;margin-top:24px">
            Questions? Reply to this email or contact us at <a href="mailto:info@directkey.app" style="color:#0F2147">info@directkey.app</a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0">
          <p style="color:#9ca3af;font-size:12px;text-align:center">DirectKey · AI-powered real estate sales</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[notify-sara]', err.message);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
