import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';
import { useI18n } from '../i18n.jsx';
import Logo from '../components/Logo.jsx';
import SocialAuthButtons from '../components/SocialAuthButtons.jsx';
import { useToast } from '../components/ui.jsx';

export default function Login() {
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [mode, setMode] = useState('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    if (!identifier.trim()) return toast(t('emailOrPhone') + ' required', 'err');
    try {
      const d = await api('/api/auth/send-otp', { method: 'POST', body: { identifier: identifier.trim(), purpose: 'login' } });
      setOtpSent(true);
      if (d.dev_otp) setDevOtp(d.dev_otp);
      toast(t('otpSent'), 'ok');
    } catch (e) { toast(e.message, 'err'); }
  };

  const startPhoneLogin = () => {
    setMode('otp');
    if (identifier.trim()) sendOtp();
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      let data;
      if (mode === 'password') {
        data = await api('/api/auth/login', { method: 'POST', body: { identifier: identifier.trim(), password } });
      } else {
        data = await api('/api/auth/login-otp', { method: 'POST', body: { identifier: identifier.trim(), otp } });
      }
      setToken(data.token);
      toast(`${t('welcomeUser')} ${data.user.name}! 🎉`, 'ok');
      nav(data.user.role === 'admin' ? '/admin' : data.user.role === 'agent' ? '/agent' : '/app');
    } catch (err) { toast(err.message, 'err'); }
    setBusy(false);
  };

  return (
    <div className="auth-mobile">
      <div className="auth-mobile-inner">
        <div className="auth-logo-left"><Logo size={44} /></div>
        <h1 className="auth-title">{t('welcomeBack')} 🎉</h1>
        <p className="auth-sub">{t('loginSub')}</p>

        <form onSubmit={submit}>
          <input
            className="auth-input"
            placeholder={t('emailOrPhone')}
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
          />

          {mode === 'password' ? (
            <>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="auth-eye" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <div className="auth-forgot-row">
                <Link to="/forgot">{t('forgotPassword')}</Link>
              </div>
            </>
          ) : (
            <>
              {devOtp && <div className="dev-otp">📱 Dev OTP: <b>{devOtp}</b></div>}
              <div className="auth-otp-row">
                <input
                  className="auth-input"
                  placeholder={t('otpCode')}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  required={otpSent}
                />
                <button type="button" className="btn auth-primary auth-otp-send" onClick={sendOtp}>
                  {otpSent ? '↻' : t('sendOtp')}
                </button>
              </div>
              <button type="button" className="link-btn auth-mode-back" onClick={() => setMode('password')}>
                ← {t('password')} {t('login')}
              </button>
            </>
          )}

          <button
            type="submit"
            className="btn auth-primary full"
            disabled={busy || (mode === 'otp' && !otpSent)}
          >
            {busy ? '...' : t('login')}
          </button>
        </form>

        <div className="auth-or-divider"><span>{t('orDivider')}</span></div>

        <SocialAuthButtons onPhoneClick={startPhoneLogin} />

        <p className="auth-footer-link">
          {t('noAccount')} <Link to="/register">{t('signup')}</Link>
        </p>
      </div>
    </div>
  );
}
