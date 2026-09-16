import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { removeProjectImages, supabaseRequest, uploadProjectImage } from '../../../../lib/supabase-admin';
import { requestFingerprint, sameOrigin } from '../../../../lib/request-security';

export const runtime = 'nodejs';

const categories = new Set(['Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other']);
const types = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']]);

const text = (form, name, max) => String(form.get(name) || '').trim().slice(0, max);
const validUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.') ? url : null;
  } catch {
    return null;
  }
};
const validRepositoryUrl = (value) => {
  const url = validUrl(value);
  if (!url || !['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return null;
  return url.pathname.split('/').filter(Boolean).length >= 2 ? url : null;
};
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'project';

async function isImage(file) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === 'image/png') return bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  if (file.type === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  return false;
}

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request origin was rejected.' }, { status: 403 });

  let projectId;
  const uploaded = [];
  try {
    const fingerprint = requestFingerprint(request);
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const attempts = await supabaseRequest(`/rest/v1/wall_activity?select=id&fingerprint=eq.${fingerprint}&action=eq.submit&created_at=gte.${encodeURIComponent(since)}`);
    if (attempts.length >= 3) return NextResponse.json({ error: 'Submission limit reached. Please try again later.' }, { status: 429 });

    const form = await request.formData();
    if (text(form, 'website', 20)) return NextResponse.json({ ok: true });
    const title = text(form, 'title', 100);
    const builderName = text(form, 'builderName', 80);
    const builderEmail = text(form, 'builderEmail', 160);
    const description = text(form, 'description', 800);
    const category = text(form, 'category', 20);
    const stack = text(form, 'stack', 160).split(',').map((item) => item.trim()).filter(Boolean).slice(0, 8);
    const liveUrlInput = text(form, 'liveUrl', 300);
    const repositoryUrlInput = text(form, 'repositoryUrl', 300);
    const liveUrl = validUrl(liveUrlInput)?.href || null;
    const repositoryUrl = validRepositoryUrl(repositoryUrlInput)?.href || null;
    const images = form.getAll('images').filter((item) => item instanceof File && item.size > 0);

    if (title.length < 2 || builderName.length < 2 || !/^\S+@\S+\.\S+$/.test(builderEmail) || description.length < 20 || !categories.has(category)) {
      return NextResponse.json({ error: 'Please complete every required field.' }, { status: 400 });
    }
    if (liveUrlInput && !liveUrl) {
      return NextResponse.json({ error: 'The live URL must be a complete public HTTPS link.' }, { status: 400 });
    }
    if (repositoryUrlInput && !repositoryUrl) {
      return NextResponse.json({ error: 'The GitHub URL must link to a repository on github.com.' }, { status: 400 });
    }
    if (!liveUrl && !repositoryUrl) return NextResponse.json({ error: 'Add at least one valid project link.' }, { status: 400 });
    if (images.length !== 3) return NextResponse.json({ error: 'Add exactly three project images.' }, { status: 400 });
    for (const image of images) {
      if (!types.has(image.type) || image.size > 3 * 1024 * 1024 || !(await isImage(image))) {
        return NextResponse.json({ error: 'Images must be genuine JPG, PNG or WebP files under 3 MB.' }, { status: 400 });
      }
    }

    projectId = randomUUID();
    const slug = `${slugify(title)}-${projectId.slice(0, 6)}`;
    await supabaseRequest('/rest/v1/community_projects', {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      json: { id: projectId, slug, title, builder_name: builderName, builder_email: builderEmail, short_description: description, category, stack, live_url: liveUrl, repository_url: repositoryUrl },
    });

    for (const [index, image] of images.entries()) {
      const storagePath = `${projectId}/${randomUUID()}.${types.get(image.type)}`;
      await uploadProjectImage(storagePath, image);
      uploaded.push(storagePath);
      await supabaseRequest('/rest/v1/community_project_images', { method: 'POST', headers: { prefer: 'return=minimal' }, json: { project_id: projectId, storage_path: storagePath, sort_order: index } });
    }

    await supabaseRequest('/rest/v1/wall_activity', { method: 'POST', headers: { prefer: 'return=minimal' }, json: { fingerprint, action: 'submit', successful: true } });
    return NextResponse.json({ ok: true, message: 'Thanks — your project was sent and is waiting for admin review.' }, { status: 201 });
  } catch (error) {
    console.error('Wall submission failed:', error);
    try {
      await removeProjectImages(uploaded);
      if (projectId) await supabaseRequest(`/rest/v1/community_projects?id=eq.${projectId}`, { method: 'DELETE' });
    } catch (cleanupError) {
      console.error('Wall submission cleanup failed:', cleanupError);
    }
    return NextResponse.json({ error: 'We could not save this project. Please try again.' }, { status: 503 });
  }
}
