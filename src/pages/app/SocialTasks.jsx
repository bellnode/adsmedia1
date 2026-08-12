import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, useToast } from '../../components/ui.jsx';
import SocialPlatformIcon from '../../components/SocialPlatformIcon.jsx';

const TITLE_KEYS = {
  youtube: 'socialYoutube',
  tiktok: 'socialTiktok',
  facebook: 'socialFacebook',
  telegram: 'socialTelegram',
  share: 'socialShare',
};

const SOCIAL_ORDER = ['youtube', 'tiktok', 'facebook', 'telegram', 'share'];
const SOCIAL_TIMER_SEC = 15;

function orderSocialTasks(tasks) {
  const map = Object.fromEntries((tasks || []).map(x => [x.platform, x]));
  return SOCIAL_ORDER.map(p => map[p]).filter(Boolean);
}

function isPageActive() {
  if (typeof document === 'undefined') return false;
  if (document.hidden || document.visibilityState !== 'visible') return false;
  try {
    if (typeof document.hasFocus === 'function' && !document.hasFocus()) return false;
  } catch { /* ignore */ }
  return true;
}

/** Timer runs while outside on social link; pauses when back in app */
export default function SocialTasks() {
  const { t } = useI18n();
  const toast = useToast();
  const [tasks, setTasks] = useState(null);
  const [active, setActive] = useState(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const awayRef = useRef(false);
  const activeRef = useRef(null);
  const claimingRef = useRef(false);
  const awayStartedAtRef = useRef(null);
  const bankedRef = useRef(0);
  activeRef.current = active;

  const load = () => api('/api/user/social-tasks')
    .then(d => setTasks(orderSocialTasks(d.tasks)))
    .catch(() => setTasks([]));
  useEffect(() => {
    load();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  const stopTicks = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const bankAway = () => {
    if (!awayStartedAtRef.current) return;
    const add = Math.max(0, (Date.now() - awayStartedAtRef.current) / 1000);
    bankedRef.current += add;
    awayStartedAtRef.current = null;
  };

  const startTicks = () => {
    stopTicks();
    timerRef.current = setInterval(() => {
      if (!awayRef.current) return;
      setActive(a => {
        if (!a || a.paused) return a;
        if (a.left <= 1) {
          clearInterval(timerRef.current);
          return { ...a, left: 0 };
        }
        return { ...a, left: a.left - 1 };
      });
    }, 1000);
  };

  const onLeave = () => {
    if (!activeRef.current) return;
    if (awayRef.current) return;
    awayRef.current = true;
    awayStartedAtRef.current = Date.now();
    setActive(a => (a ? { ...a, paused: false } : a));
    startTicks();
  };

  const onBack = () => {
    if (!activeRef.current) return;
    bankAway();
    awayRef.current = false;
    stopTicks();
    const total = activeRef.current.total;
    const left = Math.max(0, Math.ceil(total - bankedRef.current));
    setActive(a => (a ? { ...a, paused: true, left } : a));
  };

  const finishClaim = async (taskId) => {
    if (claimingRef.current) return;
    claimingRef.current = true;
    try {
      const d = await api(`/api/user/social-tasks/${taskId}/claim`, { method: 'POST' });
      try { const { playCash } = await import('../../utils/sound.js'); playCash(); } catch { /* ignore */ }
      toast(`+${d.reward} ${t('coins')}! 🎉`, 'ok');
      stopTicks();
      setActive(null);
      load();
    } catch (e) {
      toast(e.message, 'err');
      setActive(null);
    }
    claimingRef.current = false;
  };

  useEffect(() => {
    if (active && active.left === 0 && !active.paused) {
      finishClaim(active.taskId);
    }
  }, [active?.left, active?.paused]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden || document.visibilityState !== 'visible') onLeave();
      else onBack();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onLeave);
    window.addEventListener('focus', onBack);
    pollRef.current = setInterval(() => {
      if (!activeRef.current) return;
      if (isPageActive()) onBack();
      else onLeave();
    }, 400);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('focus', onBack);
      clearInterval(pollRef.current);
    };
  }, []);

  const start = async (task) => {
    const id = task.id || task._id;
    bankedRef.current = 0;
    awayStartedAtRef.current = null;
    awayRef.current = false;
    stopTicks();

    if (task.platform === 'share') {
      const shareData = { title: t('appName'), text: t('sharePostText'), url: window.location.origin };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch { /* cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          toast(t('linkCopied'), 'ok');
        } catch { toast(shareData.url, 'ok'); }
      }
      setActive({ taskId: id, total: 5, left: 5, paused: true, platform: task.platform });
      setTimeout(() => onLeave(), 100);
      return;
    }

    if (task.link) window.open(task.link, '_blank', 'noopener,noreferrer');
    setActive({
      taskId: id,
      total: SOCIAL_TIMER_SEC,
      left: SOCIAL_TIMER_SEC,
      paused: true,
      platform: task.platform,
    });
    setTimeout(() => onLeave(), 100);
    toast(t('goToAdTimer'), '');
  };

  const label = (task) => {
    const key = TITLE_KEYS[task.platform];
    return key ? t(key) : task.title;
  };

  return (
    <>
      <TopBar title={`📱 ${t('catSocial')}`} backTo="/app/tasks" />
      <div className="page social-tasks-page">
        <div className="cat-detail-head compact" style={{ background: '#C45C26', marginBottom: 14 }}>
          <span className="social-head-badge">4</span>
          <span>📱</span>
          <div className="grow">
            <h2>{t('catSocial')}</h2>
            <p>{t('catSocialSub')}</p>
          </div>
          <Link to="/app/tasks" className="btn xs light">{t('allCategories')}</Link>
        </div>

        <div className="social-task-card">
          {tasks === null ? <span className="spinner" /> : tasks.length === 0 ? (
            <div className="empty">{t('noData')}</div>
          ) : tasks.map(task => {
            const id = task._id || task.id || task.platform;
            const isActive = active?.taskId === id || active?.taskId === task._id || active?.taskId === task.id;
            return (
              <div key={id}>
                <div className="social-task-row">
                  <SocialPlatformIcon platform={task.platform} size={40} />
                  <div className="social-task-grow">
                    <div className="social-task-name">{label(task)}</div>
                    <div className="social-task-coin">🪙 +{task.reward}</div>
                  </div>
                  {task.done ? (
                    <span className="social-task-prog done">✓</span>
                  ) : !isActive ? (
                    <>
                      <span className="social-task-prog">0/1</span>
                      <button type="button" className="btn xs social-go" onClick={() => start(task)}>
                        {task.platform === 'share' ? t('share') : t('startTask')}
                      </button>
                    </>
                  ) : (
                    <span className="social-task-prog">{active.paused ? '⏸' : `${active.left}s`}</span>
                  )}
                </div>
                {isActive && (
                  <div style={{ padding: '8px 12px 14px', textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                      {active.paused ? t('timerPausedGoAd') : `⏳ ${active.left}s — ${t('goToAdTimer')}`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="cat-foot-bar" style={{ background: '#FFF3E0', color: '#C45C26', marginTop: 14 }}>
          {t('catSocialFooter')}
        </div>
      </div>
    </>
  );
}
