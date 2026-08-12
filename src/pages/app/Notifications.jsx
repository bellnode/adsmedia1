import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, fmtDate } from '../../components/ui.jsx';

const KIND_ICON = { info: '🔔', task: '⚡', payment: '💳', withdraw: '💸', referral: '🎁' };

export default function Notifications() {
  const { t } = useI18n();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    api('/api/user/notifications').then(d => {
      setRows(d.notifications);
      api('/api/user/notifications/read-all', { method: 'POST' }).catch(() => {});
    }).catch(() => setRows([]));
  }, []);

  return (
    <>
      <TopBar title={`🔔 ${t('notifications')}`} />
      <div className="page">
        {rows === null ? <span className="spinner" />
          : rows.length === 0 ? <div className="empty">{t('noData')}</div>
          : rows.map(n => (
            <div className="list-row" key={n._id}>
              <span style={{ fontSize: 20 }}>{KIND_ICON[n.kind] || '🔔'}</span>
              <div className="grow">
                <div className="t1">{n.title}</div>
                {n.body && <div className="t2">{n.body}</div>}
                <div className="t2" style={{ marginTop: 3 }}>{fmtDate(n.createdAt)}</div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
