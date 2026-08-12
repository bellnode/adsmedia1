import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, fmt, fmtDate, useToast } from '../../components/ui.jsx';

export default function Refer() {
  const { t } = useI18n();
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => { api('/api/user/team').then(setData).catch(() => {}); }, []);

  if (!data) return (<><TopBar title={t('refer')} /><span className="spinner" /></>);

  const link = `${location.origin}/register?ref=${data.referCode}`;
  const shareText = `Join AdMedia and earn money daily by completing simple tasks! Use my refer code: ${data.referCode} — ${link}`;

  const copy = () => navigator.clipboard.writeText(link).then(() => toast('Link copied! ✓', 'ok'));
  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');

  return (
    <>
      <TopBar title={`🤝 ${t('refer')}`} />
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '26px 18px' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'grid', placeItems: 'center', fontSize: 40, margin: '0 auto 14px' }}>📨</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 4, background: 'var(--green-light)', border: '2px dashed var(--green)', borderRadius: 12, padding: 10, marginBottom: 12, cursor: 'pointer' }}
            onClick={() => navigator.clipboard.writeText(data.referCode).then(() => toast('Code copied ✓', 'ok'))}>
            {data.referCode}
          </div>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            <b style={{ color: 'var(--green-dark)' }}>{data.percent}%</b> {t('commission')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1, background: '#25D366' }} onClick={whatsapp}>💬 {t('shareWhatsApp')}</button>
            <button className="btn blue" style={{ flex: 1 }} onClick={copy}>📋 {t('copyLink')}</button>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{data.team.length}</div>
            <div className="muted" style={{ fontSize: 12 }}>{t('totalRefers')}</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green-dark)' }}>৳{fmt(data.referralEarnings)}</div>
            <div className="muted" style={{ fontSize: 12 }}>{t('referralEarnings')}</div>
          </div>
        </div>

        {data.team.length === 0 ? <div className="empty">{t('noData')}</div>
          : data.team.map((m, i) => (
            <div className="list-row" key={i}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue-light)', display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--blue-dark)' }}>{m.name[0]}</div>
              <div className="grow">
                <div className="t1">{m.name}</div>
                <div className="t2">{m.phone} · {fmtDate(m.joined)}</div>
              </div>
              <span className={`pill ${m.hasPlan ? 'approved' : 'pending'}`}>{m.hasPlan ? t('active') : 'No plan'}</span>
            </div>
          ))}
      </div>
    </>
  );
}
