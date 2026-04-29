import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads';

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// Tracks request timestamps per IP. Resets on cold start (fine for our scale).
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5;        // max requests
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes in ms

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ─── POST: Submit a new lead ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit check
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    console.warn(`[Leads] Rate limit hit for IP: ${ip}`);
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes and try again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validation
    const { name, phone, budget, project, locale, message, source } = body;

    if (!name || !phone || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, budget' },
        { status: 400 }
      );
    }

    // Save lead
    const lead = saveLead({
      name: String(name).trim(),
      phone: String(phone).trim(),
      budget: String(budget).trim(),
      project: String(project || '').trim(),
      message: String(message || '').trim(),
      locale: String(locale || 'en'),
      source: String(source || 'website'),
    });

    console.log('[DirectKey] New Lead:', {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      budget: lead.budget,
      project: lead.project,
      timestamp: lead.timestamp,
    });

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('[DirectKey] Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── GET: Admin — view leads (protected) ─────────────────────────────────────

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || token !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getAllLeads } = await import('@/lib/leads');
    const leads = getAllLeads();
    return NextResponse.json({ leads, total: leads.length });
  } catch {
    return NextResponse.json({ error: 'Could not read leads' }, { status: 500 });
  }
}
