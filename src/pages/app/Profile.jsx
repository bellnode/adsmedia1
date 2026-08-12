import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, logout } from '../../api.js';
import { useI18n, LANGS } from '../../i18n.jsx';
import { TopBar, fmt, useToast } from '../../components/ui.jsx';

export default function Profile() {
  const { t, lang, setLang } = useI18n();
  const toast = useToast();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('view'); // view | edit | password
  const [form, setForm] = useState({});
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '' });

  const load = () => api('/api/user/me').then(d => {
    setUser(d.user);
    setForm({
      name: d.user.name, email: d.user.email, username: d.user.username || '',
      paymentMethod: d.user.paymentMethod, paymentNumber: d.user.paymentNumber, paymentName: d.user.paymentName,
    });
  }).catch(() => {});
  useEffect(load, []);

  const saveProfile = async () => {
    try {
      await api('/api/user/profile', { method: 'PUT', body: form });
      toast('Profile updated ✓', 'ok');
      setMode('view'); load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const changePw = async () => {
    try {
      await api('/api/user/change-password', { method: 'POST', body: pw });
      toast('Password changed ✓', 'ok');
      setPw({ oldPassword: '', newPassword: '' });
      setMode('view');
    } catch (e) { toast(e.message, 'err'); }
  };

  const doLogout = () => logout();

  if (!user) return (<><TopBar title={t('profile')} /><span className="spinner" /></>);

  return (
    <>
      <TopBar title={`👤 ${t('profile')}`} />
      <div className="page">
        <div className="profile-head">
          <div className="avatar">{user.name[0]?.toUpperCase()}</div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{user.name}</div>
          <div className="muted" style={{ fontSize: 13 }}>{user.phone}</div>
        </div>

        {mode === 'view' && (<>
          <div className="info-row"><span className="ico">✉️</span> {user.email || '—'}</div>
          <div className="info-row"><span className="ico">💰</span> {t('mainBalance')}: ৳{fmt(user.mainBalance)}</div>
          <div className="info-row"><span className="ico">💳</span> {t('depositBalance')}: ৳{fmt(user.depositBalance)}</div>
          <div className="info-row"><span className="ico">⚡</span> {t('taskEarnings')}: ৳{fmt(user.taskEarnings)}</div>
          <div className="info-row"><span className="ico">🤝</span> {t('referralEarnings')}: ৳{fmt(user.referralEarnings)}</div>
          <div className="info-row"><span className="ico">👤</span> Username: <b>{user.username ? `@${user.username}` : 'Not set'}</b></div>
          <div className="info-row"><span className="ico">🎟️</span> {t('referCode')}: <b>{user.referCode}</b></div>
          <div className="info-row"><span className="ico">💳</span> {t('paymentDetails')}: {user.paymentMethod ? `${user.paymentMethod} · ${user.paymentNumber}` : '—'}</div>
          <div className="info-row"><span className="ico">📅</span> {t('memberSince')}: {new Date(user.createdAt).toLocaleDateString()}</div>
          <div className="info-row">
            <span className="ico">🌐</span> Language
            <select className="lang-select" style={{ marginLeft: 'auto' }} value={lang} onChange={e => setLang(e.target.value)}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <button className="info-row" onClick={() => setMode('edit')}><span className="ico">✏️</span> {t('editProfile')} <span className="chev">›</span></button>
          <button className="info-row" onClick={() => setMode('password')}><span className="ico">🔑</span> {t('changePassword')} <span className="chev">›</span></button>
          <Link className="info-row" to="/app/refer"><span className="ico">🤝</span> {t('refer')} <span className="chev">›</span></Link>
          <Link className="info-row" to="/app/support"><span className="ico">🎧</span> {t('support')} <span className="chev">›</span></Link>
          <button className="btn full red" style={{ marginTop: 10 }} onClick={doLogout}>{t('logout')}</button>
        </>)}

        {mode === 'edit' && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>{t('editProfile')}</h3>
            <div className="field"><label>{t('fullName')}</label>
              <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="field"><label>Email</label>
              <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            {!user.username && (
              <div className="field"><label>Username (for agent deposits)</label>
                <input value={form.username || ''} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))} placeholder="johndoe" /></div>
            )}
            <div className="field"><label>{t('paymentDetails')} — Method</label>
              <select value={form.paymentMethod || ''} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                <option value="">Select...</option>
                {['bKash', 'Nagad', 'Rocket', 'UPI', 'Paytm'].map(m => <option key={m}>{m}</option>)}
              </select></div>
            <div className="field"><label>{t('walletNumber')}</label>
              <input value={form.paymentNumber || ''} onChange={e => setForm(f => ({ ...f, paymentNumber: e.target.value }))} /></div>
            <div className="field"><label>Account Holder Name</label>
              <input value={form.paymentName || ''} onChange={e => setForm(f => ({ ...f, paymentName: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setMode('view')}>Cancel</button>
              <button className="btn" style={{ flex: 1 }} onClick={saveProfile}>{t('save')}</button>
            </div>
          </div>
        )}

        {mode === 'password' && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>{t('changePassword')}</h3>
            <div className="field"><label>Old Password</label>
              <input type="password" value={pw.oldPassword} onChange={e => setPw(p => ({ ...p, oldPassword: e.target.value }))} /></div>
            <div className="field"><label>{t('newPassword')}</label>
              <input type="password" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setMode('view')}>Cancel</button>
              <button className="btn" style={{ flex: 1 }} onClick={changePw}>{t('save')}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
