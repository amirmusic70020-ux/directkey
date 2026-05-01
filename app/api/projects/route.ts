import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProjectsByAgency, createProject, updateProject, deleteProject } from '@/lib/projects';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  const projects = await getProjectsByAgency(user.agencyId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = session.user as any;
  try {
    const body = await req.json();
    if (body.id) {
      // update
      const updated = await updateProject(body.id, body);
      return NextResponse.json({ project: updated });
    } else {
      // create
      const created = await createProject({ ...body, agencyId: user.agencyId });
      return NextResponse.json({ project: created }, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteProject(id);
  return NextResponse.json({ success: true });
}
