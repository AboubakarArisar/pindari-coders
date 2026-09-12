import './globals.css';
import SiteHeader from '../components/site-header';
import SiteFooter from '../components/site-footer';

export const metadata = {
  title: { default: 'PindariCoders — a little corner for curious builders', template: '%s | PindariCoders' },
  description: 'Learn coding, explore experiments, and discover trending AI stories with Abou Bakar and Muhammad Abdullah.',
  authors: [{ name: 'Abou Bakar', url: 'https://aboubakarisar.tech/' }, { name: 'Muhammad Abdullah' }],
  icons: { icon: '/icon.svg' },
};
export const viewport = { themeColor: '#f7f8f2' };

export default function RootLayout({ children }) {
  return <html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head><body><a className="skip-link" href="#main-content">Skip to content</a><SiteHeader /><div id="main-content">{children}</div><SiteFooter /></body></html>;
}
