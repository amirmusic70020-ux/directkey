import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateAgency, findAgencyById } from '@/lib/agencies';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;

  const agency = await findAgencyById(user.agencyId);
  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    whatsappPhoneId: agency.whatsappPhoneId || '',
    whatsappToken:   agency.whatsappToken   || '',
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;

  try {
    const { whatsappPhoneId, whatsappToken } = await request.json();
    await updateAgency(user.agencyId, { whatsappPhoneId, whatsappToken });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[SARA] Error:', err.message);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
