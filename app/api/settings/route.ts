import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateAgency, findAgencyById } from '@/lib/agencies';

/** GET — returns current agency settings for the dashboard settings form */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const agency = await findAgencyById(user.agencyId);
  if (!agency) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    name:         agency.name         || '',
    phone:        agency.phone        || '',
    address:      agency.address      || '',
    contactEmail: agency.contactEmail || '',
    description:  agency.description  || '',
    theme:        agency.theme        || 'blue',
    logo:         agency.logo         || '',
  });
}

/** POST — saves settings */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;

  try {
    const { name, phone, address, contactEmail, description, theme, logo } = await request.json();
    await updateAgency(user.agencyId, { name, phone, address, contactEmail, description, theme, logo });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Settings] Error:', err.message);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
