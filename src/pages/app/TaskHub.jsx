import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { useToast } from '../../components/ui.jsx';
import CategoryCard from '../../components/CategoryCard.jsx';
import { CATEGORIES, CHALLENGING_GAMES, REFERRAL_MILESTONES, BONUS_TASKS } from '../../taskCategories.js';
import {
  IconTasks, IconSpin, IconFire, IconCoin, IconWarning, IconUser, IconStar, IconCalendar, IconCheck, IconGift, IconChart,
  TaskTypeIcon, TASK_TYPE_BG,
} from '../../components/AppIcons.jsx';

const SOCIAL_ORDER = ['youtube', 'tiktok', 'facebook', 'telegram', 'share'];

function GamifiedPreview({ user, gameCfg }) {
  const { t } = useI18n();
  const rewards = Array(7).fill(gameCfg.dailyCoinReward ?? 10);
  const streak = user?.streakDays || 0;

  return (
    <div className="cat-gamified-preview">
      <div className="cat-spin-block">
        <div className="cat-spin-label"><IconSpin size={16} /> {t('spinWheel')}</div>
        <div className="cat-spin-row">
          <div className="cat-mini-wheel" aria-hidden />
          <div className="cat-spin-meta">
            <div>{t('freeSpinDaily')}</div>
            <div className="muted">{t('extraSpin')}: {gameCfg.spinCost || 20} {t('coins')}</div>
            <Link to="/app/games/spin" className="btn xs cat-play">{t('spinNow')}</Link>
          </div>
        </div>
      </div>
      <div className="cat-streak-block">
        <div className="cat-spin-label"><IconFire size={16} /> {t('streakSystem')}</div>
        <div className="cat-streak-mini">
          {rewards.slice(0, 7).map((r, i) => (
            <div key={i} className={`cat-streak-day ${i < streak ? 'done' : ''}`}>
              <div className="dn">{t('day')} {i + 1}</div>
              <div className="dr">{i === 6 ? <IconGift size={14} /> : `+${r}`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function orderSocialTasks(tasks) {
  const map = Object.fromEntries((tasks || []).map(x => [x.platform, x]));
  return SOCIAL_ORDER.map(p => map[p]).filter(Boolean);
}

export default function TaskHub() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [taskData, setTaskData] = useState(null);
  const [social, setSocial] = useState([]);
  const [team, setTeam] = useState(null);
  const [user, setUser] = useState(null);
  const [gameCfg, setGameCfg] = useState({});

  useEffect(() => {
    api('/api/user/tasks').then(setTaskData).catch(e => toast(e.message, 'err'));
    api('/api/user/social-tasks').then(d => setSocial(orderSocialTasks(d.tasks))).catch(() => {});
    api('/api/user/team').then(setTeam).catch(() => {});
    api('/api/user/me').then(d => setUser(d.user)).catch(() => {});
    api('/api/games/config').then(d => setGameCfg(d.config || {})).catch(() => {});
  }, []);

  const getTaskTitle = (task) => {
    if (!task) return '';
    return lang === 'bn' && task.titleBn ? task.titleBn : lang === 'hi' && task.titleHi ? task.titleHi : (task.title || '');
  };

  const dailyItems = (taskData?.tasks || []).slice(0, 5).map(task => ({
    ic: task.type,
    icType: 'task',
    name: getTaskTitle(task),
    reward: Math.round(task.reward * 10) || task.reward,
    progress: `${task.doneToday || 0}/${task.dailyLimitPerUser || 1}`,
    done: (task.doneToday || 0) >= (task.dailyLimitPerUser || 1),
  }));

  const challengingItems = CHALLENGING_GAMES.map(g => ({
    game: g.game,
    name: g.name,
    sub: `${t('entryCoins', { n: g.entry })} · ${g.winType === 'instant' ? t('winInstantHighlight') : g.winType === 'jackpot' ? t('winJackpotHighlight') : t('winUpTo', { n: g.win })}`,
    link: g.to,
    btn: t('play'),
  }));

  const socialTitleKeys = {
    youtube: 'socialYoutube', tiktok: 'socialTiktok', facebook: 'socialFacebook',
    telegram: 'socialTelegram', share: 'socialShare',
  };
  const socialItems = orderSocialTasks(social).slice(0, 5).map(task => ({
    platform: task.platform,
    name: socialTitleKeys[task.platform] ? t(socialTitleKeys[task.platform]) : task.title,
    reward: task.reward,
    progress: task.done ? '✓' : '0/1',
    done: task.done,
  }));

  const referCount = team?.team?.length || 0;
  const referralItems = [
    ...REFERRAL_MILESTONES.map(m => ({
      ic: m.premium ? 'star' : 'user',
      name: m.premium ? t('premiumReferral') : t('inviteNFriends', { n: m.count }),
      reward: m.reward,
      progress: m.premium ? `${referCount >= 1 ? 1 : 0}/1` : `${Math.min(referCount, m.count)}/${m.count}`,
      done: m.premium ? referCount >= 1 : referCount >= m.count,
    })),
    { ic: 'chart', name: t('levelBonusTeam'), sub: t('uptoPercent', { n: 10 }), reward: null },
  ];

  const bonusItems = BONUS_TASKS.map(b => ({
    ic: b.id === 'login' ? 'check' : b.id === 'weekly' ? 'calendar' : 'gift',
    name: t(b.titleKey),
    reward: b.reward,
    link: b.action,
    btn: t('claim'),
    progress: b.id === 'allTasks' ? `${taskData?.claimedToday || 0}/${taskData?.dailyLimit || 6}` : b.id === 'weekly' ? `${user?.streakDays || 0}/7` : null,
  }));

  const planObj = user?.plan && typeof user.plan === 'object' ? user.plan : null;
  const planName = planObj?.name || null;
  const planDays = user?.planExpiresAt
    ? Math.max(0, Math.ceil((new Date(user.planExpiresAt) - Date.now()) / 86400000))
    : null;
  const dailyCoins = (taskData?.tasks || []).reduce((s, tk) => s + Math.round((tk.reward || 0) * 10), 0);
  const planUsd = planObj?.price ? `$${(planObj.price / 120).toFixed(2)}` : '$5.00';

  const planBar = taskData?.hasPlan ? (
    <div className="cat-plan-bar full">
      <div className="cat-plan-info">
        <div><b>{t('activePackage')}:</b> {planName || 'BASIC'}</div>
        <div>{t('validFor')}: {planDays ?? 30} {t('days')}</div>
        <div>{t('dailyEarning')}: <IconCoin size={12} /> {dailyCoins || 70} {t('coins')}</div>
      </div>
      <Link to="/app/plans" className="cat-plan-buy">{planUsd}</Link>
    </div>
  ) : (
    <div className="cat-plan-bar warn full">
      <IconWarning size={14} /> {t('noPlan')} — <Link to="/app/plans">{t('buyPlan')}</Link>
    </div>
  );

  const catMap = {
    daily: { items: dailyItems.length ? dailyItems : [{ name: t('loading'), reward: 0 }], planBar },
    challenging: { items: challengingItems },
    gamified: { items: [], extra: <GamifiedPreview user={user} gameCfg={gameCfg} /> },
    social: { items: socialItems.length ? socialItems : [{ name: t('loading'), reward: 0 }] },
    referral: { items: referralItems },
    bonus: { items: bonusItems },
  };

  return (
    <div className="task-hub-page-wrap">
      <div className="task-hub-navy-banner">
        <span className="thb-ic"><IconTasks size={22} /></span>
        <div className="grow">
          <h2>{t('taskCenter')}</h2>
          <p>{t('taskCenterSub')}</p>
        </div>
        <span className="thb-arrow">→</span>
      </div>
      <div className="page task-hub-page">
        <div className="task-cat-grid">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              items={catMap[cat.id]?.items || []}
              extra={catMap[cat.id]?.extra}
              planBar={cat.id === 'daily' ? catMap.daily.planBar : null}
              footer
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TaskRowIcon({ ic, icType }) {
  if (icType === 'task') return <TaskTypeIcon type={ic} size={16} />;
  const map = { star: IconStar, user: IconUser, chart: IconChart, check: IconCheck, calendar: IconCalendar, gift: IconGift };
  const Ic = map[ic] || IconTasks;
  return <Ic size={16} />;
}

export { TASK_TYPE_BG };
