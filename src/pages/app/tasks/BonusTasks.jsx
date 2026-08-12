import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../../api.js';
import { useI18n } from '../../../i18n.jsx';
import { TopBar } from '../../../components/ui.jsx';
import { BONUS_TASKS } from '../../../taskCategories.js';

export default function BonusTasks() {
  const { t } = useI18n();
  const [taskData, setTaskData] = useState(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    api('/api/user/tasks').then(setTaskData).catch(() => {});
    api('/api/games/config').then(d => setStreak(d.user?.streakDays || 0)).catch(() => {});
  }, []);

  const claimed = taskData?.claimedToday || 0;
  const total = taskData?.tasks?.length || 6;

  return (
    <>
      <TopBar title={`🎁 ${t('catBonus')}`} />
      <div className="page">
        <div className="cat-detail-head" style={{ background: '#AD1457' }}>
          <span>🎁</span>
          <div>
            <h2>{t('catBonus')}</h2>
            <p>{t('catBonusSub')}</p>
          </div>
        </div>

        {BONUS_TASKS.map(b => {
          let progress = null;
          let done = false;
          if (b.id === 'login') { done = streak > 0; progress = done ? '✓' : '0/1'; }
          if (b.id === 'allTasks') { progress = `${claimed}/${total}`; done = claimed >= total; }
          if (b.id === 'weekly') { progress = `${Math.min(streak, 7)}/7`; done = streak >= 7; }

          return (
            <Link key={b.id} to={b.action} className="cat-detail-row">
              <span className="ic">🎁</span>
              <div className="grow">
                <div className="t">{t(b.titleKey)}</div>
                <div className="d">🪙 +{b.reward}</div>
              </div>
              {progress && <span className="cat-prog">{progress}</span>}
              <span className="btn xs">{done ? '✓' : t('claim')}</span>
            </Link>
          );
        })}

        <div className="cat-foot-bar" style={{ background: '#FCE4EC', color: '#AD1457' }}>
          {t('catBonusFooter')}
        </div>
        <Link to="/app/tasks" className="btn ghost full" style={{ marginTop: 14 }}>← {t('taskCenter')}</Link>
      </div>
    </>
  );
}
