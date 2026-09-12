'use client';
import { useEffect, useState } from 'react';
import { NEWS_QUERIES, newsUrl, rankStories } from '../lib/news';

export default function TrendingFeed() {
  const [refresh, setRefresh] = useState(0);
  const [feed, setFeed] = useState({ state: 'loading', stories: [], partial: false, updated: null });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 12000);
    async function load() {
      setFeed(previous => ({ ...previous, state: 'loading' }));
      try {
        const now = Date.now();
        const results = await Promise.allSettled(NEWS_QUERIES.map(async query => {
          const response = await fetch(newsUrl(query, now), { signal: controller.signal, credentials: 'omit' });
          if (!response.ok) throw new Error(`News source returned ${response.status}`);
          const data = await response.json();
          if (!Array.isArray(data.hits)) throw new Error('News source returned an unexpected response');
          return data;
        }));
        if (!active) return;
        const successful = results.filter(result => result.status === 'fulfilled');
        if (!successful.length) throw new Error('News source unavailable');
        setFeed({ state: 'ready', stories: rankStories(successful.map(result => result.value), now), partial: successful.length < results.length, updated: Date.now() });
      } catch (error) {
        if (active) setFeed(previous => ({ ...previous, state: 'error' }));
      } finally { clearTimeout(timeout); }
    }
    load();
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [refresh]);
  return <section className="news-feed" aria-label="Trending AI stories" aria-busy={feed.state === 'loading'}>
    <div className="news-toolbar"><span className="eyebrow">HACKER NEWS / PAST 7 DAYS</span><button className="button" disabled={feed.state === 'loading'} onClick={() => setRefresh(value => value + 1)}>{feed.state === 'loading' ? 'fetching stories…' : 'refresh feed ↻'}</button></div>
    <div role="status" className="feed-status">{feed.state === 'loading' && 'Finding the AI stories people are talking about…'}{feed.state === 'error' && <p>We couldn’t reach the news source. {feed.stories.length ? 'The previous results are still shown below.' : 'Please try again, or visit the source directly.'} <a href="https://hn.algolia.com/?q=AI" target="_blank" rel="noopener noreferrer">Open Hacker News search ↗</a></p>}{feed.state === 'ready' && feed.partial && <p>Some requests failed. Showing results from the sources that responded.</p>}{feed.state === 'ready' && !feed.stories.length && <p>No matching stories were found this week. Try refreshing later.</p>}</div>
    {feed.updated && <p className="feed-updated">Fetched {new Date(feed.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ranked by points · {feed.stories.length} stories</p>}
    <div className="news-list">{feed.stories.map((story, index) => <article className="news-story" key={story.id}><span className="news-rank">{String(index + 1).padStart(2, '0')}</span><div><div className="news-source"><span>{story.publisher}</span><time dateTime={new Date(story.published).toISOString()}>{new Date(story.published).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</time></div><h2><a href={story.url} target="_blank" rel="noopener noreferrer">{story.title} <span aria-hidden="true">↗</span></a></h2><div className="news-engagement"><span>↑ {story.points} points</span><a href={story.discussion} target="_blank" rel="noopener noreferrer">{story.comments} comments</a></div></div></article>)}</div>
    <p className="news-source-note">Live results from <a href="https://hn.algolia.com/" target="_blank" rel="noopener noreferrer">Hacker News Search by Algolia</a> for AI, LLM, and artificial intelligence. Community links may include opinion, projects, and announcements. Popularity is measured here by Hacker News points, not across the entire internet.</p>
  </section>;
}
