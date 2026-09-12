export const NEWS_QUERIES = ['AI', 'LLM', 'artificial intelligence'];
export function newsUrl(query, now = Date.now()) {
  const parameters = new URLSearchParams({ query, tags: 'story', hitsPerPage: '50', numericFilters: `created_at_i>${Math.floor(now / 1000) - 7 * 86400}` });
  return `https://hn.algolia.com/api/v1/search?${parameters}`;
}
export function rankStories(results, now = Date.now()) {
  const stories = new Map();
  for (const result of results) {
    if (!result || !Array.isArray(result.hits)) continue;
    for (const hit of result.hits) {
      if (!hit || !/^\d+$/.test(String(hit.objectID)) || typeof hit.title !== 'string' || !hit.title.trim() || !Number.isFinite(hit.created_at_i)) continue;
      if (hit.created_at_i * 1000 < now - 7 * 86400000 || hit.created_at_i * 1000 > now) continue;
      let articleUrl;
      try { const parsed = new URL(hit.url); if (['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password) articleUrl = parsed.href; }
      catch { articleUrl = undefined; }
      const discussion = `https://news.ycombinator.com/item?id=${hit.objectID}`;
      stories.set(String(hit.objectID), { id: String(hit.objectID), title: hit.title.trim(), url: articleUrl || discussion, discussion, publisher: articleUrl ? new URL(articleUrl).hostname.replace(/^www\./, '') : 'news.ycombinator.com', points: Number.isFinite(hit.points) ? Math.max(0, hit.points) : 0, comments: Number.isFinite(hit.num_comments) ? Math.max(0, hit.num_comments) : 0, published: hit.created_at_i * 1000 });
    }
  }
  return [...stories.values()].sort((a, b) => b.points - a.points || b.published - a.published).slice(0, 24);
}
