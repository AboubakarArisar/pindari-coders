import OpportunityRadar from '../../components/opportunity-radar';

export const metadata = { title: 'Developer opportunities', description: 'Fresh Pakistan and worldwide remote developer jobs and internships, collected automatically every day.' };

export default function OpportunitiesPage() {
  return <main className="wrap section"><div className="page-heading opportunity-heading"><p className="eyebrow">THE OPPORTUNITY RADAR</p><h1>your next move<br /><span className="serif-word">might be here.</span></h1><p>Fresh jobs and internships for developers in Pakistan and remote teams worldwide. Filter the noise and go directly to the original listing.</p></div><OpportunityRadar /></main>;
}
