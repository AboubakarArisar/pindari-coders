'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RESOURCE_ENDPOINT, normalizeResources } from '../lib/resources';

export default function ResourceShelf() {
  const [refresh, setRefresh] = useState(0);
  const [feed, setFeed] = useState({ state: 'loading', items: [] });
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let active = true;
    async function load() {
      setFeed(previous => ({ ...previous, state: 'loading' }));
      try {
        const response = await fetch(RESOURCE_ENDPOINT, { signal: controller.signal, credentials: 'omit' });
        if (!response.ok) throw new Error(`Resources returned ${response.status}`);
        const items = normalizeResources(await response.json());
        if (active) setFeed({ state: 'ready', items });
      } catch {
        if (active) setFeed(previous => ({ ...previous, state: 'error' }));
      } finally { clearTimeout(timeout); }
    }
    load();
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [refresh]);
  return <section aria-label="Resource collection" aria-busy={feed.state === 'loading'}>
    <div role="status">{feed.state === 'loading' && <p className="feed-status">Loading the latest finds…</p>}{feed.state === 'error' && <p className="feed-status">The resource shelf couldn’t be refreshed. {feed.items.length > 0 && 'Previous results are shown below.'} <button className="text-button" onClick={() => setRefresh(value => value + 1)}>try again ↻</button></p>}</div>
    {feed.items.length > 0 && <div className="resource-grid">{feed.items.map(resource => <a className="resource-card" key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer"><img src={resource.image} alt={resource.alt} width="640" height="360" loading="lazy"/><div><div className="news-topic-tags">{resource.category && <span>{resource.category}</span>}{resource.pricing && <span>{resource.pricing}</span>}</div><h2>{resource.name} ↗</h2><p>{resource.description}</p><span className="text-link">visit resource ↗</span></div></a>)}</div>}
    {feed.state === 'ready' && !feed.items.length && <section className="resource-empty"><span className="shelf-symbol" aria-hidden="true">[ + ]</span><p className="eyebrow">A SHELF WORTH FILLING CAREFULLY</p><h2>the first finds are still on their way.</h2><p>We’re making room for useful libraries and tools, with a clear explanation of what each one helps you do. Check back for our first additions.</p><Link className="button primary" href="/lab/">explore the lab meanwhile ↗</Link></section>}
  </section>;
}
