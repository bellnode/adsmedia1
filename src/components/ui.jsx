import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n.jsx';
import { api } from '../api.js';
import {
  IconHome, IconTasks, IconPlans, IconGames, IconWallet, IconProfile,
  IconRefer, IconSocial, IconLeaderboard, IconSupport, IconHistory, IconWithdraw, IconMore,
  IconBell, IconGift, IconCoin,
} from './AppIcons.jsx';

// ---------------- Toast ----------------
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = '') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div id="toast-root">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  return useContext(ToastContext) || (() => {});
}

// ---------------- mobile menu drawer ----------------
const MobileMenuContext = createContext(null);

const DRAWER_NAV = [
  ['/app', IconHome, 'home'],
  ['/app/tasks', IconTasks, 'tasks'],
  ['/app/plans', IconPlans, 'plans'],
  ['/app/games', IconGames, 'games'],
  ['/app/wallet', IconWallet, 'wallet'],
  ['/app/withdraw', IconWithdraw, 'withdraw'],
  ['/app/history', IconHistory, 'history'],
  ['/app/refer', IconRefer, 'refer'],
  ['/app/social', IconSocial, 'socialTasks'],
  ['/app/leaderboard', IconLeaderboard, 'leaderboard'],
  ['/app/support', IconSupport, 'support'],
  ['/app/profile', IconProfile, 'profile'],
];

export function MobileMenuProvider({ children }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const loc = useLocation();
  const active = (to) => loc.pathname === to || (to !== '/app' && loc.pathname.startsWith(to));

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  return (
    <MobileMenuContext.Provider value={{ openMenu: () => setOpen(true), closeMenu: () => setOpen(false) }}>
      {children}
      {open && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} aria-hidden />
          <aside className="mobile-menu-drawer" aria-label="Menu">
            <div className="mobile-menu-head">
              <strong>{t('appName')}</strong>
              <button type="button" className="mobile-menu-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav className="mobile-menu-nav">
              {DRAWER_NAV.map(([to, Ic, key]) => (
                <Link key={to} to={to} className={active(to) ? 'active' : ''} onClick={() => setOpen(false)}>
                  <span className="nav-ic"><Ic size={20} /></span>{t(key)}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  return useContext(MobileMenuContext) || { openMenu: () => {}, closeMenu: () => {} };
}

// ---------------- helpers ----------------
export function fmt(n) { return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
export function fmtDate(s) {
  if (!s) return '';
  return new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const TASK_ICONS = {
  watch_ad: ['play', 'var(--navy-light)'],
  survey: ['survey', 'var(--blue-light)'],
  data_entry: ['tasks', 'var(--orange-light)'],
  share_link: ['link', '#E2E8F0'],
  visit_website: ['globe', 'var(--blue-light)'],
  promo: ['promo', 'var(--orange-light)'],
};

// ---------------- app chrome ----------------
export function TopBar({ title, inner = true, backTo }) {
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/api/user/notifications').then(d => setUnread(d.unread)).catch(() => {});
  }, []);
  const goBack = () => { if (backTo) nav(backTo); else nav(-1); };
  return (
    <div className={`app-top ${inner ? 'inner' : ''}`}>
      {inner && <button type="button" className="back" onClick={goBack}>‹</button>}
      <h1>{title}</h1>
      <button className="bell" onClick={() => nav('/app/notifications')}>
        <IconBell />{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
      </button>
    </div>
  );
}

export function BottomNav() {
  const { t } = useI18n();
  const loc = useLocation();
  const items = [
    ['/app', IconHome, t('home')],
    ['/app/tasks', IconTasks, t('tasks')],
    ['/app/plans', IconPlans, t('plans')],
    ['/app/wallet', IconWallet, t('wallet')],
    ['/app/profile', IconProfile, t('profile')],
  ];
  return (
    <nav className="bottom-nav app-bottom-nav">
      {items.map(([to, Ic, label]) => (
        <Link key={to} to={to}
          className={loc.pathname === to || (to !== '/app' && loc.pathname.startsWith(to)) ? 'active' : ''}>
          <span className="nic"><Ic size={20} /></span>{label}
        </Link>
      ))}
    </nav>
  );
}

// ---------------- banner slider ----------------
export function BannerSlider({ banners, className = '', variant = 'default' }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setI(x => (x + 1) % banners.length), 3500);
    return () => clearInterval(id);
  }, [banners.length]);
  if (!banners.length) return null;
  const app = variant === 'app';
  return (
    <div className={`banner-slider ${app ? 'banner-slider-app' : ''} ${className}`.trim()}>
      <div className="banner-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map(b => {
          const imageOnly = !!(b.imageUrl && !b.subtitle && !b.ctaText);
          const inner = (
            <div
              className={`banner-slide ${app ? 'banner-slide-app' : ''} ${imageOnly ? 'banner-slide-image' : ''}`}
              style={{ background: b.imageUrl ? `url(${b.imageUrl}) center/cover` : `linear-gradient(120deg, ${b.bgColor || '#1a3d6b'}, ${(b.bgColor || '#2563a8')}dd)` }}>
              {!imageOnly && (
                <div className="banner-slide-inner">
                  <div className="banner-slide-text">
                    <div className="t">{b.title}</div>
                    {b.subtitle && <div className="s">{b.subtitle}</div>}
                    {b.ctaText && (
                      <Link to={b.ctaLink || '/app/plans'} className={`btn sm ${app ? 'banner-cta-green' : 'orange'}`}>
                        {b.ctaText}
                      </Link>
                    )}
                  </div>
                  {app && (
                    <div className="banner-slide-art" aria-hidden>
                      <span className="banner-art-icon"><IconGift size={36} /></span>
                      <span className="banner-art-icon"><IconCoin size={32} /></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          if (imageOnly && b.ctaLink) {
            return <Link key={b._id} to={b.ctaLink} className="banner-slide-link">{inner}</Link>;
          }
          return <div key={b._id} className="banner-slide-wrap">{inner}</div>;
        })}
      </div>
      <div className="banner-dots">
        {banners.map((_, x) => <span key={x} className={`d ${x === i ? 'on' : ''}`} />)}
      </div>
    </div>
  );
}
