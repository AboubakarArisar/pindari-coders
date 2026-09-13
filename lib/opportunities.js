export const SANITY_PROJECT = 'uffqpes0';
export const OPPORTUNITY_QUERY = '*[_type == "opportunity" && !(_id in path("drafts.**")) && (!defined(expiresAt) || expiresAt >= now())] | order(publishedAt desc){"id":_id,title,company,description,url,location,workMode,type,experience,domain,source,skills,salary,publishedAt,expiresAt}';
export const OPPORTUNITY_ENDPOINT = `https://${SANITY_PROJECT}.apicdn.sanity.io/v2026-09-13/data/query/production?${new URLSearchParams({ query: OPPORTUNITY_QUERY, perspective: 'published' })}`;

export function normalizeOpportunities(data) {
  if (!Array.isArray(data?.result)) throw new Error('Opportunity service returned an unexpected response.');
  const seen = new Set();
  return data.result.flatMap(item => {
    if (!item || ['id', 'title', 'company', 'description', 'url', 'location', 'type', 'source', 'publishedAt'].some(key => typeof item[key] !== 'string' || !item[key].trim()) || item.id.startsWith('drafts.') || seen.has(item.id)) return [];
    try {
      const url = new URL(item.url);
      const published = Date.parse(item.publishedAt), expires = item.expiresAt ? Date.parse(item.expiresAt) : null;
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !Number.isFinite(published) || (expires !== null && !Number.isFinite(expires))) return [];
      seen.add(item.id);
      return [{
        id: item.id, title: item.title.trim(), company: item.company.trim(), description: item.description.trim(), url: url.href,
        location: item.location.trim(), workMode: typeof item.workMode === 'string' ? item.workMode : '', type: item.type.trim(),
        experience: typeof item.experience === 'string' ? item.experience : 'Any experience', domain: typeof item.domain === 'string' ? item.domain : 'General tech',
        source: item.source.trim(), skills: Array.isArray(item.skills) ? item.skills.filter(skill => typeof skill === 'string').slice(0, 6) : [],
        salary: typeof item.salary === 'string' ? item.salary.trim() : '', published, expires,
      }];
    } catch { return []; }
  });
}

export function opportunityPage(items, filters = {}, pageSize = 12) {
  const query = (filters.query || '').trim().toLowerCase();
  const filtered = items.filter(item => {
    const searchText = `${item.title} ${item.company} ${item.description} ${item.skills.join(' ')}`.toLowerCase();
    return (!query || searchText.includes(query))
      && (!filters.location || filters.location === 'All' || item.location === filters.location)
      && (!filters.type || filters.type === 'All' || item.type === filters.type)
      && (!filters.domain || filters.domain === 'All' || item.domain === filters.domain)
      && (!filters.experience || filters.experience === 'All' || item.experience === filters.experience);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(Math.max(1, Number(filters.page) || 1), pages);
  return { items: filtered.slice((current - 1) * pageSize, current * pageSize), total: filtered.length, pages, current };
}

export function deadlineLabel(expires, now = Date.now()) {
  if (!expires) return 'Check source for deadline';
  const days = Math.ceil((expires - now) / 86400000);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Closes today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
