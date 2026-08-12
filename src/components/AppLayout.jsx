import { Link, Outlet, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n.jsx';
import Logo from './Logo.jsx';
import { BottomNav, MobileMenuProvider } from './ui.jsx';
import {
  IconHome, IconTasks, IconGames, IconWallet, IconPlans, IconHistory,
  IconRefer, IconSocial, IconLeaderboard, IconSupport, IconMore,
} from './AppIcons.jsx';

const NAV = [
  ['/app', IconHome, 'home'],
  ['/app/tasks', IconTasks, 'tasks'],
  ['/app/games', IconGames, 'games'],
  ['/app/wallet', IconWallet, 'wallet'],
  ['/app/plans', IconPlans, 'plans'],
  ['/app/history', IconHistory, 'history'],
  ['/app/refer', IconRefer, 'refer'],
  ['/app/social', IconSocial, 'socialTasks'],
  ['/app/leaderboard', IconLeaderboard, 'leaderboard'],
  ['/app/support', IconSupport, 'support'],
  ['/app/more', IconMore, 'more'],
];

function SideNav() {
  const { t } = useI18n();
  const loc = useLocation();
  const active = (to) => loc.pathname === to || (to !== '/app' && loc.pathname.startsWith(to));

  return (
    <aside className="app-sidebar">
      <Link to="/app" className="sidebar-brand"><Logo size={36} showTag markOnly /></Link>
      <nav className="sidebar-nav">
        {NAV.map(([to, Ic, key]) => (
          <Link key={to} to={to} className={active(to) ? 'active' : ''}>
            <span className="ic"><Ic size={18} /></span>{t(key)}
          </Link>
        ))}
      </nav>
      <Link to="/" className="sidebar-back">← {t('home')} (Web)</Link>
    </aside>
  );
}

export default function AppLayout() {
  return (
    <MobileMenuProvider>
      <div className="app-shell">
        <SideNav />
        <main className="app-main">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </MobileMenuProvider>
  );
}
