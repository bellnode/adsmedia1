import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n.jsx';
import { TopBar } from '../../components/ui.jsx';

const SECTIONS = [
  { title: 'Home Dashboard', desc: 'Balance, stats, menu — no deposit button, Buy Plan only', to: '/app', color: '#0F172A' },
  { title: 'Daily +10 Coins', desc: 'Claim daily coins from home balance card', to: '/app', color: '#1E3A5F' },
  { title: 'Task Center', desc: '6 categories — Daily, Challenging, Gamified, Social, Referral, Bonus', to: '/app/tasks', color: '#0F172A' },
  { title: 'Gamified — Streak', desc: '7-day streak rewards + Spin Wheel', to: '/app/tasks/gamified', color: '#1E3A5F' },
  { title: 'Color Prediction', desc: 'Red/Green/Violet — TAKE CHANCE button, 30s rounds', to: '/app/games/color', color: '#111827' },
  { title: 'Ludo Game', desc: 'Classic board — roll dice vs bot', to: '/app/games/ludo', color: '#312E81' },
  { title: 'Stock Prediction', desc: 'Candlestick chart — UP / DOWN / SIDEWAYS', to: '/app/games/stock', color: '#0F172A' },
  { title: 'Spin Wheel', desc: 'Casino wheel — admin editable prizes, 70% house win', to: '/app/games/spin', color: '#1E3A5F' },
  { title: 'Buy Plan (BSC)', desc: 'Binance QR payment — no separate deposit', to: '/app/plans', color: '#0F172A' },
  { title: 'Admin Panel', desc: 'Edit spin rewards, approve crypto plan orders', to: '/admin', color: '#111827' },
];

export default function UserPanel() {
  const { t } = useI18n();
  return (
    <>
      <TopBar title="User Panel Preview" backTo="/app" />
      <div className="page user-panel-page">
        <div className="user-panel-hero">
          <h2>AdMedia — Client Preview</h2>
          <p>Navy · Black · White theme · Regular fonts · SVG icons · 70% house win on games</p>
        </div>
        {SECTIONS.map(s => (
          <Link key={s.to + s.title} to={s.to} className="user-panel-card" style={{ borderLeftColor: s.color }}>
            <div className="t">{s.title}</div>
            <div className="d">{s.desc}</div>
            <span className="go">Open →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
