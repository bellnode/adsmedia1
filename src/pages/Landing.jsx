import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, hasToken } from '../api.js';
import { useI18n, LANGS } from '../i18n.jsx';
import { fmt, fmtDate } from '../components/ui.jsx';
import Logo from '../components/Logo.jsx';
import InstallAppBanner from '../components/InstallApp.jsx';

export default function Landing() {
  const { t, lang, setLang } = useI18n();
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [feed, setFeed] = useState([]);
  const [activity, setActivity] = useState([]);
  const [config, setConfig] = useState({});

  useEffect(() => {
    api('/api/public/stats').then(d => setStats(d)).catch(() => {});
    api('/api/public/plans').then(d => setPlans(d.plans)).catch(() => {});
    api('/api/public/faqs').then(d => setFaqs(d.faqs)).catch(() => {});
    api('/api/public/live-withdraws').then(d => setFeed(d.feed)).catch(() => {});
    api('/api/public/recent-activity').then(d => setActivity(d.activity || [])).catch(() => {});
    api('/api/public/config').then(d => setConfig(d.config)).catch(() => {});
  }, []);

  const loggedIn = hasToken();

  return (
    <div className="site-page">
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/"><Logo size={40} showTag markOnly /></Link>
          <div className="nav-links">
            <a href="#home" className="active">{t('home')}</a>
            <a href="#plans">{t('plans')}</a>
            <a href="#how">{t('howItWorks')}</a>
            <a href="#faq">{t('faq')}</a>
            <a href="#contact">{t('contact')}</a>
          </div>
          <div className="nav-cta">
            <select className="lang-select" value={lang} onChange={e => setLang(e.target.value)}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            {loggedIn ? (
              <Link to="/app" className="btn sm">{t('startEarning')} →</Link>
            ) : (<>
              <Link to="/login" className="btn sm outline nav-login-btn">{t('login')}</Link>
              <Link to="/register" className="btn sm nav-signup-btn">{t('signup')}</Link>
            </>)}
          </div>
        </div>
      </nav>

      <div id="home">
        <div className="hero-wrap">
          <div className="hero">
            <div className="hero-inner">
              <div className="hero-grid">
                <div>
                  <span className="hero-badge">💰 #1 Earning Platform</span>
                  <h1>{t('heroTitle1')}<br /><span className="accent">{t('heroTitle2')}</span></h1>
                  <p>{t('heroSub')}</p>
                  <div className="hero-actions">
                    <Link to={loggedIn ? '/app/tasks' : '/register'} className="btn">{t('startEarning')} ▶</Link>
                    <a href="#how" className="btn outline-white">{t('howItWorks')} ▶</a>
                  </div>
                  <div style={{ marginTop: 14, maxWidth: 480 }}>
                    <InstallAppBanner />
                  </div>
                </div>
                <div className="hero-right">
                  <div className="hero-visual">
                    <div className="hero-phone">
                    <div className="ph-top">
                      <div style={{ fontSize: 11, opacity: .85 }}>{t('coinBalance')}</div>
                      <div className="ph-bal">🪙 12,450</div>
                      <div className="ph-row"><span>৳600</span><span>5 {t('tasks')}</span><span>🔥 3 {t('streak')}</span></div>
                    </div>
                    <div className="ph-task"><span>▶ {t('dailyTasks')}</span><span className="amount-pos">+20🪙</span></div>
                    <div className="ph-task"><span>🎮 {t('games')}</span><span className="amount-pos">Play</span></div>
                    <div className="ph-task"><span>💸 {t('withdraw')}</span><span>→</span></div>
                  </div>
                  </div>
                  <div className="hero-offer">
                  <div className="t">🎁 {t('specialOffer')}</div>
                  <div className="pct">{config.referral_percent ?? 5}%</div>
                  <div className="t">{t('referralCommission')}</div>
                  <p>{t('inviteEarn')}</p>
                  <Link to={loggedIn ? '/app/refer' : '/register'} className="btn sm blue">{t('learnMore')}</Link>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {stats && (
          <div className="stats-bar">
            <div className="stat"><div className="ic" style={{ background: 'var(--green-light)' }}>👥</div>
              <div><div className="v">{fmt(stats.totalUsers)}+</div><div className="l">{t('totalUsers')}</div></div></div>
            <div className="stat"><div className="ic" style={{ background: 'var(--blue-light)' }}>💳</div>
              <div><div className="v">৳{fmt(stats.totalPaid)}+</div><div className="l">{t('totalPaid')}</div></div></div>
            <div className="stat"><div className="ic" style={{ background: '#F3E8FF' }}>✅</div>
              <div><div className="v">{fmt(stats.tasksCompleted)}+</div><div className="l">{t('tasksCompleted')}</div></div></div>
            <div className="stat"><div className="ic" style={{ background: 'var(--orange-light)' }}>📅</div>
              <div><div className="v">{fmt(stats.todayNewUsers)}+</div><div className="l">{t('todayNewUsers')}</div></div></div>
            <div className="stat"><div className="ic" style={{ background: '#FEE2E2' }}>💸</div>
              <div><div className="v">৳{fmt(stats.totalPaid)}+</div><div className="l">{t('totalWithdraw')}</div></div></div>
          </div>
        )}
      </div>

      <div className="landing-section">
        <h2 className="section-h" id="how">{t('howItWorks')}</h2>
        <div className="section-sub" />
        <div className="how-grid">
          {[
            ['👤', 'var(--green-light)', t('step1t'), t('step1d')],
            ['🛒', 'var(--blue-light)', t('step2t'), t('step2d')],
            ['📋', '#F3E8FF', t('step3t'), t('step3d')],
            ['💳', 'var(--orange-light)', t('step4t'), t('step4d')],
          ].map(([ic, bg, title, desc]) => (
            <div className="how-card" key={title}>
              <div className="ic" style={{ background: bg }}>{ic}</div>
              <div className="t">{title}</div>
              <div className="d">{desc}</div>
            </div>
          ))}
        </div>

        <h2 className="section-h" id="plans">{t('choosePlan')}</h2>
        <div className="section-sub" />
        <div className="plans-grid">
          {plans.map(p => (
            <div key={p._id} className={`plan-card ${p.badge ? 'popular' : ''}`}>
              {p.badge && <span className="plan-badge" style={{ background: 'var(--orange)' }}>{p.badge}</span>}
              <div className="head">
                <div>
                  <div className="pname" style={{ color: p.color }}>{p.name}</div>
                  <div className="pprice" style={{ color: p.color }}>{fmt(p.price)} TK</div>
                </div>
                <div className="picon" style={{ background: p.color + '22' }}>{p.icon}</div>
              </div>
              <div className="dur">{t('duration')}: {p.durationDays} {t('days')}</div>
              <ul>{p.perks.map(perk => <li key={perk}>{perk}</li>)}</ul>
              <Link to={loggedIn ? '/app/plans' : '/register'} className="btn full" style={{ background: p.color }}>{t('buyNow')}</Link>
            </div>
          ))}
        </div>

        {activity.length > 0 && (<>
          <h2 className="section-h">📊 {t('recentActivity')}</h2>
          <div className="section-sub" />
          <div className="live-feed">
            {activity.slice(0, 12).map((a, i) => (
              <div className="live-item" key={i}>
                <span className="dot" style={{ background: a.type === 'withdraw' ? 'var(--orange)' : a.type === 'deposit' ? 'var(--blue)' : 'var(--green)' }} />
                <div style={{ flex: 1 }}>
                  <b>{a.user}</b>
                  <span className="muted"> · {a.type === 'task' ? (a.label || 'Task') : a.method || a.type}</span>
                  <div className="muted" style={{ fontSize: 11.5 }}>{fmtDate(a.at)} · {a.status}</div>
                </div>
                <span className="amount-pos">+৳{fmt(a.amount)}</span>
              </div>
            ))}
          </div>
        </>)}

        {feed.length > 0 && (<>
          <h2 className="section-h">🟢 {t('liveWithdraws')}</h2>
          <div className="section-sub" />
          <div className="live-feed">
            {feed.map((f, i) => (
              <div className="live-item" key={i}>
                <span className="dot" />
                <div style={{ flex: 1 }}>
                  <b>{f.name}</b> <span className="muted">({f.phone})</span>
                  <div className="muted" style={{ fontSize: 11.5 }}>{f.method} · {fmtDate(f.at)}</div>
                </div>
                <span className="amount-pos">৳{fmt(f.amount)}</span>
              </div>
            ))}
          </div>
        </>)}

        <h2 className="section-h" id="faq">{t('faq')}</h2>
        <div className="section-sub" />
        <div style={{ maxWidth: 800, margin: '0 auto 30px' }}>
          {faqs.map(f => (
            <details className="faq-item" key={f._id}>
              <summary>{f.question}</summary>
              <div className="a">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <footer className="footer" id="contact">
        <div className="cols">
          <div>
            <Logo size={36} showTag />
            <p style={{ lineHeight: 1.7, marginTop: 12 }}>{t('heroSub')}</p>
          </div>
          <div>
            <h4>{t('plans')}</h4>
            {plans.slice(0, 4).map(p => <Link key={p._id} to="/register">{p.name} — ৳{fmt(p.price)}</Link>)}
          </div>
          <div>
            <h4>{t('support')}</h4>
            <a href={config.helpline || '#'} target="_blank" rel="noreferrer">HelpLine / Live Chat</a>
            <a href="#faq">{t('faq')}</a>
            <Link to="/login">{t('login')}</Link>
            <Link to="/register">{t('signup')}</Link>
          </div>
          <div>
            <h4>Payments We Support</h4>
            <div className="pay-logos">
              {['bKash', 'Nagad', 'Rocket', 'UPI', 'Paytm'].map(p => <span key={p} className="pay-logo">{p}</span>)}
            </div>
            <p style={{ marginTop: 10, fontSize: 12 }}>🔒 SSL Secured · OTP Verified · Anti-Fraud Protected</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #1F2937', paddingTop: 16, fontSize: 12, maxWidth: 1280, margin: '0 auto' }}>
          © {new Date().getFullYear()} Admedia1.com — {t('tagline')}
        </div>
      </footer>
    </div>
  );
}
