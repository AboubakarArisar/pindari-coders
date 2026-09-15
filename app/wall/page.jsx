import WallGallery from '../../components/wall-gallery';

export const metadata = { title: 'The Wall — community projects', description: 'Projects built by the PindariCoders community, shared to help the next person make something.' };

export default function WallPage() {
  return <main className="wrap section wall-page">
    <div className="page-heading wall-heading"><p className="eyebrow">BUILT BY PEOPLE WHO STARTED ANYWAY</p><h1>the community<br /><span className="serif-word">project wall.</span></h1><p>Finished, unfinished, tiny or ambitious—share what you made and help someone else see what is possible.</p></div>
    <WallGallery />
  </main>;
}
