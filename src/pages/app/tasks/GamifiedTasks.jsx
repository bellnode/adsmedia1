import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../../../api.js';
import { useI18n } from '../../../i18n.jsx';
import { TopBar } from '../../../components/ui.jsx';
import { IconCoin } from '../../../components/AppIcons.jsx';

export default function GamifiedTasks() {
  const { t } = useI18n();
  const [cfg, setCfg] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    api('/api/games/config').then(d => { setCfg(d.config || {}); setUser(d.user); }).catch(() => {});
  }, []);

  const daily = cfg.dailyCoinReward ?? 10;
  const rewards = Array(7).fill(daily);
  const streak = user?.streakDays || 0;

  return (
    <>
      <TopBar title={t('catGamified')} backTo="/app/tasks" />
      <div className="page gamified-page">
        <div className="cat-detail-head compact navy-head">
          <span className="challenge-head-badge">3</span>
          <div className="grow">
            <h2>{t('catGamified')}</h2>
            <p>{t('catGamifiedSub')}</p>
          </div>
        </div>

        <div className="gamified-spin-card pro">
          <div className="gs-label">{t('spinWheel')}</div>
          <div className="gs-sub">{t('freeSpinDaily')} · {t('extraSpin')}: {cfg.spinCost || 20} {t('coins')}</div>
          <Link to="/app/games/spin" className="btn full gs-btn">{t('spinNow')}</Link>
        </div>

        <div className="streak-card-pro">
          <div className="gs-label">{t('streakSystem')}</div>
          <div className="streak-days-pro">
            {rewards.slice(0, 7).map((r, i) => (
              <div key={i} className={`streak-day-pro ${i < streak ? 'done' : ''}`}>
                <div className="dn">{t('day')} {i + 1}</div>
                <div className="dr">+{r}</div>
                <IconCoin size={14} />
              </div>
            ))}
          </div>
          <p className="streak-warn">{t('streakReset')}</p>
          <Link to="/app/games/streak" className="btn full streak-claim-btn">{t('claimStreak')}</Link>
        </div>

        <div className="cat-foot-bar navy-foot">{t('catGamifiedFooter')}</div>
      </div>
    </>
  );
}
