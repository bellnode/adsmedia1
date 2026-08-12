import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, logout } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { useTheme } from '../../theme.jsx';
import { TopBar } from '../../components/ui.jsx';
import Logo from '../../components/Logo.jsx';
import InstallAppBanner from '../../components/InstallApp.jsx';
import {
  IconProfile, IconRefer, IconSocial, IconLeaderboard, IconPlans,
  IconSupport, IconBell, IconHistory, IconMore,
} from '../../components/AppIcons.jsx';

const LINK_ICONS = {
  '/app/profile': IconProfile,
  '/app/refer': IconRefer,
  '/app/social': IconSocial,
  '/app/leaderboard': IconLeaderboard,
  '/app/plans': IconPlans,
  '/app/support': IconSupport,
  '/app/notifications': IconBell,
  '/app/history': IconHistory,
};

export default function More() {
  const { t, lang, setLang } = useI18n();
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => { api('/api/user/me').then(d => setUser(d.user)).catch(() => {}); }, []);

  const links = [
    ['/app/profile', t('profile')],
    ['/app/refer', t('refer')],
    ['/app/social', t('socialTasks')],
    ['/app/leaderboard', t('leaderboard')],
    ['/app/plans', t('plans')],
    ['/app/support', t('support')],
    ['/app/notifications', t('notifications')],
    ['/app/history', t('history')],
  ];

  return (
    <>
      <TopBar title={t('more')} inner={false} />
      <div className="page">
        {user && (
          <div className="card profile-mini">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div><div style={{ fontWeight: 600 }}>{user.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{user.phone}</div></div>
            <Link to="/app/profile" className="btn xs">Edit</Link>
          </div>
        )}
        <InstallAppBanner />

        <div className="card">
          <div className="setting-row">
            <span>{t('darkMode')}</span>
            <button className={`toggle ${dark ? 'on' : ''}`} onClick={toggle} />
          </div>
          <div className="setting-row">
            <span>{t('language')}</span>
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              <option value="en">English</option><option value="bn">বাংলা</option><option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
        {links.map(([to, label]) => {
          const Ic = LINK_ICONS[to] || IconMore;
          return (
            <Link key={to} to={to} className="menu-row svg-row">
              <span className="menu-row-ic"><Ic size={20} /></span> {label} <span>→</span>
            </Link>
          );
        })}
        {user?.role === 'admin' && <Link to="/admin" className="menu-row svg-row">Admin Panel <span>→</span></Link>}
        <button className="btn full red" style={{ marginTop: 12 }} onClick={logout}>{t('logout')}</button>
        <div style={{ textAlign: 'center', marginTop: 20 }}><Logo size={32} showTag /></div>
      </div>
    </>
  );
}
