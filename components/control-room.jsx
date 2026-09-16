'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const statuses = ['all', 'pending', 'approved', 'rejected', 'hidden'];
const categories = ['Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other'];

export default function ControlRoom() {
  const [authenticated, setAuthenticated] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/control-room/projects');
      if (response.status === 401) { setAuthenticated(false); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProjects(data.items);
      setAuthenticated(true);
    } catch (error) {
      setMessage(error.message || 'The control room could not be loaded.');
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => projects.filter((project) => filter === 'all' || project.moderation_status === filter), [filter, projects]);
  const counts = useMemo(() => Object.fromEntries(statuses.map((status) => [status, status === 'all' ? projects.length : projects.filter((project) => project.moderation_status === status).length])), [projects]);

  const login = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy('login');
    setMessage('');
    const password = new FormData(form).get('password');
    try {
      const response = await fetch('/api/control-room/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      form.reset();
      await load();
    } catch (error) { setMessage(error.message); } finally { setBusy(''); }
  };

  const update = async (id, changes) => {
    setBusy(id);
    setMessage('');
    try {
      const response = await fetch(`/api/control-room/projects/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(changes) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (error) { setMessage(error.message); } finally { setBusy(''); }
  };

  const save = (event, id) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update(id, { title: data.get('title'), shortDescription: data.get('description'), category: data.get('category'), rejectionReason: data.get('rejectionReason') });
  };

  const remove = async (project) => {
    if (!window.confirm(`Permanently delete “${project.title}” and its images?`)) return;
    setBusy(project.id);
    try {
      const response = await fetch(`/api/control-room/projects/${project.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (error) { setMessage(error.message); } finally { setBusy(''); }
  };

  const logout = async () => {
    setBusy('logout');
    setMessage('');
    try {
      const response = await fetch('/api/control-room/logout', { method: 'POST' });
      if (!response.ok) throw new Error('The control room could not be locked.');
      setProjects([]);
      setAuthenticated(false);
      window.location.replace('/');
    } catch (error) {
      setMessage(error.message || 'The control room could not be locked.');
      setBusy('');
    }
  };

  if (authenticated === null) return <div className="control-loading"><span>✳</span><p>opening the control room…</p></div>;
  if (!authenticated) return <section className="control-login"><p className="eyebrow">OWNERS ONLY</p><h1>the control<br /><span className="serif-word">room.</span></h1><p>One shared key for Abou Bakar and Muhammad Abdullah.</p><form onSubmit={login}><label htmlFor="control-password">Control-room key</label><input id="control-password" name="password" type="password" autoComplete="current-password" required /><button className="button primary" disabled={busy === 'login'}>{busy === 'login' ? 'checking…' : 'enter ↗'}</button></form>{message && <p className="control-message" role="alert">{message}</p>}</section>;

  return <>
    <header className="control-head"><div><p className="eyebrow">THE WALL / MODERATION</p><h1>control room.</h1></div><button className="text-button" disabled={busy === 'logout'} onClick={logout}>{busy === 'logout' ? 'locking…' : 'lock the room ↗'}</button></header>
    <nav className="control-tabs" aria-label="Submission status">{statuses.map((status) => <button className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>{status} <span>{counts[status]}</span></button>)}</nav>
    {message && <p className="control-message" role="status">{message}</p>}
    <div className="control-list">{visible.length ? visible.map((project) => <article className="control-card" key={project.id}>
      <div className="control-image">{project.images[0] ? <img src={project.images[0]} alt="" /> : <span>no image</span>}</div>
      <div className="control-copy"><div className="control-meta"><span>{project.category}</span><span>{project.moderation_status}</span><time>{new Date(project.created_at).toLocaleDateString('en-GB')}</time></div><h2>{project.title}</h2><p>by <strong>{project.builder_name}</strong> · <a href={`mailto:${project.builder_email}`}>{project.builder_email}</a></p><p>{project.short_description}</p><div className="control-links">{project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer">live ↗</a>}{project.repository_url && <a href={project.repository_url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</div>
        <div className="control-actions"><button disabled={busy === project.id} onClick={() => update(project.id, { moderationStatus: 'approved' })}>approve</button><button disabled={busy === project.id || project.moderation_status !== 'approved'} onClick={() => update(project.id, { featured: !project.featured })}>{project.featured ? 'unfeature' : 'feature'}</button><button disabled={busy === project.id} onClick={() => update(project.id, { moderationStatus: 'rejected' })}>reject</button><button disabled={busy === project.id} onClick={() => update(project.id, { moderationStatus: 'hidden' })}>hide</button><button className="danger" disabled={busy === project.id} onClick={() => remove(project)}>delete</button></div>
        <details className="control-edit"><summary>edit project</summary><form onSubmit={(event) => save(event, project.id)}><label>Title<input name="title" defaultValue={project.title} required /></label><label>Description<textarea name="description" defaultValue={project.short_description} minLength="20" rows="4" required /></label><label>Domain<select name="category" defaultValue={project.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Review note<textarea name="rejectionReason" defaultValue={project.rejection_reason || ''} rows="2" /></label><button className="button" disabled={busy === project.id}>save changes</button></form></details>
      </div>
    </article>) : <div className="wall-empty"><span aria-hidden="true">{'{ : ) }'}</span><h2>nothing here.</h2><p>No {filter === 'all' ? '' : filter} submissions right now.</p></div>}</div>
  </>;
}
