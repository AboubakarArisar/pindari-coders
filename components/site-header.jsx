import Link from 'next/link';
export default function SiteHeader() { return (<header className="site-header wrap">
  <a className="brand" href="/" aria-label="PindariCoders home"><span className="brand-mark" aria-hidden="true">✳</span> pindari<span className="brand-light">coders</span><span className="brand-period">.</span></a>
  <nav aria-label="Main navigation"><Link href="/learn/">learn</Link><Link href="/lab/">the lab</Link><Link href="/trending/">trending</Link><Link href="/resources/">resources</Link><Link href="/story/">our story</Link></nav>
  <Link className="header-link" href="/roadmaps/">find your path ↗</Link>
</header>); }
