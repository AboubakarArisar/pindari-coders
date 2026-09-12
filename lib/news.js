export const NEWS_WINDOW = 3 * 86400000;
export const TOPICS = ['AI', 'Tech', 'Job market', 'Developer tools'];
export const SOURCES = ['Hacker News', 'DEV Community'];
const queries = [['AI', 'AI'], ['LLM', 'AI'], ['technology', 'Tech'], ['software', 'Developer tools'], ['hiring', 'Job market'], ['layoffs', 'Job market'], ['job market', 'Job market']];
export function newsUrl(query, now = Date.now()) {
  const parameters = new URLSearchParams({ query, tags: 'story', hitsPerPage: '100', numericFilters: `created_at_i>${Math.floor((now - NEWS_WINDOW) / 1000)}` });
  return `https://hn.algolia.com/api/v1/search?${parameters}`;
}
export function newsRequests(now = Date.now()) {
  return [
    ...queries.map(([query, topic]) => ({ source: SOURCES[0], topic, url: newsUrl(query, now) })),
    { source: SOURCES[1], topic: null, url: 'https://dev.to/api/articles?tags=ai,technology,career,programming&top=3&per_page=100' },
  ];
}
function safeUrl(value) {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
function count(value) { return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0; }
export function normalizeNews(data, request, now = Date.now()) {
  const hn = request.source === SOURCES[0], items = hn ? data?.hits : data;
  if (!Array.isArray(items)) throw new Error(`${request.source} returned an unexpected response.`);
  return items.flatMap(item => {
    if (!item || typeof item.title !== 'string' || !item.title.trim()) return [];
    const id = String(hn ? item.objectID : item.id), published = hn ? item.created_at_i * 1000 : Date.parse(item.published_timestamp);
    if (!/^\d+$/.test(id) || !Number.isFinite(published) || published < now - NEWS_WINDOW || published > now) return [];
    const discussion = hn ? `https://news.ycombinator.com/item?id=${id}` : safeUrl(item.url);
    const url = safeUrl(item.url) || discussion;
    if (!url) return [];
    const topics = new Set(request.topic ? [request.topic] : []);
    const text = `${item.title} ${Array.isArray(item.tag_list) ? item.tag_list.join(' ') : ''}`;
    if (/\b(ai|llms?|artificial intelligence|machine learning|openai|anthropic)\b/i.test(text)) topics.add('AI');
    if (/\b(hiring|jobs?|career|layoffs?|salaries|salary|recruiting|employment)\b/i.test(text)) topics.add('Job market');
    if (/\b(programming|webdev|javascript|python|opensource|developer tools)\b/i.test(text)) topics.add('Developer tools');
    if (/\b(technology|hardware|security)\b/i.test(text) || !topics.size) topics.add('Tech');
    return [{ id: `${hn ? 'hn' : 'dev'}-${id}`, title: item.title.trim(), url, discussion, publisher: new URL(url).hostname.replace(/^www\./, ''), source: request.source, topics: [...topics], points: count(hn ? item.points : item.public_reactions_count), comments: count(hn ? item.num_comments : item.comments_count), published }];
  });
}
export function mergeNews(stories) {
  const unique = new Map();
  for (const story of stories) {
    const existing = unique.get(story.id);
    unique.set(story.id, existing ? { ...existing, topics: [...new Set([...existing.topics, ...story.topics])] } : story);
  }
  return [...unique.values()];
}
export function newsPage(stories, { topic = 'All', source = 'All', sort = 'newest', page = 1 } = {}, now = Date.now()) {
  const filtered = stories.filter(story => story.published >= now - NEWS_WINDOW && story.published <= now && (topic === 'All' || story.topics.includes(topic)) && (source === 'All' || story.source === source));
  filtered.sort((a, b) => (sort === 'popular' ? b.points - a.points : b.published - a.published) || b.published - a.published || a.id.localeCompare(b.id));
  const pages = Math.max(1, Math.ceil(filtered.length / 10)), current = Math.min(pages, Math.max(1, Math.floor(page) || 1));
  return { stories: filtered.slice((current - 1) * 10, current * 10), total: filtered.length, pages, current, offset: (current - 1) * 10 };
}
