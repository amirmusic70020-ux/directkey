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
    whatsappNumber:  agency.whatsappNumber  || '',
    whatsappStatus:  agency.whatsappStatus  || 'inactive',
    saraName:        agency.saraName        || '',
    saraStyle:       agency.saraStyle       || 'professional',
    saraAbout:       agency.saraAbout       || '',
    saraMarkets:     agency.saraMarkets     || '',
    // keep legacy fields for backend use
    whatsappPhoneId: agency.whatsappPhoneId || '',
    whatsappToken:   agency.whatsappToken   || '',
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;

  try {
    const body = await request.json();
    const { whatsappNumber, saraName, saraStyle, saraAbout, saraMarkets } = body;

    await updateAgency(user.agencyId, {
      whatsappNumber,
      whatsappStatus: 'pending', // always set to pending on new submission
      saraName,
      saraStyle,
      saraAbout,
      saraMarkets,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[SARA] Error:', err.message);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
