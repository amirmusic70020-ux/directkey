import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findAgencyByEmail, findAgencyBySubdomain, createAgency } from '@/lib/agencies';

export async function POST(request: NextRequest) {
  try {
    const { name, subdomain, email, password } = await request.json();

    if (!name || !subdomain || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const subdomainClean = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!subdomainClean || subdomainClean.length < 2) {
      return NextResponse.json({ error: 'Invalid subdomain' }, { status: 400 });
    }

    const reserved = ['www', 'app', 'api', 'admin', 'dashboard', 'login', 'register', 'mail', 'support'];
    if (reserved.includes(subdomainClean)) {
      return NextResponse.json({ error: 'This subdomain is reserved' }, { status: 400 });
    }

    const existing = await findAgencyByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const subdomainTaken = await findAgencyBySubdomain(subdomainClean);
    if (subdomainTaken) {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const agency = await createAgency({
      name,
      subdomain: subdomainClean,
      email: email.toLowerCase(),
      passwordHash,
    });

    return NextResponse.json({ success: true, agencyId: agency.id }, { status: 201 });
  } catch (err: any) {
    console.error('[Register] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
