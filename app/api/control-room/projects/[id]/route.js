import { NextResponse } from 'next/server';
import { hasValidControlSession } from '../../../../../lib/control-room-auth';
import { sameOrigin } from '../../../../../lib/request-security';
import { removeProjectImages, supabaseRequest } from '../../../../../lib/supabase-admin';

export const runtime = 'nodejs';

const statuses = new Set(['pending', 'approved', 'rejected', 'hidden']);
const categories = new Set(['Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other']);
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : undefined;

function authorized(request) {
  return hasValidControlSession(request) && sameOrigin(request);
}

export async function PATCH(request, context) {
  try {
    if (!authorized(request)) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const { id } = await context.params;
    const body = await request.json();
    const update = {};
    const title = clean(body.title, 100);
    const description = clean(body.shortDescription, 800);
    const rejectionReason = clean(body.rejectionReason, 300);
    if (title !== undefined && title.length >= 2) update.title = title;
    if (description !== undefined && description.length >= 20) update.short_description = description;
    if (categories.has(body.category)) update.category = body.category;
    if (statuses.has(body.moderationStatus)) {
      update.moderation_status = body.moderationStatus;
      update.reviewed_at = new Date().toISOString();
      if (body.moderationStatus !== 'approved') update.featured = false;
    }
    if (typeof body.featured === 'boolean') {
      update.featured = body.featured;
      if (body.featured) update.moderation_status = 'approved';
    }
    if (rejectionReason !== undefined) update.rejection_reason = rejectionReason || null;
    if (!Object.keys(update).length) return NextResponse.json({ error: 'No valid changes supplied.' }, { status: 400 });

    const rows = await supabaseRequest(`/rest/v1/community_projects?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { prefer: 'return=representation' }, json: update });
    if (!rows.length) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    return NextResponse.json({ item: rows[0] });
  } catch (error) {
    console.error('Control room update failed:', error);
    return NextResponse.json({ error: 'The project could not be updated.' }, { status: 503 });
  }
}

export async function DELETE(request, context) {
  try {
    if (!authorized(request)) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    const { id } = await context.params;
    const images = await supabaseRequest(`/rest/v1/community_project_images?select=storage_path&project_id=eq.${encodeURIComponent(id)}`);
    const deleted = await supabaseRequest(`/rest/v1/community_projects?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { prefer: 'return=representation' },
    });
    if (!deleted.length) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    try {
      await removeProjectImages(images.map((image) => image.storage_path));
    } catch (cleanupError) {
      console.error('Deleted project image cleanup failed:', cleanupError);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Control room delete failed:', error);
    return NextResponse.json({ error: 'The project could not be deleted.' }, { status: 503 });
  }
}
