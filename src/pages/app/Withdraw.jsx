import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useI18n } from '../../i18n.jsx';
import { useFeatures } from '../../features.jsx';
import { TopBar, fmt, useToast } from '../../components/ui.jsx';
import OtpBoxes from '../../components/OtpBoxes.jsx';

const METHODS = ['bKash', 'Nagad', 'Rocket', 'UPI', 'Paytm'];
const CLS = { bKash: 'pm-bkash', Nagad: 'pm-nagad', Rocket: 'pm-rocket', UPI: 'pm-upi', Paytm: 'pm-paytm' };

export default function Withdraw() {
  const { t } = useI18n();
  const { features } = useFeatures();
  const toast = useToast();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({});
  const [method, setMethod] = useState('');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendSec, setResendSec] = useState(0);

  const loadUser = () => api('/api/user/me').then(d => {
    setUser(d.user);
    setEmail(d.user.email || '');
    if (d.user.paymentMethod) setMethod(d.user.paymentMethod);
    if (d.user.paymentNumber) setNumber(d.user.paymentNumber);
  }).catch(() => {});

  useEffect(() => {
    loadUser();
    api('/api/public/config').then(d => setConfig(d.config)).catch(() => {});
  }, []);

  useEffect(() => {
    if (resendSec <= 0) return;
    const id = setTimeout(() => setResendSec(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendSec]);

  const sendVerifyOtp = async () => {
    setBusy(true);
    try {
      const d = await api('/api/user/verify-email/send', { method: 'POST', body: { email } });
      setOtpSent(true);
      setResendSec(60);
      setEmail(d.email || email);
      toast(d.message || t('otpSentEmail'), 'ok');
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const confirmVerify = async () => {
    if (otp.length !== 6) return toast(t('enterFullOtp'), 'err');
    setBusy(true);
    try {
      const d = await api('/api/user/verify-email', { method: 'POST', body: { email, otp } });
      toast(d.message || t('emailVerifiedOk'), 'ok');
      setUser(d.user);
      setOtp('');
      setOtpSent(false);
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true);
    try {
      const d = await api('/api/user/withdrawals', { method: 'POST', body: { amount, method, number } });
      toast(d.message, 'ok');
      nav('/app/history?tab=withdrawals');
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  if (!user) return (<><TopBar title={t('withdraw')} /><span className="spinner" /></>);

  const needsEmailVerify = !user.emailVerified;

  return (
    <>
      <TopBar title={`💸 ${t('withdraw')}`} />
      <div className="page">
        {features.withdrawals === false ? (
          <div className="empty">Withdrawals are temporarily disabled.</div>
        ) : (<>
        <div className="wallet-card" style={{ margin: '0 0 14px' }}>
          <div className="lbl">{t('mainBalance')}</div>
          <div className="big">৳ {fmt(user.mainBalance)}</div>
          <div style={{ fontSize: 12, opacity: .85 }}>
            {t('minWithdraw')}: ৳{fmt(config.min_withdraw || 200)} · {t('dailyLimit')}: ৳{fmt(config.daily_withdraw_limit || 5000)} · {t('processing')}: {config.processing_hours || 24} {t('hours')}
          </div>
        </div>

        {needsEmailVerify ? (
          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 6 }}>{t('verifyEmailTitle')}</h3>
            <p className="muted" style={{ fontSize: 13, marginBottom: 12, lineHeight: 1.45 }}>
              {t('verifyEmailWithdrawHint')}
            </p>
            <div className="field">
              <label>{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setOtpSent(false); }}
                placeholder="you@email.com"
              />
            </div>
            {!otpSent ? (
              <button className="btn full" disabled={busy} onClick={sendVerifyOtp}>
                {busy ? '...' : t('sendOtp')}
              </button>
            ) : (
              <>
                <p className="muted" style={{ fontSize: 12.5, marginBottom: 8 }}>{t('checkInboxSpam')}</p>
                <OtpBoxes value={otp} onChange={setOtp} />
                <p className="otp-resend" style={{ marginTop: 10 }}>
                  {resendSec > 0
                    ? <>{t('resendIn')} <b>00:{String(resendSec).padStart(2, '0')}</b></>
                    : <button type="button" className="link-btn" onClick={sendVerifyOtp}>{t('resendOtp')}</button>}
                </p>
                <button className="btn full" disabled={busy || otp.length !== 6} onClick={confirmVerify}>
                  {busy ? '...' : t('verifyEmailBtn')}
                </button>
              </>
            )}
          </div>
        ) : (<>
        <div className="card" style={{ marginBottom: 12, fontSize: 12.5, color: 'var(--muted)' }}>
          {t('emailVerifiedAs')}: <b style={{ color: 'var(--text)' }}>{user.email}</b>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14.5, marginBottom: 10 }}>{t('selectMethod')}</h3>
          <div className="pay-methods">
            {METHODS.map(m => (
              <button key={m} className={`pay-method ${CLS[m]} ${method === m ? 'sel' : ''}`} onClick={() => setMethod(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="field">
            <label>{t('walletNumber')}</label>
            <input value={number} onChange={e => setNumber(e.target.value)} placeholder="01XXXXXXXXX / yourname@upi" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>{t('amount')} (৳)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ${config.min_withdraw || 200}`} />
          </div>
        </div>

        <button className="btn full" disabled={busy} onClick={submit}>{t('submitRequest')}</button>
        </>)}
        </>)}
      </div>
    </>
  );
}
