'use client';
import { useEffect, useRef, useState } from 'react';
import { TOPICS, SOURCES, newsRequests, normalizeNews, mergeNews, newsPage } from '../lib/news';

export default function TrendingFeed() {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ topic: 'All', source: 'All', sort: 'newest', page: 1 });
  const [feed, setFeed] = useState({ state: 'loading', stories: [], failed: [], updated: null });
  const resultsHeading = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    async function load() {
      setFeed(previous => ({ ...previous, state: 'loading' }));
      try {
        const now = Date.now(), requests = newsRequests(now);
        const results = await Promise.allSettled(requests.map(async request => {
          const response = await fetch(request.url, { signal: controller.signal, credentials: 'omit' });
          if (!response.ok) throw new Error(`${request.source}: ${response.status}`);
          return normalizeNews(await response.json(), request, now);
        }));
        if (!active) return;
        const successful = results.filter(result => result.status === 'fulfilled');
        if (!successful.length) throw new Error('All sources are unavailable.');
        const failed = [...new Set(results.flatMap((result, index) => result.status === 'rejected' ? [requests[index].source] : []))];
        setFeed({ state: 'ready', stories: mergeNews(successful.flatMap(result => result.value)), failed, updated: Date.now() });
        setFilters(previous => ({ ...previous, page: 1 }));
      } catch {
        if (active) setFeed(previous => ({ ...previous, state: 'error' }));
      } finally { clearTimeout(timeout); }
    }
    load();
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [refresh]);
  const page = newsPage(feed.stories, filters);
  function filter(key, value) { setFilters(previous => ({ ...previous, [key]: value, page: 1 })); }
  function navigate(value) {
    setFilters(previous => ({ ...previous, page: value }));
    resultsHeading.current?.focus({ preventScroll: true });
    resultsHeading.current?.scrollIntoView({ block: 'start' });
  }
  return <section className="news-feed" aria-label="AI, tech and job market feed" aria-busy={feed.state === 'loading'}>
    <div className="news-toolbar"><span className="eyebrow">2 SOURCES / LAST 72 HOURS</span><button className="button" disabled={feed.state === 'loading'} onClick={() => setRefresh(value => value + 1)}>{feed.state === 'loading' ? 'fetching stories…' : 'refresh feed ↻'}</button></div>
    <div className="news-filters"><label>Topic<select value={filters.topic} onChange={event => filter('topic', event.target.value)}><option value="All">All topics</option>{TOPICS.map(topic => <option key={topic}>{topic}</option>)}</select></label><label>Source<select value={filters.source} onChange={event => filter('source', event.target.value)}><option value="All">All sources</option>{SOURCES.map(source => <option key={source}>{source}</option>)}</select></label><label>Sort by<select value={filters.sort} onChange={event => filter('sort', event.target.value)}><option value="newest">Newest first</option><option value="popular">Most points / reactions</option></select></label></div>
    <div role="status" className="feed-status">{feed.state === 'loading' && 'Fetching recent stories from Hacker News and DEV Community…'}{feed.state === 'error' && <p>We couldn’t refresh the feed. {page.total ? 'Previous results still within the last 72 hours are shown below.' : 'Please try refreshing again.'}</p>}{feed.state === 'ready' && feed.failed.length > 0 && <p>Some requests to {feed.failed.join(' and ')} failed. Available results are shown; coverage may be incomplete.</p>}</div>
    <h2 className="news-results-heading" tabIndex={-1} ref={resultsHeading}>{page.total} matching {page.total === 1 ? 'story' : 'stories'}</h2>
    {feed.updated && <p className="feed-updated">Fetched {new Date(feed.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {page.total ? `${page.offset + 1}–${page.offset + page.stories.length} of ${page.total}` : '0 results'} · last 72 hours</p>}
    {feed.state !== 'loading' && !page.total && <p className="feed-status">No recent stories match these filters. Try another topic or source, or refresh later.</p>}
    <div className="news-list">{page.stories.map((story, index) => <article className="news-story" key={story.id}><span className="news-rank">{String(page.offset + index + 1).padStart(2, '0')}</span><div><div className="news-source"><span>{story.source} · {story.publisher}</span><time dateTime={new Date(story.published).toISOString()}>{new Date(story.published).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time></div><h2><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title} <span aria-hidden="true">↗</span></a></h2><div className="news-topic-tags">{story.topics.map(topic => <span key={topic}>{topic}</span>)}</div><div className="news-engagement"><span>↑ {story.points} {story.source === 'Hacker News' ? 'points' : 'reactions'}</span><a href={story.discussion} target="_blank" rel="noopener noreferrer">{story.comments} comments</a></div></div></article>)}</div>
    {page.total > 0 && <nav className="news-pagination" aria-label="News pagination"><button disabled={page.current === 1} onClick={() => navigate(page.current - 1)}>← previous</button><label>Page<select aria-label="Go to news page" value={page.current} onChange={event => navigate(Number(event.target.value))}>{Array.from({ length: page.pages }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select>of {page.pages}</label><button disabled={page.current === page.pages} onClick={() => navigate(page.current + 1)}>next →</button></nav>}
    <p className="news-source-note">Live links from <a href="https://hn.algolia.com/" target="_blank" rel="noopener noreferrer">Hacker News</a> and <a href="https://dev.to/" target="_blank" rel="noopener noreferrer">DEV Community</a>. Includes news, opinions, tutorials and career discussions—not a verified job board. Topic labels use search terms, tags and title keywords. Each query fetches up to 100 results; this is a recent selection, not exhaustive coverage. Points and reactions are different community signals, not a universal popularity score.</p>
  </section>;
}
