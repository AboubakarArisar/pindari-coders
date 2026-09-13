export const SANITY_PROJECT = 'uffqpes0';
export const RESOURCE_QUERY = '*[_type == "resource" && !(_id in path("drafts.**"))] | order(_createdAt desc){"id":_id,name,description,url,category,pricing,"image":image.asset->url,"alt":image.alt}';
export const RESOURCE_ENDPOINT = `https://${SANITY_PROJECT}.apicdn.sanity.io/v2026-09-13/data/query/production?${new URLSearchParams({ query: RESOURCE_QUERY, perspective: 'published' })}`;
export function normalizeResources(data) {
  if (!Array.isArray(data?.result)) throw new Error('Resource service returned an unexpected response.');
  const seen = new Set();
  return data.result.flatMap(item => {
    if (!item || ['id', 'name', 'description', 'url', 'image'].some(key => typeof item[key] !== 'string' || !item[key].trim()) || item.id.startsWith('drafts.') || seen.has(item.id)) return [];
    try {
      const url = new URL(item.url), image = new URL(item.image);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || image.protocol !== 'https:' || image.hostname !== 'cdn.sanity.io' || !image.pathname.startsWith(`/images/${SANITY_PROJECT}/production/`)) return [];
      image.search = new URLSearchParams({ w: '800', fit: 'max', auto: 'format' }).toString();
      seen.add(item.id);
      return [{ id: item.id, name: item.name.trim(), description: item.description.trim(), url: url.href, image: image.href, alt: typeof item.alt === 'string' ? item.alt : '', category: typeof item.category === 'string' ? item.category : '', pricing: typeof item.pricing === 'string' ? item.pricing : '' }];
    } catch { return []; }
  });
}

export function resourcePage(items, { category = 'All', pricing = 'All', page = 1 } = {}, pageSize = 12) {
  const filtered = items.filter(item => (category === 'All' || item.category === category) && (pricing === 'All' || item.pricing === pricing));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(Math.max(1, page), pages);
  return { items: filtered.slice((current - 1) * pageSize, current * pageSize), total: filtered.length, pages, current };
}
