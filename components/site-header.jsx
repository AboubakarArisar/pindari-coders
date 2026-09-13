import Link from 'next/link';
export default function SiteHeader() { return (<header className="site-header-shell"><div className="site-header wrap">
  <Link className="brand" href="/" aria-label="PindariCoders home"><span className="brand-mark" aria-hidden="true">✳</span> pindari<span className="brand-light">coders</span><span className="brand-period">.</span></Link>
  <nav aria-label="Main navigation"><Link href="/learn/">learn</Link><Link href="/lab/">the lab</Link><Link href="/trending/">trending</Link><Link href="/resources/">resources</Link><Link className="nav-opportunities" href="/opportunities/"><span className="nav-live-dot" aria-hidden="true" /><span className="nav-opportunity-label">opportunities</span><span className="nav-opportunity-short">jobs</span></Link><Link href="/story/">our story</Link></nav>
  <Link className="header-link" href="/roadmaps/">find your path ↗</Link>
</div></header>); }
