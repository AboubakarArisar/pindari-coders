'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RESOURCE_ENDPOINT, normalizeResources, resourcePage } from '../lib/resources';

export default function ResourceShelf() {
  const [refresh, setRefresh] = useState(0);
  const [feed, setFeed] = useState({ state: 'loading', items: [] });
  const [filters, setFilters] = useState({ category: 'All', pricing: 'All' });
  const [page, setPage] = useState(1);
  const resultsRef = useRef(null);
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
  const categories = ['All', ...new Set(feed.items.map(item => item.category).filter(Boolean).sort())];
  const prices = ['All', ...new Set(feed.items.map(item => item.pricing).filter(Boolean))];
  const results = resourcePage(feed.items, { ...filters, page });
  function filter(name, value) {
    setFilters(current => ({ ...current, [name]: value }));
    setPage(1);
  }
  function changePage(nextPage) {
    setPage(nextPage);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  return <section aria-label="Resource collection" aria-busy={feed.state === 'loading'}>
    <div role="status">{feed.state === 'loading' && <p className={feed.items.length ? 'feed-status' : 'sr-only'}>Loading resources…</p>}{feed.state === 'error' && <p className="feed-status">The resource shelf couldn’t be refreshed. {feed.items.length > 0 && 'Previous results are shown below.'} <button className="text-button" onClick={() => setRefresh(value => value + 1)}>try again ↻</button></p>}</div>
    {feed.state === 'loading' && !feed.items.length && <div className="resource-grid resource-skeleton-grid" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <article className="resource-skeleton" key={index}><div className="skeleton-logo"><span /></div><div><i /><b /><i /><i /></div></article>)}</div>}
    {feed.items.length > 0 && <>
      <div className="resource-filters">
        <label>Domain<select value={filters.category} onChange={event => filter('category', event.target.value)}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
        <label>Access<select value={filters.pricing} onChange={event => filter('pricing', event.target.value)}>{prices.map(price => <option key={price}>{price}</option>)}</select></label>
        <p aria-live="polite"><strong>{results.total}</strong> {results.total === 1 ? 'resource' : 'resources'} found</p>
      </div>
      <div ref={resultsRef} className="resource-results" style={{ scrollMarginTop: '110px' }}>
        {results.total > 0 ? <div className="resource-grid">{results.items.map((resource, index) => <article className="resource-card" key={resource.id} style={{ '--card-index': index }}><a href={resource.url} target="_blank" rel="noopener noreferrer"><div className="resource-logo"><img src={resource.image} alt={resource.alt} width="512" height="512" loading="lazy"/></div><div className="resource-card-body"><div className="news-topic-tags">{resource.category && <span>{resource.category}</span>}{resource.pricing && <span>{resource.pricing}</span>}</div><h2>{resource.name}<span aria-hidden="true">↗</span></h2><p>{resource.description}</p><span className="resource-visit">visit resource <b aria-hidden="true">↗</b></span></div></a></article>)}</div> : <div className="resource-no-results"><p>No resources match these filters yet.</p><button className="text-button" onClick={() => { setFilters({ category: 'All', pricing: 'All' }); setPage(1); }}>show all resources ↗</button></div>}
        {results.pages > 1 && <nav className="news-pagination" aria-label="Resource pages"><button onClick={() => changePage(results.current - 1)} disabled={results.current === 1}>← previous</button><span>page {results.current} of {results.pages}</span><button onClick={() => changePage(results.current + 1)} disabled={results.current === results.pages}>next →</button></nav>}
      </div>
    </>}
    {feed.state === 'ready' && !feed.items.length && <section className="resource-empty"><span className="shelf-symbol" aria-hidden="true">[ + ]</span><p className="eyebrow">A SHELF WORTH FILLING CAREFULLY</p><h2>the first finds are still on their way.</h2><p>We’re making room for useful libraries and tools, with a clear explanation of what each one helps you do. Check back for our first additions.</p><Link className="button primary" href="/lab/">explore the lab meanwhile ↗</Link></section>}
  </section>;
}
