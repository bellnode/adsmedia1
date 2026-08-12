import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api.js';
import { useI18n } from '../../../i18n.jsx';
import { TopBar, useToast } from '../../../components/ui.jsx';
import { REFERRAL_MILESTONES } from '../../../taskCategories.js';

export default function ReferralTasks() {
  const { t } = useI18n();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => { api('/api/user/team').then(setData).catch(() => {}); }, []);

  if (!data) return (<><TopBar title={t('catReferral')} /><span className="spinner" /></>);

  const count = data.team?.length || 0;
  const link = `${location.origin}/register?ref=${data.referCode}`;

  return (
    <>
      <TopBar title={`👥 ${t('catReferral')}`} />
      <div className="page">
        <div className="cat-detail-head" style={{ background: '#1B5E5E' }}>
          <span>👥</span>
          <div>
            <h2>{t('catReferral')}</h2>
            <p>{t('catReferralSub')}</p>
          </div>
        </div>

        {REFERRAL_MILESTONES.map(m => (
          <div key={m.count} className="cat-detail-row">
            <span className="ic">👤</span>
            <div className="grow">
              <div className="t">{t('inviteNFriends', { n: m.count })}</div>
              <div className="d">🪙 +{m.reward} {t('coins')}</div>
            </div>
            <span className="cat-prog">{Math.min(count, m.count)}/{m.count}</span>
            {count >= m.count ? <span className="cat-check">✓</span> : null}
          </div>
        ))}

        <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: 12 }}>{t('referCode')}: <b>{data.referCode}</b></div>
          <button className="btn full" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(link).then(() => toast('Link copied ✓', 'ok'))}>
            📋 {t('copyLink')}
          </button>
        </div>

        <div className="cat-foot-bar" style={{ background: '#E0F2F1', color: '#1B5E5E' }}>
          {t('catReferralFooter')}
        </div>
        <Link to="/app/tasks" className="btn ghost full" style={{ marginTop: 14 }}>← {t('taskCenter')}</Link>
      </div>
    </>
  );
}
