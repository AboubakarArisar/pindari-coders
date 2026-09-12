import Link from 'next/link';

const External = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>;

export default function SiteFooter() { return (<footer className="site-footer"><div className="footer-main wrap">
  <div className="footer-intro"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">✳</span> pindaricoders<span className="brand-period">.</span></Link><p>A small corner for learning code, trying ideas, and keeping up with technology.</p></div>
  <nav className="footer-column" aria-label="Footer navigation"><p className="eyebrow">EXPLORE</p><Link href="/learn/">learn</Link><Link href="/roadmaps/">roadmaps</Link><Link href="/lab/">the lab</Link><Link href="/resources/">resources</Link><Link href="/trending/">trending</Link></nav>
  <div className="footer-column"><p className="eyebrow">PINDARICODERS</p><External href="https://www.youtube.com/channel/UCjcPe7QIgs5D9UVULDuXGWQ">YouTube</External><External href="https://web.facebook.com/100091890139657/">Facebook</External><Link href="/story/">our story</Link></div>
  <div className="footer-people"><p className="eyebrow">THE PEOPLE</p><div className="footer-person"><strong>Abou Bakar</strong><div><External href="https://aboubakarisar.tech/">portfolio</External><External href="https://github.com/AboubakarArisar">GitHub</External><External href="https://linkedin.com/in/aboubakarisar">LinkedIn</External></div></div><div className="footer-person"><strong>Muhammad Abdullah</strong><div><External href="https://muhammad-abdullah.dev/">portfolio</External><External href="https://github.com/abdullah-dev5">GitHub</External><External href="https://www.linkedin.com/in/muhammad-abdullah45">LinkedIn</External></div></div></div>
</div><div className="footer-bottom wrap"><span>© 2026 PindariCoders</span><span>stay curious. make a little mess.</span><a href="#main-content">back to top ↑</a></div></footer>); }
