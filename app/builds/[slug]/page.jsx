import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProjectReactions } from '../../../components/wall-gallery';
import { requestFingerprintFromHeaders } from '../../../lib/request-security';
import { publicImageUrl, supabaseRequest } from '../../../lib/supabase-admin';

const emptyReactions = { love: 0, cool: 0, smart: 0, would_use: 0 };

const getProject = cache(async (slug) => {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  const projects = await supabaseRequest(`/rest/v1/community_projects?select=id,slug,title,builder_name,short_description,category,stack,live_url,repository_url,featured,created_at,community_project_images(storage_path,sort_order)&slug=eq.${encodeURIComponent(slug)}&moderation_status=eq.approved&limit=1`);
  const project = projects[0];
  if (!project) return null;
  return {
    ...project,
    images: [...(project.community_project_images || [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => publicImageUrl(image.storage_path)),
    community_project_images: undefined,
  };
});

async function getProjectWithReactions(slug) {
  const project = await getProject(slug);
  if (!project) return null;
  const fingerprint = requestFingerprintFromHeaders(await headers());
  const [countRows, selectionRows] = await Promise.all([
    supabaseRequest(`/rest/v1/community_project_reaction_counts?select=love_count,cool_count,smart_count,would_use_count&project_id=eq.${project.id}`),
    supabaseRequest(`/rest/v1/community_project_reactions?select=reaction&project_id=eq.${project.id}&fingerprint=eq.${fingerprint}&limit=1`),
  ]);
  const counts = countRows[0];
  return {
    ...project,
    reactions: counts ? {
      love: Number(counts.love_count) || 0,
      cool: Number(counts.cool_count) || 0,
      smart: Number(counts.smart_count) || 0,
      would_use: Number(counts.would_use_count) || 0,
    } : emptyReactions,
    selected_reaction: selectionRows[0]?.reaction || null,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: 'Build not found' };
  return {
    title: { absolute: `${project.title} — PindariCoders` },
    description: project.short_description.slice(0, 160),
  };
}

export default async function BuildPage({ params }) {
  const { slug } = await params;
  const project = await getProjectWithReactions(slug);
  if (!project) notFound();

  const primaryUrl = project.live_url || project.repository_url;
  const submitted = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(project.created_at));

  return <main className="wrap section build-detail">
    <a className="build-back" href="/wall/">← back to the wall</a>
    <header className={`build-hero${project.images.length ? '' : ' no-image'}`}>
      <div className="build-hero-copy">
        <p className="eyebrow">{project.featured ? '✳ FEATURED BUILD' : `${project.category.toUpperCase()} BUILD`}</p>
        <h1>{project.title}</h1>
        <p className="build-intro">{project.short_description}</p>
        <p className="build-byline">Built by <strong>{project.builder_name}</strong></p>
        {project.stack.length > 0 && <div className="wall-stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>}
        {primaryUrl && <div className="build-actions"><a className="button primary" href={primaryUrl} target="_blank" rel="noopener noreferrer">visit project ↗</a>{project.live_url && project.repository_url && <a className="button" href={project.repository_url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</div>}
        <ProjectReactions project={project} />
      </div>
      {project.images[0] && <figure className="build-lead-image"><img src={project.images[0]} alt={`Screenshot of ${project.title}`} /></figure>}
    </header>

    {project.images.length > 1 && <section className="build-gallery" aria-label={`${project.title} screenshots`}>{project.images.slice(1).map((image, index) => <img src={image} alt={`Screenshot ${index + 2} of ${project.title}`} key={image} />)}</section>}

    <div className="build-content">
      <section className="build-about" aria-labelledby="about-build"><p className="eyebrow">THE PROJECT</p><h2 id="about-build">About this build</h2><p>{project.short_description}</p></section>
      <aside className="build-facts" aria-label="Project details">
        <h2>Build details</h2>
        <dl>
          <div><dt>Built by</dt><dd>{project.builder_name}</dd></div>
          <div><dt>Category</dt><dd>{project.category}</dd></div>
          {project.stack.length > 0 && <div><dt>Tech stack</dt><dd>{project.stack.join(', ')}</dd></div>}
          <div><dt>Submitted</dt><dd>{submitted}</dd></div>
          {primaryUrl && <div><dt>Project URL</dt><dd><a href={primaryUrl} target="_blank" rel="noopener noreferrer">{new URL(primaryUrl).hostname} ↗</a></dd></div>}
        </dl>
      </aside>
    </div>
  </main>;
}
