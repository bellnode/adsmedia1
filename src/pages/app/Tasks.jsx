import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, fmt, useToast } from '../../components/ui.jsx';
import { TaskTypeIcon, TASK_TYPE_BG, IconCoin } from '../../components/AppIcons.jsx';

function isPageActive() {
  if (typeof document === 'undefined') return false;
  if (document.hidden || document.visibilityState !== 'visible') return false;
  try {
    if (typeof document.hasFocus === 'function' && !document.hasFocus()) return false;
  } catch { /* ignore */ }
  return true;
}

/**
 * Timer runs while user is OUTSIDE (on ad/link).
 * Comes back to our app → timer PAUSES.
 */
export default function Tasks() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [active, setActive] = useState(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const claimingRef = useRef(false);
  const activeRef = useRef(null);
  /** true = user is on ad (timer running), false = on our app (paused) */
  const awayRef = useRef(false);
  activeRef.current = active;

  const load = () => api('/api/user/tasks').then(setData).catch(e => toast(e.message, 'err'));
  useEffect(() => {
    load();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
    };
  }, []);

  const stopLocalTicks = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const notify = async (event) => {
    const a = activeRef.current;
    if (!a?.completionId) return null;
    try {
      const d = await api(`/api/user/tasks/heartbeat/${a.completionId}`, {
        method: 'POST',
        body: { event },
      });
      if (typeof d.remaining === 'number') {
        setActive(cur => (cur && cur.completionId === a.completionId
          ? { ...cur, left: d.remaining, total: d.required, paused: !!d.paused }
          : cur));
        if (d.remaining <= 0) {
          stopLocalTicks();
          if (!claimingRef.current) claim(a.completionId);
        }
      }
      return d;
    } catch {
      return null;
    }
  };

  const startLocalTicks = () => {
    stopLocalTicks();
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

  /** User left our app → timer RUNS */
  const onLeave = () => {
    if (!activeRef.current || activeRef.current.done) return;
    if (awayRef.current) return;
    awayRef.current = true;
    setActive(a => (a ? { ...a, paused: false } : a));
    startLocalTicks();
    notify('leave');
  };

  /** User came back to our app → timer PAUSES */
  const onBack = () => {
    if (!activeRef.current || activeRef.current.done) return;
    if (!awayRef.current && activeRef.current.paused) return;
    awayRef.current = false;
    stopLocalTicks();
    setActive(a => (a ? { ...a, paused: true } : a));
    notify('back');
  };

  const claim = async (completionId) => {
    const id = completionId || activeRef.current?.completionId;
    if (!id || claimingRef.current) return;
    claimingRef.current = true;
    try {
      // Bank any open away time first
      await api(`/api/user/tasks/heartbeat/${id}`, { method: 'POST', body: { event: 'back' } }).catch(() => {});
      const d = await api(`/api/user/tasks/claim/${id}`, { method: 'POST' });
      try { const { playCash } = await import('../../utils/sound.js'); playCash(); } catch { /* ignore */ }
      toast(`+৳${fmt(d.reward)} added to your wallet! 🎉`, 'ok');
      stopLocalTicks();
      awayRef.current = false;
      setActive(null);
      load();
    } catch (e) { toast(e.message, 'err'); }
    claimingRef.current = false;
  };

  useEffect(() => {
    if (active && active.left === 0 && active.completionId && !active.done) {
      setActive(a => (a ? { ...a, done: true } : a));
      claim(active.completionId);
    }
  }, [active?.left, active?.completionId]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden || document.visibilityState !== 'visible') onLeave();
      else onBack();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onLeave);
    window.addEventListener('focus', onBack);
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('pageshow', onBack);

    // Poll: outside → run, on app → pause
    pollRef.current = setInterval(() => {
      if (!activeRef.current || activeRef.current.done) return;
      if (isPageActive()) onBack();
      else onLeave();
    }, 400);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('focus', onBack);
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('pageshow', onBack);
      clearInterval(pollRef.current);
    };
  }, []);

  const start = async (task) => {
    try {
      const d = await api(`/api/user/tasks/${task.id}/start`, { method: 'POST' });
      const total = d.timerSeconds;
      const url = d.url || task.link || '';

      stopLocalTicks();
      awayRef.current = false;

      setActive({
        taskId: task.id,
        completionId: d.completionId,
        total,
        left: total,
        done: false,
        paused: true, // on our app = paused until they go to the ad
      });

      if (url) {
        window.open(url, '_blank', 'noopener');
        // Opening ad = leave → start timer
        setTimeout(() => onLeave(), 100);
        toast(t('goToAdTimer'), '');
      } else {
        toast(t('stayOnPage'), '');
      }
    } catch (e) { toast(e.message, 'err'); }
  };

  if (!data) return (<><TopBar title={t('dailyTasks')} /><span className="spinner" /></>);

  const getTaskTitle = (task) =>
    lang === 'bn' && task.titleBn ? task.titleBn : lang === 'hi' && task.titleHi ? task.titleHi : task.title;

  return (
    <>
      <TopBar title={`🎁 ${t('catDaily')}`} />

      <div className="cat-detail-head compact" style={{ background: '#2E7D32', margin: '0 0 14px' }}>
        <span>🎁</span>
        <div>
          <h2>{t('catDaily')}</h2>
          <p>{t('catDailySub')}</p>
        </div>
        <Link to="/app/tasks" className="btn xs light">{t('allCategories')}</Link>
      </div>

      {!data.hasPlan && (
        <div className="notice-bar" style={{ margin: 14 }}>
          ⚠️ {t('noPlan')} — <Link to="/app/plans" style={{ fontWeight: 800, color: 'var(--orange-dark)', textDecoration: 'underline' }}>{t('buyPlan')} →</Link>
        </div>
      )}

      {data.hasPlan && (
        <div className="card" style={{ margin: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t('remainingToday')}</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{data.remainingToday} / {data.dailyLimit}</div>
          </div>
          <div style={{ fontSize: 34 }}>🎯</div>
        </div>
      )}

      {data.tasks.map(task => {
        const bg = TASK_TYPE_BG[task.type] || 'var(--green-light)';
        const isActive = active?.taskId === task.id;
        const done = task.doneToday >= task.dailyLimitPerUser;
        return (
          <div key={task.id} style={{ margin: '0 14px 10px' }}>
            <div className="task-card" style={{ margin: 0, borderRadius: isActive ? '14px 14px 0 0' : 14 }}>
              <span className="tic svg-tic" style={{ background: bg }}><TaskTypeIcon type={task.type} size={20} /></span>
              <div className="grow">
                <div className="t">{getTaskTitle(task)}</div>
                <div className="d">{task.description}</div>
                <div className="d" style={{ marginTop: 3 }}>⏱ {task.timerSeconds}s · {task.doneToday}/{task.dailyLimitPerUser} {t('taskDone').toLowerCase()}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="rw coin-row-sm"><IconCoin size={14} /> +{Math.round(task.reward * 10)}</div>
                <div className="d" style={{ fontSize: 10 }}>+৳{fmt(task.reward)}</div>
                {done
                  ? <span className="pill approved" style={{ marginTop: 6 }}>✔ {t('taskDone')}</span>
                  : !isActive && <button className="btn xs" style={{ marginTop: 6 }} onClick={() => start(task)}>{task.buttonText || t('startTask')}</button>}
              </div>
            </div>
            {isActive && (
              <div style={{ background: '#fff', borderRadius: '0 0 14px 14px', boxShadow: 'var(--shadow)', padding: '4px 14px 16px', textAlign: 'center' }}>
                <div className="timer-ring" style={{ '--p': ((active.total - active.left) / active.total) * 100 }}>
                  <div className="in">{active.left}s</div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>
                  {active.paused ? t('timerPausedGoAd') : t('goToAdTimer')}
                </div>
                <button className="btn full" disabled={active.left > 0} onClick={() => claim()}>
                  {active.left > 0
                    ? (active.paused
                      ? `⏸ ${t('timerPausedGoAd')}`
                      : `⏳ ${active.left}s on ad...`)
                    : `🎁 Completing… +৳${fmt(task.reward)}`}
                </button>
              </div>
            )}
          </div>
        );
      })}
      {data.hasPlan && (
        <div className="cat-plan-bar full">
          <div><b>{t('activePackage')}</b></div>
          <div>{t('remainingToday')}: {data.remainingToday}/{data.dailyLimit}</div>
          <div>{t('catDailyFooter')}</div>
        </div>
      )}
      <div style={{ height: 10 }} />
    </>
  );
}
