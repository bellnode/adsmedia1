import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { useFeatures } from '../../features.jsx';
import { TopBar, fmt, useToast } from '../../components/ui.jsx';
import PaymentPayModal from '../../components/PaymentPayModal.jsx';

export default function Plans() {
  const { t } = useI18n();
  const { features } = useFeatures();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [payPlan, setPayPlan] = useState(null);

  const load = () => {
    api('/api/public/plans').then(d => setPlans(d.plans)).catch(() => {});
    api('/api/user/me').then(d => setUser(d.user)).catch(() => {});
  };
  useEffect(load, []);

  if (!user) return (<><TopBar title={t('plans')} /><span className="spinner" /></>);

  return (
    <>
      <TopBar title={t('choosePlan')} />
      <div className="page plans-page">
        {features.plans === false ? (
          <div className="empty">Plan purchases are temporarily disabled.</div>
        ) : (
          <>
            <div className="plans-pay-info card">
              <div className="t">Choose your payment method</div>
              <div className="d">Select a plan → pick Binance / USDT / bKash / custom → enter TxID</div>
            </div>

            {plans.map(p => {
              const isActive = user.plan && (user.plan._id || user.plan) === p._id;
              const usd = (p.price / 120).toFixed(2);
              return (
                <div key={p._id} className={`plan-card-pro ${p.badge ? 'popular' : ''}`}>
                  {p.badge && <span className="plan-badge">{p.badge}</span>}
                  <div className="head">
                    <div>
                      <div className="pname">{p.name}</div>
                      <div className="pprice">${usd} <span className="tk">/ {fmt(p.price)} TK</span></div>
                    </div>
                    <div className="picon">{p.icon}</div>
                  </div>
                  <div className="dur">{t('duration')}: {p.durationDays} {t('days')} · {p.dailyTaskLimit} tasks/day</div>
                  <ul>{p.perks.map(perk => <li key={perk}>{perk}</li>)}</ul>
                  <button
                    type="button"
                    className="btn full plan-buy-btn"
                    disabled={isActive}
                    onClick={() => setPayPlan(p)}
                  >
                    {isActive ? t('alreadyActive') : t('buyNow')}
                  </button>
                  {isActive && user.planExpiresAt && (
                    <div className="plan-expires">{t('validity')}: {new Date(user.planExpiresAt).toLocaleDateString()}</div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
      {payPlan && (
        <PaymentPayModal plan={payPlan} onClose={() => setPayPlan(null)} onSuccess={load} />
      )}
    </>
  );
}
