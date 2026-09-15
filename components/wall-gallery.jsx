'use client';

import { useCallback, useEffect, useState } from 'react';

const categories = ['All', 'Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other'];

export default function WallGallery() {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (category !== 'All') params.set('category', category);
      if (activeQuery) params.set('q', activeQuery);
      const response = await fetch(`/api/wall/projects?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Projects could not be loaded.');
      setProjects(data.items);
      setPages(data.pages);
      setTotal(data.total);
    } catch (loadError) {
      setProjects([]);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [activeQuery, category, page]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const search = (event) => {
    event.preventDefault();
    setPage(1);
    setActiveQuery(query.trim());
  };

  const submitProject = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitStatus('');
    try {
      const response = await fetch('/api/wall/submit', { method: 'POST', body: new FormData(event.currentTarget) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your project could not be submitted.');
      event.currentTarget.reset();
      setSubmitStatus(data.message);
    } catch (submitError) {
      setSubmitStatus(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    <section className="wall-toolbar" aria-label="Filter community projects">
      <form className="wall-search" onSubmit={search}><label htmlFor="wall-search">Find a project</label><div><input id="wall-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects or builders" /><button type="submit">search</button></div></form>
      <label>Domain<select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <div className="wall-count"><strong>{total}</strong><span>projects shared</span></div>
      <button className="button primary wall-submit-open" type="button" onClick={() => setShowForm((visible) => !visible)}>{showForm ? 'close form' : 'put your project on the wall ↗'}</button>
    </section>

    {showForm && <section className="wall-submit-panel" aria-labelledby="wall-submit-title"><div><p className="eyebrow">YOUR WORK BELONGS HERE</p><h2 id="wall-submit-title">share what you built.</h2><p>One useful sentence and a clear screenshot are enough. We review each submission before it appears.</p></div><form onSubmit={submitProject}>
      <input className="wall-honeypot" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      <label>Project name<input name="title" required minLength="2" maxLength="100" /></label>
      <div className="wall-form-row"><label>Your name<input name="builderName" required maxLength="80" /></label><label>Your email <span>(kept private)</span><input name="builderEmail" type="email" required maxLength="160" /></label></div>
      <label>What did you build?<textarea name="description" required minLength="20" maxLength="800" rows="4" placeholder="What it does, who it helps, or what you learned." /></label>
      <div className="wall-form-row"><label>Domain<select name="category" required>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Stack <span>(comma separated)</span><input name="stack" maxLength="160" placeholder="Next.js, Supabase, Tailwind" /></label></div>
      <div className="wall-form-row"><label>Live URL<input name="liveUrl" type="url" placeholder="https://" /></label><label>GitHub URL<input name="repositoryUrl" type="url" placeholder="https://" /></label></div>
      <label>Project images <span>(1–3 JPG, PNG or WebP files, 3 MB each)</span><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required /></label>
      <button className="button primary" type="submit" disabled={submitting}>{submitting ? 'sharing your project…' : 'send for review ↗'}</button>
      {submitStatus && <p className="wall-form-status" role="status">{submitStatus}</p>}
    </form></section>}

    {loading ? <div className="wall-grid" aria-label="Loading community projects">{Array.from({ length: 6 }, (_, index) => <div className="wall-skeleton" key={index}><i /><b /><i /><i /></div>)}</div> : error ? <div className="wall-empty"><span aria-hidden="true">{'{ ! }'}</span><h2>the wall is resting.</h2><p>{error}</p><button className="button" onClick={loadProjects}>try again</button></div> : projects.length ? <div className="wall-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div> : <div className="wall-empty"><span aria-hidden="true">{'{ : ) }'}</span><h2>the first space is open.</h2><p>Share a project and help begin the wall.</p></div>}

    {pages > 1 && <nav className="pagination wall-pagination" aria-label="Project pages"><button disabled={page === 1} onClick={() => { setPage((value) => value - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>← previous</button><span>{page} / {pages}</span><button disabled={page === pages} onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>next →</button></nav>}
  </>;
}

function ProjectCard({ project }) {
  const destination = project.live_url || project.repository_url;
  return <article className={`wall-card${project.featured ? ' is-featured' : ''}`}>
    <a href={destination} target="_blank" rel="noopener noreferrer">
      <div className="wall-card-image">{project.images[0] ? <img src={project.images[0]} alt={`Screenshot of ${project.title}`} /> : null}<span>{project.featured ? '✳ featured' : project.category}</span></div>
      <div className="wall-card-copy"><div><p className="eyebrow">BY {project.builder_name.toUpperCase()}</p><span aria-hidden="true">↗</span></div><h2>{project.title}</h2><p>{project.short_description}</p><div className="wall-stack">{project.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div></div>
    </a>
  </article>;
}
