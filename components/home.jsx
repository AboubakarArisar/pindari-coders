import Link from 'next/link';
import HeroVideo from './hero-video';

const adventures = [
  { href: '/learn/', title: 'find a direction.', text: 'Learning paths, one useful step at a time.' },
  { href: '/lab/', title: 'get your hands into it.', text: 'Little experiments that make things click.' },
  { href: '/trending/', title: 'see what’s moving.', text: 'Fresh AI stories worth a closer look.' },
];

const tickerItems = ['LEARN SOMETHING', 'MAKE SOMETHING', 'PASS IT ON', 'STAY CURIOUS'];

function TickerGroup({ hidden = false }) {
  return <div className="ticker-group" aria-hidden={hidden || undefined}>{tickerItems.map((item) => <span className="ticker-item" key={item}><span>{item}</span><b aria-hidden="true">✳</b></span>)}</div>;
}

export default function Home() {
  return <main>
    <section className="welcome-hero wrap">
      <div className="welcome-copy">
        <p className="eyebrow">FOR THE ONES WHO KEEP ASKING “HOW?”</p>
        <h1>learn a little.<br />build something.<br /><span className="serif-word">stay curious.</span></h1>
        <p>A space to find your way into coding, make things that work, and keep up with what’s happening in AI. Built by two friends who wanted a place like this.</p>
        <div className="welcome-actions"><Link className="button primary" href="/learn/">find your starting point ↗</Link><Link className="text-link" href="/story/">the story behind it</Link></div>
        <p className="welcome-footnote">small steps count. you’re welcome here.</p>
      </div>
      <HeroVideo />
    </section>

    <div className="ticker" aria-label="Learn something, make something, pass it on, stay curious"><div className="ticker-track"><TickerGroup /><TickerGroup hidden /></div></div>

    <section className="home-story wrap">
      <div className="founder-miniatures"><img src="/abou-bakar.png" width="76" height="92" alt="Abou Bakar" /><img src="/muhammad-abdullah.jpeg" width="76" height="92" alt="Muhammad Abdullah" /></div>
      <div><p className="eyebrow">TWO FRIENDS. ONE IDEA WORTH RETURNING TO.</p><p>We started PindariCoders to help others learn coding and explore tech. Life put it on pause. The idea stayed.</p><Link className="text-link" href="/story/">meet Abou Bakar & Muhammad Abdullah ↗</Link></div>
    </section>

    <section className="home-explore wrap" aria-labelledby="home-explore-title">
      <aside className="start-board home-start-board" aria-label="Explore PindariCoders">
        <div className="board-bar" id="home-explore-title">✳ &nbsp; your next small adventure</div>
        {adventures.map((item, index) => <Link className="board-route" href={item.href} key={item.href}><span className="route-number">0{index + 1}</span><div><h2>{item.title}</h2><p>{item.text}</p></div><span aria-hidden="true">↗</span></Link>)}
        <div className="board-footer">{'{ : ) }'} &nbsp; no perfect starting point needed.</div>
      </aside>
    </section>
  </main>;
}
