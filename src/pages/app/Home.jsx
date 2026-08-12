import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { useFeatures } from '../../features.jsx';
import { BannerSlider, fmt, useToast, useMobileMenu } from '../../components/ui.jsx';
import {
  WalletCoinArt, GfxStatChart, GfxStatPending, GfxStatWithdraw,
  GfxCoinSmall, HOME_MENU_GFX,
} from '../../components/HomeGraphics.jsx';
import { IconTasks, IconBell, IconMenu, TaskTypeIcon, TASK_TYPE_BG } from '../../components/AppIcons.jsx';
import Logo from '../../components/Logo.jsx';
import { VideoTutorialsSection, VideoHelpFab } from '../../components/VideoTutorials.jsx';
import InstallAppBanner from '../../components/InstallApp.jsx';

const STAT_GFX = [
  { key: 'totalEarned', Gfx: GfxStatChart, field: 'totalEarned' },
  { key: 'pending', Gfx: GfxStatPending, field: 'pending' },
  { key: 'withdrawal', Gfx: GfxStatWithdraw, field: 'totalWithdrawn' },
];
export default function Home() {
  const { t } = useI18n();
  const { features } = useFeatures();
  const { openMenu } = useMobileMenu();
  const nav = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [banners, setBanners] = useState([]);
  const [taskData, setTaskData] = useState(null);
  const [unread, setUnread] = useState(0);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  useEffect(() => {
    api('/api/user/me').then(d => {
      setUser(d.user);
      setWalletStats(d.user.walletStats || null);
      setDailyClaimed(!!d.user.dailyCoinClaimed);
      if (d.user.role === 'admin') nav('/admin');
      else if (d.user.role === 'agent') nav('/agent');
      if (!d.user.onboardingDone && !localStorage.getItem('onboarding_seen')) nav('/onboarding');
    }).catch(e => toast(e.message, 'err'));
    api('/api/public/banners').then(d => setBanners(d.banners)).catch(() => {});
    api('/api/user/notifications').then(d => setUnread(d.unread || 0)).catch(() => {});
    if (features.tasks !== false) api('/api/user/tasks').then(setTaskData).catch(() => {});
  }, [features.tasks]);

  const claimDaily = async () => {
    try {
      const d = await api('/api/user/daily-coin', { method: 'POST' });
      toast(`+${d.amount} ${t('coins')}!`, 'ok');
      setUser(u => ({ ...u, coins: d.coins }));
      setDailyClaimed(true);
    } catch (e) { toast(e.message, 'err'); setDailyClaimed(true); }
  };

  if (!user) return <span className="spinner" />;

  const usdBalance = (user.mainBalance / 120).toFixed(2);
  const bdtBalance = fmt(user.mainBalance);
  const toUsd = (n) => (Number(n || 0) / 120).toFixed(2);

  const menuItems = [
    { to: '/app/tasks', label: t('dailyTasks'), sub: t('earnNow'), key: 'tasks' },
    { to: '/app/plans', label: t('buyPlan'), sub: t('buyPlan'), key: 'plans' },
    { to: '/app/withdraw', label: t('withdraw'), sub: t('getPayment'), key: 'withdrawals' },
    { to: '/app/history', label: t('history'), sub: t('allActivity'), key: 'history' },
    { to: '/app/support', label: t('support'), sub: t('getHelp'), key: 'tickets' },
  ].filter(item => item.key === 'history' || item.key === 'tasks' || features[item.key] !== false);

  return (
    <div className="home-app-page">
      <div className="home-mobile-header">
        <div className="home-app-topbar">
          <button type="button" className="home-hamburger" onClick={openMenu} aria-label="Menu"><IconMenu /></button>
          <div className="home-brand-center">
            <Logo size={44} light showTag />
          </div>
          <button type="button" className="bell" onClick={() => nav('/app/notifications')} aria-label="Notifications">
            <IconBell />{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
          </button>
        </div>
        <BannerSlider banners={banners} className="home-banner" variant="app" />
      </div>

      <div className="home-body">
        <div className="home-balance-card">
          <Link to="/app/wallet" className="home-usd-badge">USD</Link>
          <div className="home-balance-main">
            <div>
              <div className="lbl">{t('myBalance')}</div>
              <div className="usd">$ {usdBalance}</div>
              <div className="bdt">≈ {bdtBalance} BDT</div>
            </div>
            <div className="home-wallet-art-wrap">
              <WalletCoinArt size={92} />
            </div>
          </div>
          <div className="home-coins-row">
            <span className="home-coin-count"><GfxCoinSmall size={20} /> {user.coins?.toLocaleString() || 0} {t('coins')}</span>
            {!dailyClaimed && (
              <button type="button" className="home-daily-coin" onClick={claimDaily}>Daily +10</button>
            )}
          </div>
        </div>

        <div className="home-stats-row">
          {STAT_GFX.map(({ key, Gfx, field }) => (
            <div className="home-stat" key={key}>
              <span className="home-stat-gfx"><Gfx size={40} /></span>
              <div className="v">${toUsd(walletStats?.[field])}</div>
              <div className="l">{t(key)}</div>
            </div>
          ))}
        </div>

        <InstallAppBanner />

        <div className="home-menu-grid">
          {menuItems.map(item => {
            const Gfx = HOME_MENU_GFX[item.key] || HOME_MENU_GFX.tasks;
            return (
              <Link key={item.to} to={item.to} className="home-menu-item pro">
                <span className="home-menu-gfx"><Gfx size={52} /></span>
                <div className="mt">{item.label}</div>
                <div className="ms">{item.sub}</div>
              </Link>
            );
          })}
        </div>
        <Link to="/app/tasks" className="home-task-categories">
          <span className="tc-ic"><IconTasks size={20} /></span>
          <div className="grow">
            <div className="t">{t('taskCenter')}</div>
            <div className="d">{t('taskCenterSub')}</div>
          </div>
          <span className="arrow">→</span>
        </Link>

        <Link to="/app/panel" className="home-user-panel-link">
          View User Panel Preview →
        </Link>

        <VideoTutorialsSection />

        {taskData && taskData.tasks?.length > 0 && (
          <>
            <div className="section-row home-section-row">
              <span className="t">{t('todaysTasks')}</span>
              <Link to="/app/tasks/daily">{t('seeAll')} →</Link>
            </div>
            {taskData.tasks.slice(0, 3).map(task => (
                <Link to="/app/tasks/daily" key={task.id} className="home-task-row">
                  <span className="tic navy-icon" style={{ background: TASK_TYPE_BG[task.type] || 'var(--blue-light)' }}>
                    <TaskTypeIcon type={task.type} size={20} />
                  </span>
                  <div className="grow">
                    <div className="t">{task.title}</div>
                    <div className="d">{task.description || t('earnNow')}</div>
                  </div>
                  <div className="home-task-reward">
                    <div className="rw">${toUsd(task.reward)}</div>
                    <span className="home-start-btn">{t('startTask')}</span>
                  </div>
                </Link>
            ))}
          </>
        )}
      </div>
      <VideoHelpFab />
    </div>
  );
}
