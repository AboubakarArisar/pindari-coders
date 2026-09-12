import TrendingFeed from '../../components/trending-feed';
export const metadata = { title: 'Trending in AI', description: 'Live AI stories from Hacker News, ranked by points from the past seven days.' };
export default function TrendingPage() { return <main className="wrap section"><div className="page-heading"><p className="eyebrow">THE TECH CORNER / AI EDITION</p><h1>what’s making<br /><span className="serif-word">some noise.</span></h1><p>AI news, new tools, and interesting ideas from the conversations happening right now.</p></div><TrendingFeed /></main>; }
