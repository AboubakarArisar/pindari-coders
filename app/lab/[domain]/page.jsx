import Link from 'next/link';
import { notFound } from 'next/navigation';
import { labDomains } from '../../../lib/lab-modules';
import FrontendLab from '../../../components/lab';
import DomainModules from '../../../components/domain-modules';
export const dynamicParams = false;
export function generateStaticParams() { return labDomains.map(({ slug }) => ({ domain: slug })); }
export async function generateMetadata({ params }) { const { domain } = await params; const data = labDomains.find(item=>item.slug === domain); return { title: data ? `${data.title} lab` : 'Lab not found' }; }
export default async function DomainLabPage({ params }) {
  const { domain } = await params;
  const data = labDomains.find(item=>item.slug===domain);
  if (!data) notFound();
  if (domain === 'frontend') return <><div className="wrap lab-back"><Link className="back-link" href="/lab/">← all lab domains</Link></div><FrontendLab /></>;
  return <main className="wrap section"><Link className="back-link" href="/lab/">← all lab domains</Link><div className="page-heading"><p className="eyebrow">THE LAB / {data.modules.length} MODULES</p><h1>{data.title}<span className="roadmap-heading-dot">.</span></h1><p>{data.description}</p></div><DomainModules domain={domain} /></main>;
}
