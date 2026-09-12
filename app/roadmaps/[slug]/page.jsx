import Link from 'next/link';
import { notFound } from 'next/navigation';
import { roadmaps, findRoadmap } from '../../../lib/roadmaps';
import RoadmapExplorer from '../../../components/roadmap-explorer';

export function generateStaticParams() { return roadmaps.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }) {
  const roadmap = findRoadmap((await params).slug);
  return roadmap ? { title: `${roadmap.label} roadmap`, description: roadmap.summary } : { title: 'Roadmap not found' };
}
export default async function RoadmapPage({ params }) {
  const roadmap = findRoadmap((await params).slug);
  if (!roadmap) notFound();
  return <main className="wrap roadmap-page">
    <Link href="/roadmaps/" className="back-link">← all roadmaps</Link>
    <div className="roadmap-heading"><div><p className="eyebrow">LEARNING PATH / {roadmap.steps.length} STEPS</p><h1>{roadmap.title}<span className="roadmap-heading-dot">.</span></h1><p>{roadmap.summary}</p></div><div className="roadmap-outcome"><span className="eyebrow">YOUR FINISH LINE</span><p>{roadmap.outcome}</p></div></div>
    <p className="prerequisite"><strong>Before you start</strong><span>{roadmap.prerequisite}</span></p>
    <RoadmapExplorer roadmap={roadmap} />
    <div className="roadmap-bottom-note"><p>A suggested sequence, not a deadline. Take the detours you need.</p><a href={roadmap.reference} target="_blank" rel="noopener noreferrer">Explore the broader {roadmap.label} map on roadmap.sh ↗</a></div>
  </main>;
}
