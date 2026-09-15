import { NextResponse } from 'next/server';
import { hasValidControlSession } from '../../../../lib/control-room-auth';
import { publicImageUrl, supabaseRequest } from '../../../../lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    if (!hasValidControlSession(request)) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const projects = await supabaseRequest('/rest/v1/community_projects?select=*,community_project_images(storage_path,sort_order)&order=created_at.desc&limit=200');
    return NextResponse.json({ items: projects.map((project) => ({
      ...project,
      images: [...(project.community_project_images || [])].sort((a, b) => a.sort_order - b.sort_order).map((image) => publicImageUrl(image.storage_path)),
      community_project_images: undefined,
    })) });
  } catch (error) {
    console.error('Control room projects failed:', error);
    return NextResponse.json({ error: 'Projects could not be loaded.' }, { status: 503 });
  }
}
