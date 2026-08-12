import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { useFeatures } from '../../features.jsx';
import { TopBar, fmt, useToast } from '../../components/ui.jsx';
import { playTap, playCash } from '../../utils/sound.js';

function assetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return url;
}

export default function Deposit() {
  const { t } = useI18n();
  const { features } = useFeatures();
  const toast = useToast();
  const nav = useNavigate();
  const [config, setConfig] = useState({});
  const [methods, setMethods] = useState([]);
  const [method, setMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/public/config').then(d => setConfig(d.config)).catch(() => {});
    api('/api/public/payment-methods').then(d => {
      const list = d.methods || [];
      setMethods(list);
      if (list[0]) setMethod(list[0]);
    }).catch(() => {});
  }, []);

  const submit = async () => {
    if (!method) return toast('Select a payment method', 'err');
    setBusy(true);
    try {
      const d = await api('/api/user/deposits', {
        method: 'POST',
        body: {
          amount,
          method: method.name,
          senderNumber,
          trxId,
        },
      });
      playCash();
      toast(d.message, 'ok');
      nav('/app/history?tab=deposits');
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <>
      <TopBar title={`💳 ${t('deposit')}`} />
      <div className="page">
        {features.deposits === false ? (
          <div className="empty">Deposits are temporarily disabled.</div>
        ) : (<>
        <div className="notice-bar" style={{ margin: '0 0 14px' }}>
          📢 {t('minDeposit')}: ৳{fmt(config.min_deposit || 300)} · {config.notice || ''}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14.5, marginBottom: 10 }}>{t('selectMethod')}</h3>
          <div className="pay-method-scroll">
            {methods.map(m => (
              <button
                key={m._id}
                type="button"
                className={`pay-method-tile ${method?._id === m._id ? 'sel' : ''}`}
                onClick={() => { setMethod(m); playTap(); }}
              >
                {method?._id === m._id && <span className="pay-check">✓</span>}
                {m.iconUrl ? (
                  <img src={assetUrl(m.iconUrl)} alt="" className="pay-method-icon" />
                ) : (
                  <span className="pay-method-fallback">{m.name.slice(0, 2)}</span>
                )}
                <span className="pay-method-name">{m.name}</span>
              </button>
            ))}
            {methods.length === 0 && (
              <div className="muted" style={{ padding: 8 }}>No payment methods available. Admin can add them from Payment Methods.</div>
            )}
          </div>
          {method?.accountDetails && (
            <div className="dev-otp" style={{ marginTop: 12, marginBottom: 0 }}>
              {method.networkHint && <div style={{ color: '#16A34A', fontWeight: 600, marginBottom: 4 }}>{method.networkHint}</div>}
              Send to <b>{method.accountDetails}</b>
              {method.instructions ? ` — ${method.instructions}` : ''}
            </div>
          )}
        </div>

        <div className="card">
          <div className="field">
            <label>{t('amount')} (৳)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ${config.min_deposit || 300}`} />
          </div>
          <div className="quick-amounts">
            {[500, 1000, 2000, 5000].map(a => (
              <button key={a} className={String(amount) === String(a) ? 'sel' : ''} onClick={() => setAmount(a)}>{a}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="field">
            <label>{t('senderNumber')}</label>
            <input value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXXXXXXXX / your wallet / UPI" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>{t('trxId')}</label>
            <input value={trxId} onChange={e => setTrxId(e.target.value)} placeholder="e.g. 9BX2K1TQ7M / TxHash" />
          </div>
        </div>

        <button className="btn full" disabled={busy || !method} onClick={submit}>{t('submitRequest')}</button>
        </>)}
      </div>
    </>
  );
}
