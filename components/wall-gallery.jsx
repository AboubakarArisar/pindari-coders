'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const categories = ['All', 'Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other'];
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maximumImageSize = 3 * 1024 * 1024;

function validHttpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.') ? url : null;
  } catch {
    return null;
  }
}

function validGitHubUrl(value) {
  const url = validHttpsUrl(value);
  if (!url || !['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return false;
  return url.pathname.split('/').filter(Boolean).length >= 2;
}

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
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const imagePreviews = useRef(new Set());

  useEffect(() => () => {
    imagePreviews.current.forEach((preview) => URL.revokeObjectURL(preview));
    imagePreviews.current.clear();
  }, []);

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

  const clearImages = () => {
    imagePreviews.current.forEach((preview) => URL.revokeObjectURL(preview));
    imagePreviews.current.clear();
    setSelectedImages([]);
  };

  const chooseImages = (event) => {
    const input = event.currentTarget;
    const incoming = [...input.files];
    input.value = '';
    setSubmitSucceeded(false);

    const invalid = incoming.find((file) => !allowedImageTypes.has(file.type) || file.size > maximumImageSize);
    if (invalid) {
      setSubmitStatus('Each image must be a JPG, PNG, or WebP file no larger than 3 MB.');
      return;
    }

    const known = new Set(selectedImages.map(({ file }) => `${file.name}:${file.size}:${file.lastModified}`));
    const unique = incoming.filter((file) => !known.has(`${file.name}:${file.size}:${file.lastModified}`));
    if (selectedImages.length + unique.length > 3) {
      setSubmitStatus('Choose exactly three images. Remove one before adding a replacement.');
      return;
    }
    const additions = unique.map((file) => {
      const preview = URL.createObjectURL(file);
      imagePreviews.current.add(preview);
      return { file, preview };
    });
    setSubmitStatus('');
    setSelectedImages([...selectedImages, ...additions]);
  };

  const removeImage = (preview) => {
    URL.revokeObjectURL(preview);
    imagePreviews.current.delete(preview);
    setSelectedImages((current) => current.filter((image) => image.preview !== preview));
    setSubmitSucceeded(false);
    setSubmitStatus('');
  };

  const submitProject = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formValues = new FormData(form);
    const liveUrl = String(formValues.get('liveUrl') || '').trim();
    const repositoryUrl = String(formValues.get('repositoryUrl') || '').trim();
    if (!liveUrl && !repositoryUrl) {
      setSubmitSucceeded(false);
      setSubmitStatus('Add at least one link: a live HTTPS URL or a GitHub repository URL.');
      return;
    }
    if (liveUrl && !validHttpsUrl(liveUrl)) {
      setSubmitSucceeded(false);
      setSubmitStatus('The live URL must be a complete public HTTPS link.');
      return;
    }
    if (repositoryUrl && !validGitHubUrl(repositoryUrl)) {
      setSubmitSucceeded(false);
      setSubmitStatus('The GitHub URL must link to a repository, for example https://github.com/owner/project.');
      return;
    }
    if (selectedImages.length !== 3) {
      setSubmitSucceeded(false);
      setSubmitStatus('Add exactly three project images before sending your project.');
      return;
    }

    setSubmitting(true);
    setSubmitSucceeded(false);
    setSubmitStatus('');
    try {
      formValues.delete('images');
      selectedImages.forEach(({ file }) => formValues.append('images', file, file.name));
      const response = await fetch('/api/wall/submit', { method: 'POST', body: formValues });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your project could not be submitted.');
      form.reset();
      clearImages();
      setSubmitSucceeded(true);
      setSubmitStatus(data.message || 'Thanks — your project was sent and is waiting for admin review.');
    } catch (submitError) {
      setSubmitStatus(submitError.message || 'Your project could not be submitted.');
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

    {showForm && <section className="wall-submit-panel" aria-labelledby="wall-submit-title"><div><p className="eyebrow">YOUR WORK BELONGS HERE</p><h2 id="wall-submit-title">share what you built.</h2><p>Tell us what you made and add three clear screenshots. We review each submission before it appears.</p></div><form onSubmit={submitProject}>
      <input className="wall-honeypot" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      <label>Project name<input name="title" required minLength="2" maxLength="100" /></label>
      <div className="wall-form-row"><label>Your name<input name="builderName" required maxLength="80" /></label><label>Your email <span>(kept private)</span><input name="builderEmail" type="email" required maxLength="160" /></label></div>
      <label>What did you build?<textarea name="description" required minLength="20" maxLength="800" rows="4" placeholder="What it does, who it helps, or what you learned." /></label>
      <div className="wall-form-row"><label>Domain<select name="category" required>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Stack <span>(comma separated)</span><input name="stack" maxLength="160" placeholder="Next.js, Supabase, Tailwind" /></label></div>
      <div className="wall-form-row"><label>Live URL<input name="liveUrl" type="url" inputMode="url" maxLength="300" pattern="https://.*" placeholder="https://your-project.com" /></label><label>GitHub URL<input name="repositoryUrl" type="url" inputMode="url" maxLength="300" pattern="https://(www\.)?github\.com/[^/]+/[^/]+.*" placeholder="https://github.com/owner/project" /></label></div>
      <fieldset className="wall-image-field"><legend>Project images <span>(exactly 3 JPG, PNG or WebP files, 3 MB each)</span></legend><div className="wall-image-list">{selectedImages.map(({ file, preview }, index) => <div className="wall-image-preview" key={preview}><img src={preview} alt={`Selected project screenshot ${index + 1}`} /><button type="button" onClick={() => removeImage(preview)} aria-label={`Remove ${file.name}`}>×</button><span title={file.name}>{file.name}</span></div>)}{selectedImages.length < 3 && <label className="wall-image-add"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseImages} aria-label="Choose project images" /><b aria-hidden="true">+</b><span>{selectedImages.length ? 'add another' : 'choose images'}</span></label>}</div><p>{selectedImages.length} of 3 selected</p></fieldset>
      <button className="button primary" type="submit" disabled={submitting}>{submitting ? 'sharing your project…' : 'send for review ↗'}</button>
      {submitStatus && <p className={`wall-form-status${submitSucceeded ? ' is-success' : ' is-error'}`} role={submitSucceeded ? 'status' : 'alert'}>{submitStatus}</p>}
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
