/**
 * Temporary debug endpoint — helps diagnose why projects aren't showing.
 * Visit /api/projects/debug while logged in to see raw Airtable data.
 * DELETE THIS FILE after fixing the issue.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const API_KEY  = process.env.AIRTABLE_TOKEN!;
const BASE_ID  = process.env.AIRTABLE_BASE_ID!;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const agencyId = user.agencyId;

  const headers = { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

  // 1. Fetch ALL records (no filter) — to see what's actually in the Projects table
  const allRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/Projects?maxRecords=5`,
    { headers }
  );
  const allData = await allRes.json();

  // 2. Fetch with AgencyId filter
  const formula = encodeURIComponent(`{AgencyId}="${agencyId}"`);
  const filteredRes = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/Projects?filterByFormula=${formula}&maxRecords=10`,
    { headers }
  );
  const filteredData = await filteredRes.json();

  return NextResponse.json({
    session_agencyId: agencyId,
    all_records_status: allRes.status,
    all_records: allData,
    filtered_status: filteredRes.status,
    filtered_records: filteredData,
  });
}
