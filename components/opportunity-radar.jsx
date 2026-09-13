'use client';
import { useEffect, useRef, useState } from 'react';
import { OPPORTUNITY_ENDPOINT, deadlineLabel, normalizeOpportunities, opportunityPage } from '../lib/opportunities';

const selectValues = (items, key) => ['All', ...new Set(items.map(item => item[key]).filter(Boolean).sort())];

export default function OpportunityRadar() {
  const [feed, setFeed] = useState({ state: 'loading', items: [] });
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({ query: '', location: 'All', type: 'All', domain: 'All', experience: 'All', page: 1 });
  const resultsRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let active = true;
    fetch(OPPORTUNITY_ENDPOINT, { signal: controller.signal, credentials: 'omit' })
      .then(response => { if (!response.ok) throw new Error(`Opportunities returned ${response.status}`); return response.json(); })
      .then(data => { if (active) setFeed({ state: 'ready', items: normalizeOpportunities(data) }); })
      .catch(() => { if (active) setFeed(previous => ({ ...previous, state: 'error' })); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [refresh]);
  const results = opportunityPage(feed.items, filters);
  const changeFilter = (key, value) => setFilters(current => ({ ...current, [key]: value, page: 1 }));
  const changePage = page => {
    setFilters(current => ({ ...current, page }));
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  return <section className="opportunity-radar" aria-label="Developer opportunities" aria-busy={feed.state === 'loading'}>
    <div className="opportunity-promise"><span aria-hidden="true">↻</span><p><strong>Updated automatically every day.</strong> Listings come from Jooble, Himalayas and Remote OK, then expire from this page after their deadline.</p></div>
    <div role="status">{feed.state === 'error' && <p className="feed-status">The opportunity radar could not refresh. <button className="text-button" onClick={() => setRefresh(value => value + 1)}>try again ↻</button></p>}</div>
    {feed.state === 'loading' && <div className="opportunity-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <article className="opportunity-skeleton" key={index}><i /><b /><i /><i /><span /></article>)}</div>}
    {feed.state === 'ready' && <>
      <div className="opportunity-filters">
        <label className="opportunity-search">Search<input type="search" value={filters.query} placeholder="React, Python, designer…" onChange={event => changeFilter('query', event.target.value)} /></label>
        <label>Location<select value={filters.location} onChange={event => changeFilter('location', event.target.value)}>{selectValues(feed.items, 'location').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Type<select value={filters.type} onChange={event => changeFilter('type', event.target.value)}>{selectValues(feed.items, 'type').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Domain<select value={filters.domain} onChange={event => changeFilter('domain', event.target.value)}>{selectValues(feed.items, 'domain').map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Experience<select value={filters.experience} onChange={event => changeFilter('experience', event.target.value)}>{selectValues(feed.items, 'experience').map(value => <option key={value}>{value}</option>)}</select></label>
      </div>
      <div className="opportunity-result-bar" ref={resultsRef}><p><strong>{results.total}</strong> matching opportunities</p><span>Pakistan + worldwide remote</span></div>
      {results.total ? <div className="opportunity-grid">{results.items.map((item, index) => <article className="opportunity-card" key={item.id} style={{ '--card-index': index }}>
        <div className="opportunity-card-head"><span className="company-letter" aria-hidden="true">{item.company.charAt(0)}</span><div><p>{item.source}</p><h2>{item.title}</h2><strong>{item.company}</strong></div></div>
        <div className="opportunity-tags"><span>{item.location}</span><span>{item.type}</span><span>{item.experience}</span><span>{item.domain}</span></div>
        <p className="opportunity-description">{item.description}</p>
        {item.skills.length > 0 && <div className="opportunity-skills" aria-label="Useful skills">{item.skills.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}</div>}
        <div className="opportunity-card-foot"><time dateTime={item.expires ? new Date(item.expires).toISOString() : undefined}>{deadlineLabel(item.expires)}</time><a href={item.url} target="_blank" rel="noopener noreferrer">view &amp; apply ↗</a></div>
      </article>)}</div> : <div className="resource-no-results"><p>No current opportunities match those filters.</p><button className="text-button" onClick={() => setFilters({ query: '', location: 'All', type: 'All', domain: 'All', experience: 'All', page: 1 })}>clear filters ↗</button></div>}
      {results.pages > 1 && <nav className="news-pagination" aria-label="Opportunity pages"><button disabled={results.current === 1} onClick={() => changePage(results.current - 1)}>← previous</button><span>page {results.current} of {results.pages}</span><button disabled={results.current === results.pages} onClick={() => changePage(results.current + 1)}>next →</button></nav>}
      <p className="opportunity-source-note">Listings link to the original source. Always verify the employer, eligibility and deadline before applying. PindariCoders never asks candidates for payment.</p>
    </>}
  </section>;
}
