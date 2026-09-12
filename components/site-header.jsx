import Link from 'next/link';
export default function SiteHeader() { return (<header className="site-header wrap">
  <a className="brand" href="/" aria-label="PindariCoders home"><span className="brand-mark" aria-hidden="true">✳</span> pindari<span className="brand-light">coders</span><span className="brand-period">.</span></a>
  <nav aria-label="Main navigation"><a href="/#experiments">the lab</a><Link href="/roadmaps/">roadmaps</Link><a href="/#notes">field notes</a><a href="/#about">the story</a></nav>
  <a className="header-link" href="https://aboubakarisar.tech/" target="_blank" rel="noopener noreferrer">meet the maker <span aria-hidden="true">↗</span></a>
</header>); }
