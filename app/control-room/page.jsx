import ControlRoom from '../../components/control-room';

export const metadata = { title: 'Control room', robots: { index: false, follow: false } };

export default function ControlRoomPage() {
  return <main className="wrap section control-page"><ControlRoom /></main>;
}
