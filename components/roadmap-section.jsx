import Link from 'next/link';
import { roadmaps } from '../lib/roadmaps';

export default function RoadmapSection({ standalone = false }) {
  return <section className={`roadmap-section ${standalone ? 'roadmap-directory' : ''}`} id="roadmaps" aria-labelledby="roadmaps-title"><div className="wrap section">
    <div className="section-head"><div><p className="eyebrow">A LITTLE DIRECTION</p>{standalone ? <h1 id="roadmaps-title">find your next <span className="serif-word">step.</span></h1> : <h2 id="roadmaps-title">a path for your curiosity.</h2>}</div><p>You don’t need to learn everything.<br />Just the next useful thing.</p></div>
    {standalone && <p className="roadmap-intro">Choose a path. Explore the topics in order, open the learning resources, and build something at every step.</p>}
    <div className="roadmap-grid">{roadmaps.map((roadmap, index) => <Link className="roadmap-card" href={`/roadmaps/${roadmap.slug}/`} key={roadmap.slug}>
      <div className="roadmap-card-top"><span className="roadmap-symbol" aria-hidden="true">{roadmap.symbol}</span><span className="eyebrow">0{index + 1} / {roadmap.steps.length} STEPS</span></div>
      <span className="roadmap-category">{roadmap.category}</span><h3>{roadmap.title}</h3><p>{roadmap.summary}</p><span className="roadmap-card-bottom">explore this path <span aria-hidden="true">↗</span></span>
    </Link>)}</div>
    <div className="roadmap-directory-footer">{standalone ? <p>New to coding? Start with <Link href="/roadmaps/frontend/">Frontend</Link>. Already know JavaScript? Try <Link href="/roadmaps/react/">React</Link> or <Link href="/roadmaps/backend/">Backend</Link>.</p> : <Link className="text-link" href="/roadmaps/">all learning paths <span aria-hidden="true">↗</span></Link>}<p>Our focused starting paths. For a broader view, explore <a href="https://roadmap.sh/" target="_blank" rel="noopener noreferrer">roadmap.sh ↗</a>.</p></div>
  </div></section>;
}
