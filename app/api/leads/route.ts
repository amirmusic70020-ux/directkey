import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/leads';

export async function POST(request: NextRequest) {
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

// GET: Simple admin endpoint to view leads (protect this in production!)
export async function GET(request: NextRequest) {
  // TODO: Add authentication before using in production
  // const token = request.headers.get('Authorization');
  // if (token !== `Bearer ${process.env.ADMIN_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const { getAllLeads } = await import('@/lib/leads');
    const leads = getAllLeads();
    return NextResponse.json({ leads, total: leads.length });
  } catch {
    return NextResponse.json({ error: 'Could not read leads' }, { status: 500 });
  }
}
