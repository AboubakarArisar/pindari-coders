import Link from 'next/link';
export default function NotFound() {
  return <main className="wrap section"><p className="eyebrow">404 / A SMALL DETOUR</p><h1>This path doesn’t exist.</h1><p>There are still plenty of good places to start.</p><Link className="button primary" href="/roadmaps/">explore the roadmaps ↗</Link></main>;
}
