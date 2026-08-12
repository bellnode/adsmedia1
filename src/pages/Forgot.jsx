import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n } from '../i18n.jsx';
import Logo from '../components/Logo.jsx';
import { useToast } from '../components/ui.jsx';

export default function Forgot() {
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    if (!identifier.trim()) return toast(t('emailOrPhone') + ' required', 'err');
    try {
      const d = await api('/api/auth/send-otp', { method: 'POST', body: { identifier: identifier.trim(), purpose: 'reset' } });
      setOtpSent(true);
      if (d.dev_otp) setDevOtp(d.dev_otp);
      toast('OTP sent', 'ok');
    } catch (err) { toast(err.message, 'err'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { identifier: identifier.trim(), otp, newPassword } });
      toast('Password reset! Please login.', 'ok');
      nav('/login');
    } catch (err) { toast(err.message, 'err'); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-hero" style={{ textAlign: 'center' }}>
        <Logo size={64} showTag />
        <div className="sub" style={{ marginTop: 8 }}>{t('resetPassword')}</div>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <h2>{t('resetPassword')}</h2>
        <div className="field"><label>{t('emailOrPhone')}</label>
          <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="01XXXXXXXXX or you@email.com" required /></div>
        {devOtp && <div className="dev-otp">📱 Dev mode — your OTP: <b>{devOtp}</b></div>}
        <div className="otp-row" style={{ marginBottom: 13 }}>
          <div className="field"><label>{t('otpCode')}</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} required={otpSent} /></div>
          <button type="button" className="btn blue" style={{ alignSelf: 'flex-end' }} onClick={sendOtp}>
            {otpSent ? '↻' : t('sendOtp')}
          </button>
        </div>
        <div className="field"><label>{t('newPassword')}</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required /></div>
        <button className="btn full" disabled={!otpSent}>{t('resetPassword')}</button>
        <div className="auth-switch"><Link to="/login">← {t('login')}</Link></div>
      </form>
    </div>
  );
}
