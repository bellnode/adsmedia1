import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { TopBar, fmt, fmtDate, useToast } from '../../components/ui.jsx';

export default function History() {
  const { t } = useI18n();
  const toast = useToast();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'all');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    const load = async () => {
      try {
        if (tab === 'all') {
          const d = await api('/api/user/transactions');
          setRows(d.transactions.map(x => ({
            t1: x.note || x.type, t2: fmtDate(x.createdAt),
            amount: x.amount, status: x.amount > 0 ? 'approved' : undefined,
          })));
        } else if (tab === 'deposits') {
          const d = await api('/api/user/deposits');
          setRows(d.deposits.map(x => ({
            t1: `${x.method} · TrxID ${x.trxId}`, t2: fmtDate(x.createdAt),
            amount: x.amount, status: x.status,
          })));
        } else if (tab === 'withdrawals') {
          const d = await api('/api/user/withdrawals');
          setRows(d.withdrawals.map(x => ({
            t1: `${x.method} · ${x.number}`, t2: fmtDate(x.createdAt),
            amount: -x.amount, status: x.status,
          })));
        } else if (tab === 'tasks') {
          const d = await api('/api/user/task-history');
          setRows(d.history.map(x => ({
            t1: x.task?.title || 'Task', t2: fmtDate(x.claimedAt),
            amount: x.reward, status: 'claimed',
          })));
        } else if (tab === 'earnings') {
          const d = await api('/api/user/earnings');
          setRows(d.earnings.map(x => ({
            t1: x.note || x.type, t2: fmtDate(x.createdAt),
            amount: x.amount, status: 'approved',
          })));
        } else if (tab === 'referrals') {
          const d = await api('/api/user/referrals');
          setRows(d.referrals.map(x => ({
            t1: x.note || 'Referral bonus', t2: fmtDate(x.createdAt),
            amount: x.amount, status: 'approved',
          })));
        }
      } catch (e) { toast(e.message, 'err'); setRows([]); }
    };
    load();
  }, [tab]);

  const tabs = [
    ['all', t('all')], ['deposits', t('deposits')], ['withdrawals', t('withdraws')],
    ['earnings', t('earnings')], ['referrals', t('referrals')], ['tasks', t('taskHistory')],
  ];

  return (
    <>
      <TopBar title={`🕓 ${t('history')}`} />
      <div className="page">
        <div className="tabs">
          {tabs.map(([id, label]) => (
            <button key={id} className={tab === id ? 'sel' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        {rows === null ? <span className="spinner" />
          : rows.length === 0 ? <div className="empty">{t('noData')}</div>
          : rows.map((r, i) => (
            <div className="list-row" key={i}>
              <div className="grow">
                <div className="t1">{r.t1}</div>
                <div className="t2">{r.t2}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={r.amount >= 0 ? 'amount-pos' : 'amount-neg'}>
                  {r.amount >= 0 ? '+' : ''}৳{fmt(r.amount)}
                </div>
                {r.status && <span className={`pill ${r.status}`}>{t(r.status) !== r.status ? t(r.status) : r.status}</span>}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
