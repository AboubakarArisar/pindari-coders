import { NextResponse } from 'next/server';
import { publicImageUrl, supabaseRequest } from '../../../../lib/supabase-admin';
import { requestFingerprint } from '../../../../lib/request-security';

export const runtime = 'nodejs';

const categories = new Set(['Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other']);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = 9;
    const offset = (page - 1) * limit;
    const category = categories.has(searchParams.get('category')) ? searchParams.get('category') : '';
    const rawQuery = (searchParams.get('q') || '').trim().slice(0, 60);
    const query = rawQuery.replace(/[^\p{L}\p{N} .+#-]/gu, '');

    const filters = [
      'select=id,slug,title,builder_name,short_description,category,stack,live_url,repository_url,featured,created_at,community_project_images(storage_path,sort_order)',
      'moderation_status=eq.approved',
      'order=featured.desc,created_at.desc',
      `offset=${offset}`,
      `limit=${limit}`,
    ];
    if (category) filters.push(`category=eq.${encodeURIComponent(category)}`);
    if (query) filters.push(`or=${encodeURIComponent(`(title.ilike.*${query}*,builder_name.ilike.*${query}*,short_description.ilike.*${query}*)`)}`);

    const response = await supabaseRequest(`/rest/v1/community_projects?${filters.join('&')}`, {
      headers: { prefer: 'count=exact' },
      returnResponse: true,
    });
    const projects = await response.json();
    const total = Number.parseInt(response.headers.get('content-range')?.split('/')[1] || '0', 10) || 0;
    const projectIds = projects.map((project) => project.id);
    let counts = [];
    let selections = [];
    if (projectIds.length) {
      const ids = projectIds.join(',');
      [counts, selections] = await Promise.all([
        supabaseRequest(`/rest/v1/community_project_reaction_counts?select=project_id,love_count,cool_count,smart_count,would_use_count&project_id=in.(${ids})`),
        supabaseRequest(`/rest/v1/community_project_reactions?select=project_id,reaction&project_id=in.(${ids})&fingerprint=eq.${requestFingerprint(request)}`),
      ]);
    }
    const countByProject = new Map(counts.map((row) => [row.project_id, {
      love: Number(row.love_count) || 0,
      cool: Number(row.cool_count) || 0,
      smart: Number(row.smart_count) || 0,
      would_use: Number(row.would_use_count) || 0,
    }]));
    const selectionByProject = new Map(selections.map((row) => [row.project_id, row.reaction]));
    const items = projects.map((project) => ({
      ...project,
      images: [...(project.community_project_images || [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => publicImageUrl(image.storage_path)),
      reactions: countByProject.get(project.id) || { love: 0, cool: 0, smart: 0, would_use: 0 },
      selected_reaction: selectionByProject.get(project.id) || null,
      community_project_images: undefined,
    }));

    return NextResponse.json({ items, page, pages: Math.max(1, Math.ceil(total / limit)), total });
  } catch (error) {
    console.error('Wall projects failed:', error);
    return NextResponse.json({ error: 'The Wall is unavailable right now.' }, { status: 503 });
  }
}
