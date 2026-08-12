import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, setToken } from '../api.js';
import { useI18n } from '../i18n.jsx';
import Logo from '../components/Logo.jsx';
import SocialAuthButtons from '../components/SocialAuthButtons.jsx';
import { useToast } from '../components/ui.jsx';

function parseId(raw) {
  const id = String(raw || '').trim();
  if (id.includes('@')) return { type: 'email', value: id.toLowerCase() };
  if (/^\+?\d{10,14}$/.test(id)) return { type: 'phone', value: id };
  return null;
}

export default function Register() {
  const { t } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    referCode: params.get('ref') || '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const register = async (e) => {
    e.preventDefault();
    const parsed = parseId(form.identifier);
    if (!form.name.trim()) return toast(`${t('fullName')} required`, 'err');
    if (!parsed) return toast(t('validEmailOrPhone'), 'err');
    if (form.password.length < 6) return toast(t('passwordMin'), 'err');
    if (form.password !== form.confirmPassword) return toast(t('passwordMismatch'), 'err');
    if (!agreed) return toast(t('acceptTerms'), 'err');

    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        password: form.password,
        referCode: form.referCode || undefined,
        identifier: parsed.value,
        ...(parsed.type === 'phone' ? { phone: parsed.value } : { email: parsed.value }),
      };
      const d = await api('/api/auth/register', { method: 'POST', body });
      setToken(d.token);
      toast(`${t('welcomeUser')} ${d.user.name}! 🎉`, 'ok');
      nav('/app');
    } catch (err) { toast(err.message, 'err'); }
    setBusy(false);
  };

  return (
    <div className="auth-mobile">
      <div className="auth-mobile-inner">
        <div className="auth-logo-left"><Logo size={44} /></div>
        <h1 className="auth-title">{t('createAccount')} 🎉</h1>
        <p className="auth-sub">{t('signupSub')}</p>

        <form onSubmit={register}>
          <input
            className="auth-input"
            placeholder={t('fullName')}
            value={form.name}
            onChange={set('name')}
            required
          />
          <input
            className="auth-input"
            placeholder={t('emailOrPhone')}
            value={form.identifier}
            onChange={set('identifier')}
            required
          />
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              type={showPass ? 'text' : 'password'}
              placeholder={t('password')}
              value={form.password}
              onChange={set('password')}
              minLength={6}
              required
            />
            <button type="button" className="auth-eye" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
          <div className="auth-input-wrap">
            <input
              className="auth-input"
              type={showConfirm ? 'text' : 'password'}
              placeholder={t('confirmPassword')}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              minLength={6}
              required
            />
            <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm">
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>

          {form.referCode ? (
            <input className="auth-input" placeholder={t('referCodeOpt')} value={form.referCode} onChange={set('referCode')} />
          ) : null}

          <label className="auth-check">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span>{t('agreeTerms')} <Link to="/">{t('termsConditions')}</Link></span>
          </label>

          <button type="submit" className="btn auth-primary full" disabled={busy}>
            {busy ? '...' : t('signUp')}
          </button>
        </form>

        <div className="auth-or-divider"><span>{t('orDivider')}</span></div>

        <SocialAuthButtons onPhoneClick={() => toast('Use email or phone above to sign up', '')} />

        <p className="auth-footer-link">
          {t('haveAccount')} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
}
