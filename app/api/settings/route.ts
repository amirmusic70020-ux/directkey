import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateAgency } from '@/lib/agencies';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;

  try {
    const { name, phone, address, theme, logo } = await request.json();
    await updateAgency(user.agencyId, { name, phone, address, theme, logo });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Settings] Error:', err.message);
    return NextResponse.json({ error: 'Failed to save' }, { status: 50