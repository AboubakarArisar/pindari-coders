import ResourceShelf from '../../components/resource-shelf';
export const metadata = { title: 'Resources', description: 'A growing collection of useful libraries, tools, and resources for making things.' };
export default function ResourcesPage() {
  return <main className="wrap section"><div className="page-heading"><p className="eyebrow">THE RESOURCE SHELF</p><h1>good tools.<br /><span className="serif-word">less friction.</span></h1><p>Libraries, tools, and useful finds. A place to discover what helps, understand what it does, and go straight to the source.</p></div><ResourceShelf /></main>;
}
