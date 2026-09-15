import 'server-only';

const BUCKET = 'community-projects';

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('The Wall is not connected to Supabase yet.');
  return { url, key };
}

export async function supabaseRequest(path, options = {}) {
  const { url, key } = config();
  const headers = new Headers(options.headers);
  headers.set('apikey', key);
  headers.set('authorization', `Bearer ${key}`);
  if (options.json !== undefined) headers.set('content-type', 'application/json');

  const response = await fetch(`${url}${path}`, {
    ...options,
    body: options.json === undefined ? options.body : JSON.stringify(options.json),
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 240)}`);
  }

  if (options.returnResponse) return response;
  if (response.status === 204 || response.headers.get('content-length') === '0') return null;
  return response.json();
}

export async function uploadProjectImage(storagePath, file) {
  const { url, key } = config();
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': file.type,
      'x-upsert': 'false',
    },
    body: Buffer.from(await file.arrayBuffer()),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Image upload failed (${response.status}).`);
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export async function removeProjectImages(paths) {
  if (!paths.length) return;
  await supabaseRequest(`/storage/v1/object/${BUCKET}`, { method: 'DELETE', json: { prefixes: paths } });
}

export function publicImageUrl(storagePath) {
  const { url } = config();
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}
