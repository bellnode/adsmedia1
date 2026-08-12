import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logout } from '../../api.js';
import Logo from '../../components/Logo.jsx';
import { fmt, fmtDate, useToast } from '../../components/ui.jsx';

const TABS = [
  ['dashboard', '📊 Dashboard'],
  ['deposits', '💳 Deposits'],
  ['withdrawals', '💸 Withdrawals'],
  ['payments', '💰 Payment Methods'],
  ['agents', '🤝 Agents'],
  ['agentpurchases', '🪙 Agent Purchases'],
  ['agentcomm', '💰 Commissions'],
  ['users', '👥 Users'],
  ['plans', '📦 Plans'],
  ['planmanager', '📋 Plan Manager'],
  ['tasks', '⚡ Task Manager'],
  ['socialtasks', '📱 Social Tasks'],
  ['banners', '🖼 Banners'],
  ['tickets', '🎫 Tickets'],
  ['faqs', '❓ FAQs'],
  ['tutorials', '🎬 Video Tutorials'],
  ['broadcast', '📣 Broadcast'],
  ['planorders', '💎 Plan Orders'],
  ['games', '🎮 Games Config'],
  ['settings', '⚙️ Settings'],
];

export default function Admin() {
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('dashboard');
  const [refresh, setRefresh] = useState(0);
  const reload = () => setRefresh(x => x + 1);

  useEffect(() => {
    api('/api/user/me').then(d => { if (d.user.role !== 'admin') nav('/app'); }).catch(() => nav('/login'));
  }, []);

  const Panel = {
    dashboard: Dashboard, deposits: Deposits, withdrawals: Withdrawals, payments: PaymentMethodsAdmin,
    agents: Agents, agentpurchases: AgentPurchases, agentcomm: AgentCommissions,
    users: Users, plans: Plans, planmanager: PlanManager, tasks: Tasks, socialtasks: SocialTasksAdmin, banners: Banners,
    tickets: Tickets, faqs: Faqs, tutorials: VideoTutorials, broadcast: Broadcast, planorders: PlanOrders, games: GamesConfig, settings: Settings,
  }[tab];

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <Logo size={36} light showTag />
        <span className="admin-title">Admin Panel</span>
        <a href="/app" style={{ color: '#7dd3fc', fontSize: 13 }}>← User App</a>
        <button className="btn xs red" onClick={logout}>Logout</button>
      </div>
      <div className="admin-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'sel' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      <div className="page" key={tab + refresh}>
        <Panel toast={toast} reload={reload} />
      </div>
    </div>
  );
}

// ---------------- Dashboard ----------------
function Dashboard({ toast }) {
  const [s, setS] = useState(null);
  const [fraud, setFraud] = useState([]);
  const [activePeriod, setActivePeriod] = useState('today');
  const [regPeriod, setRegPeriod] = useState('today');
  useEffect(() => {
    api('/api/admin/stats').then(setS).catch(e => toast(e.message, 'err'));
    api('/api/admin/fraud-check').then(d => setFraud(d.duplicateIps)).catch(() => {});
  }, []);
  if (!s) return <span className="spinner" />;
  const periodKeys = [
    ['today', 'Today'],
    ['yesterday', 'Yesterday'],
    ['week', 'This Week'],
    ['month', 'This Month'],
  ];
  const activeVal = s.activeUsers?.[activePeriod] ?? 0;
  const regVal = s.registrations?.[regPeriod] ?? 0;
  const items = [
    ['👥 Total Users', fmt(s.totalUsers)],
    ['👑 Premium Users', fmt(s.totalPremiumUsers || 0)],
    ['💳 Total Deposits', '৳' + fmt(s.totalDeposits)],
    ['💸 Total Withdrawals', '৳' + fmt(s.totalWithdrawals)],
    ['⏳ Pending Deposits', s.pendingDeposits],
    ['⏳ Pending Withdrawals', s.pendingWithdrawals],
    ['✅ Tasks Completed', fmt(s.tasksCompleted)],
    ['🎫 Open Tickets', s.openTickets],
  ];
  const balanceItems = [
    ['💰 Current Total Balance', '৳' + fmt(s.currentTotalBalance || 0)],
    ['📥 Total Credits (in)', '৳' + fmt(s.totalCredits || 0)],
    ['📤 Total Debits (out)', '৳' + fmt(s.totalDebits || 0)],
    ['🪙 Coins Added', fmt(s.coinsAdded || 0)],
    ['🪙 Coins Deducted', fmt(s.coinsDeducted || 0)],
    ['🪙 Current Coins (all users)', fmt(s.currentTotalCoins || 0)],
  ];
  return (<>
    <div className="stats-grid">
      {items.map(([l, v]) => (
        <div className="card" key={l} style={{ margin: 0, textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: 13 }}>{l}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{v}</div>
        </div>
      ))}
    </div>

    <h3 style={{ margin: '18px 0 10px' }}>Analytics Filters</h3>
    <div className="stats-grid">
      <div className="card" style={{ margin: 0 }}>
        <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>🟢 Active Users</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {periodKeys.map(([k, label]) => (
            <button key={k} type="button" className={`btn xs ${activePeriod === k ? '' : 'ghost'}`} onClick={() => setActivePeriod(k)}>{label}</button>
          ))}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{fmt(activeVal)}</div>
      </div>
      <div className="card" style={{ margin: 0 }}>
        <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>📝 Registrations</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {periodKeys.map(([k, label]) => (
            <button key={k} type="button" className={`btn xs ${regPeriod === k ? '' : 'ghost'}`} onClick={() => setRegPeriod(k)}>{label}</button>
          ))}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{fmt(regVal)}</div>
      </div>
      <div className="card" style={{ margin: 0, textAlign: 'center' }}>
        <div className="muted" style={{ fontSize: 13 }}>👑 Total Premium Users</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{fmt(s.totalPremiumUsers || 0)}</div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Users with an active plan</div>
      </div>
    </div>

    <h3 style={{ margin: '18px 0 10px' }}>Auto Balance & Coins</h3>
    <div className="stats-grid">
      {balanceItems.map(([l, v]) => (
        <div className="card" key={l} style={{ margin: 0, textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: 13 }}>{l}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{v}</div>
        </div>
      ))}
    </div>
    {fraud.length > 0 && (
      <div className="card">
        <h3 style={{ marginBottom: 10 }}>🚨 Anti-Fraud: Multiple accounts from same IP</h3>
        {fraud.map(f => (
          <div key={f._id} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
            <b>{f._id}</b> — {f.count} accounts: {f.users.map(u => `${u.name} (${u.phone})`).join(', ')}
          </div>
        ))}
      </div>
    )}
  </>);
}

// ---------------- Payment Methods ----------------
function PaymentMethodsAdmin({ toast, reload }) {
  const empty = { name: '', type: 'crypto', networkHint: '', accountDetails: '', instructions: '', qrUrl: '', sort: 0, active: true };
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api('/api/admin/payment-methods').then(d => setRows(d.methods)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, [reload]);

  const startEdit = (m) => {
    setEditId(m._id);
    setForm({
      name: m.name || '',
      type: m.type || 'mobile',
      networkHint: m.networkHint || '',
      accountDetails: m.accountDetails || '',
      instructions: m.instructions || '',
      qrUrl: m.qrUrl || '',
      sort: m.sort || 0,
      active: m.active !== false,
    });
    setFile(null);
  };

  const save = async () => {
    if (!form.name.trim()) return toast('Name required', 'err');
    setBusy(true);
    try {
      const fd = new FormData();
      if (editId) fd.append('id', editId);
      fd.append('name', form.name.trim());
      fd.append('type', form.type);
      fd.append('networkHint', form.networkHint);
      fd.append('accountDetails', form.accountDetails);
      fd.append('instructions', form.instructions);
      fd.append('qrUrl', form.qrUrl);
      fd.append('sort', String(form.sort || 0));
      fd.append('active', form.active ? 'true' : 'false');
      if (file) fd.append('icon', file);
      await api('/api/admin/payment-methods/upload', { method: 'POST', formData: fd });
      toast(editId ? 'Updated ✓' : 'Payment method added ✓', 'ok');
      setForm(empty);
      setEditId(null);
      setFile(null);
      load();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const remove = async (id) => {
    if (!confirm('Delete this payment method?')) return;
    try {
      await api(`/api/admin/payment-methods/${id}`, { method: 'DELETE' });
      toast('Deleted', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  if (!rows) return <span className="spinner" />;

  return (
    <>
      <div className="card">
        <h3 style={{ marginBottom: 10 }}>{editId ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Upload a custom logo — it shows dynamically in user Deposit & Plan payment screens.
        </p>
        <div className="field"><label>Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Binance BSC / USDT TRC20 / bKash" /></div>
        <div className="field"><label>Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="crypto">Crypto</option>
            <option value="mobile">Mobile wallet</option>
            <option value="other">Other</option>
          </select></div>
        <div className="field"><label>Network / hint</label>
          <input value={form.networkHint} onChange={e => setForm(f => ({ ...f, networkHint: e.target.value }))} placeholder="Send via BSC network only" /></div>
        <div className="field"><label>Wallet address / account details</label>
          <input value={form.accountDetails} onChange={e => setForm(f => ({ ...f, accountDetails: e.target.value }))} placeholder="0x... or 01XXXXXXXXX" /></div>
        <div className="field"><label>Instructions</label>
          <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} rows={3} placeholder="Step 1; Step 2; Step 3" /></div>
        <div className="field"><label>QR image URL (optional)</label>
          <input value={form.qrUrl} onChange={e => setForm(f => ({ ...f, qrUrl: e.target.value }))} placeholder="https://..." /></div>
        <div className="field"><label>Icon / logo upload</label>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
        <div className="field"><label>Sort order</label>
          <input type="number" value={form.sort} onChange={e => setForm(f => ({ ...f, sort: e.target.value }))} /></div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, fontSize: 14 }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> Active (show to users)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" disabled={busy} onClick={save}>{editId ? 'Update' : 'Add Method'}</button>
          {editId && <button className="btn ghost" onClick={() => { setEditId(null); setForm(empty); setFile(null); }}>Cancel</button>}
        </div>
      </div>

      <div className="table-wrap"><table>
        <thead><tr><th>Icon</th><th>Name</th><th>Details</th><th>Type</th><th>Active</th><th>Action</th></tr></thead>
        <tbody>{rows.map(m => (
          <tr key={m._id}>
            <td>{m.iconUrl ? <img src={m.iconUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8 }} /> : '—'}</td>
            <td><b>{m.name}</b><br /><small className="muted">{m.networkHint}</small></td>
            <td style={{ maxWidth: 180, wordBreak: 'break-all', fontSize: 12 }}>{m.accountDetails || '—'}</td>
            <td>{m.type}</td>
            <td>{m.active ? '✅' : '❌'}</td>
            <td>
              <div className="row-actions">
                <button className="btn xs" onClick={() => startEdit(m)}>Edit</button>
                <button className="btn xs red" onClick={() => remove(m._id)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
    </>
  );
}

// ---------------- Deposits ----------------
function Deposits({ toast, reload }) {
  const [rows, setRows] = useState(null);
  const load = () => api('/api/admin/deposits').then(d => setRows(d.deposits)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, [reload]);
  const review = async (id, action) => {
    try {
      await api(`/api/admin/deposits/${id}/review`, { method: 'POST', body: { action } });
      toast(action + 'd ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (
    <div className="table-wrap"><table>
      <thead><tr><th>User</th><th>Amount</th><th>Method</th><th>Sender</th><th>TrxID</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map(d => (
        <tr key={d._id}>
          <td>{d.user?.name}<br /><small className="muted">{d.user?.phone}</small></td>
          <td><b>৳{fmt(d.amount)}</b></td>
          <td>{d.method}</td>
          <td>{d.senderNumber}</td>
          <td>{d.trxId}</td>
          <td>{fmtDate(d.createdAt)}</td>
          <td><span className={`pill ${d.status}`}>{d.status}</span></td>
          <td>{d.status === 'pending' ? (
            <div className="row-actions">
              <button className="btn xs" onClick={() => review(d._id, 'approve')}>Approve</button>
              <button className="btn xs red" onClick={() => review(d._id, 'reject')}>Reject</button>
            </div>) : '—'}</td>
        </tr>))}</tbody>
    </table></div>
  );
}

// ---------------- Withdrawals ----------------
function Withdrawals({ toast, reload }) {
  const [rows, setRows] = useState(null);
  const load = () => api('/api/admin/withdrawals').then(d => setRows(d.withdrawals)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, [reload]);
  const review = async (id, action) => {
    try {
      await api(`/api/admin/withdrawals/${id}/review`, { method: 'POST', body: { action } });
      toast(action + 'd ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (
    <div className="table-wrap"><table>
      <thead><tr><th>User</th><th>Amount</th><th>Method</th><th>Wallet</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map(w => (
        <tr key={w._id}>
          <td>{w.user?.name}<br /><small className="muted">{w.user?.phone}</small></td>
          <td><b>৳{fmt(w.amount)}</b></td>
          <td>{w.method}</td>
          <td>{w.number}</td>
          <td>{fmtDate(w.createdAt)}</td>
          <td><span className={`pill ${w.status}`}>{w.status}</span></td>
          <td>{w.status === 'pending' ? (
            <div className="row-actions">
              <button className="btn xs" onClick={() => review(w._id, 'approve')}>Approve & Pay</button>
              <button className="btn xs red" onClick={() => review(w._id, 'reject')}>Reject & Refund</button>
            </div>) : '—'}</td>
        </tr>))}</tbody>
    </table></div>
  );
}

// ---------------- Users ----------------
function Users({ toast, reload }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  const load = (query = '') => api('/api/admin/users?q=' + encodeURIComponent(query)).then(d => setRows(d.users)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);
  const toggleBlock = async (id) => {
    try { await api(`/api/admin/users/${id}/toggle-block`, { method: 'POST' }); load(q); } catch (e) { toast(e.message, 'err'); }
  };
  const adjust = async (u) => {
    const amt = prompt(`Adjust main balance for ${u.name}.\nEnter amount (negative to deduct):`);
    if (amt === null) return;
    try { await api(`/api/admin/users/${u.id}/adjust-balance`, { method: 'POST', body: { amount: Number(amt) } }); toast('Balance updated ✓', 'ok'); load(q); }
    catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (<>
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input style={{ flex: 1, maxWidth: 320, padding: '10px 13px', border: '1.5px solid var(--border)', borderRadius: 10 }}
        placeholder="Search name or phone..." value={q} onChange={e => setQ(e.target.value)} />
      <button className="btn sm" onClick={() => load(q)}>Search</button>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>Name</th><th>Phone</th><th>Main Bal</th><th>Deposit Bal</th><th>Plan</th><th>IP</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map(u => (
        <tr key={u.id}>
          <td>{u.name} {u.role === 'admin' && '👑'}</td>
          <td>{u.phone}</td>
          <td><b>৳{fmt(u.mainBalance)}</b></td>
          <td>৳{fmt(u.depositBalance)}</td>
          <td>{u.plan?.name || '—'}</td>
          <td><small>{u.signupIp || '—'}</small></td>
          <td><span className={`pill ${u.isBlocked ? 'rejected' : 'approved'}`}>{u.isBlocked ? 'blocked' : 'active'}</span></td>
          <td>{u.role === 'admin' ? '—' : (
            <div className="row-actions">
              <button className="btn xs ghost" onClick={() => adjust(u)}>± Balance</button>
              <button className={`btn xs ${u.isBlocked ? '' : 'red'}`} onClick={() => toggleBlock(u.id)}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
            </div>)}</td>
        </tr>))}</tbody>
    </table></div>
  </>);
}

// ---------------- Plans ----------------
function Plans({ toast, reload }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', durationDays: '', dailyTaskLimit: '', perks: '', badge: '', icon: '📦', color: '#16A34A' });
  useEffect(() => { api('/api/admin/plans').then(d => setRows(d.plans)).catch(e => toast(e.message, 'err')); }, []);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const create = async () => {
    try { await api('/api/admin/plans', { method: 'POST', body: form }); toast('Plan created ✓', 'ok'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const toggle = async (p) => {
    try { await api(`/api/admin/plans/${p._id}`, { method: 'PUT', body: { active: !p.active } }); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (
    <div className="grid-2">
      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginBottom: 12 }}>➕ New Plan</h3>
        <div className="field"><label>Name</label><input value={form.name} onChange={set('name')} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label>Price (৳)</label><input type="number" value={form.price} onChange={set('price')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Duration (days)</label><input type="number" value={form.durationDays} onChange={set('durationDays')} /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label>Daily tasks</label><input type="number" value={form.dailyTaskLimit} onChange={set('dailyTaskLimit')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Badge</label><input value={form.badge} onChange={set('badge')} placeholder="Most Popular" /></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label>Icon</label><input value={form.icon} onChange={set('icon')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Color</label><input type="color" value={form.color} onChange={set('color')} style={{ height: 44 }} /></div>
        </div>
        <div className="field"><label>Perks (one per line)</label><textarea rows={3} value={form.perks} onChange={set('perks')} /></div>
        <button className="btn full" onClick={create}>Create Plan</button>
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>Plan</th><th>Price</th><th>Days</th><th>Daily Tasks</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{rows.map(p => (
          <tr key={p._id}>
            <td>{p.icon} <b style={{ color: p.color }}>{p.name}</b> {p.badge && <span className="pill approved">{p.badge}</span>}</td>
            <td>৳{fmt(p.price)}</td>
            <td>{p.durationDays}</td>
            <td>{p.dailyTaskLimit}</td>
            <td><span className={`pill ${p.active ? 'approved' : 'rejected'}`}>{p.active ? 'active' : 'off'}</span></td>
            <td><button className="btn xs ghost" onClick={() => toggle(p)}>{p.active ? 'Disable' : 'Enable'}</button></td>
          </tr>))}</tbody>
      </table></div>
    </div>
  );
}

// ---------------- Plan Manager (subscriptions tracking) ----------------
function PlanManager({ toast }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api('/api/admin/plan-manager').then(setData).catch(e => toast(e.message, 'err'));
  }, []);
  if (!data) return <span className="spinner" />;
  const { summary, subscriptions } = data;
  return (
    <>
      <div className="stats-grid">
        {[
          ['📦 Plans Sold', summary.totalSold],
          ['✅ Active Plans', summary.totalActive],
          ['⌛ Expired Plans', summary.totalExpired],
        ].map(([l, v]) => (
          <div className="card" key={l} style={{ margin: 0, textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: 13 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>
      <h3 style={{ margin: '16px 0 10px' }}>User Plan Subscriptions</h3>
      <div className="table-wrap"><table>
        <thead>
          <tr>
            <th>User</th><th>Plan</th><th>Start</th><th>Expiry</th><th>Days Left</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 && (
            <tr><td colSpan={6} className="muted">No plan data yet</td></tr>
          )}
          {subscriptions.map(r => (
            <tr key={r.userId}>
              <td><b>{r.name}</b><div className="muted" style={{ fontSize: 11 }}>{r.phone}</div></td>
              <td>{r.plan ? `${r.plan.icon || ''} ${r.plan.name}` : '—'}</td>
              <td>{r.startDate ? fmtDate(r.startDate) : '—'}</td>
              <td>{r.expiryDate ? fmtDate(r.expiryDate) : '—'}</td>
              <td>{r.status === 'active' ? r.daysLeft : '—'}</td>
              <td><span className={`pill ${r.status === 'active' ? 'approved' : 'rejected'}`}>{r.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {data.planReferrals?.length > 0 && (
        <>
          <h3 style={{ margin: '18px 0 10px' }}>Plan Referral Commissions</h3>
          <div className="table-wrap"><table>
            <thead><tr><th>Referrer</th><th>Buyer</th><th>Plan</th><th>%</th><th>Commission</th><th>Date</th></tr></thead>
            <tbody>
              {data.planReferrals.map(r => (
                <tr key={r._id}>
                  <td>{r.referrer?.name} ({r.referrer?.phone})</td>
                  <td>{r.buyer?.name}</td>
                  <td>{r.plan?.name}</td>
                  <td>{r.percent}%</td>
                  <td>৳{fmt(r.commission)}</td>
                  <td>{fmtDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </>
      )}
    </>
  );
}

// ---------------- Task Manager ----------------
const EMPTY_TASK = {
  title: '', description: '', type: 'watch_ad', link: '',
  reward: '20', timerSeconds: '30', dailyLimitPerUser: '1',
  buttonText: 'Start Task', requiresPlan: true, active: true,
};

function Tasks({ toast }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(EMPTY_TASK);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api('/api/admin/tasks').then(d => setRows(d.tasks)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);

  const set = k => e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };

  const resetForm = () => { setForm(EMPTY_TASK); setEditId(null); };

  const startEdit = (t2) => {
    setEditId(t2._id);
    setForm({
      title: t2.title || '',
      description: t2.description || '',
      type: t2.type || 'watch_ad',
      link: t2.link || '',
      reward: String(t2.reward ?? ''),
      timerSeconds: String(t2.timerSeconds ?? 30),
      dailyLimitPerUser: String(t2.dailyLimitPerUser ?? 1),
      buttonText: t2.buttonText || 'Start Task',
      requiresPlan: t2.requiresPlan !== false,
      active: !!t2.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    setBusy(true);
    try {
      const body = {
        ...form,
        reward: Number(form.reward),
        timerSeconds: Number(form.timerSeconds) || 30,
        dailyLimitPerUser: Number(form.dailyLimitPerUser) || 1,
      };
      if (editId) {
        await api(`/api/admin/tasks/${editId}`, { method: 'PUT', body });
        toast('Task updated ✓', 'ok');
      } else {
        await api('/api/admin/tasks', { method: 'POST', body });
        toast('Task created ✓', 'ok');
      }
      resetForm();
      load();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const toggle = async (t2) => {
    try {
      await api(`/api/admin/tasks/${t2._id}`, { method: 'PUT', body: { active: !t2.active } });
      toast(t2.active ? 'Task disabled' : 'Task enabled', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const addLink = async (taskId) => {
    const url = prompt('Destination / rotation link URL:');
    if (!url) return;
    const weight = prompt('Weight (higher = shown more often):', '1');
    try {
      await api(`/api/admin/tasks/${taskId}/links`, { method: 'POST', body: { url, weight } });
      toast('Link added ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const delLink = async (id) => {
    try { await api(`/api/admin/links/${id}`, { method: 'DELETE' }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };

  if (!rows) return <span className="spinner" />;

  return (
    <div className="grid-2">
      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginBottom: 8 }}>{editId ? '✏️ Edit Task' : '➕ Create Task'}</h3>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Daily tasks (category 1): edit link, watch time, reward, enable/disable. Changes stay saved — not overwritten on restart.
        </p>
        <div className="field"><label>Title</label><input value={form.title} onChange={set('title')} /></div>
        <div className="field"><label>Description</label><textarea rows={2} value={form.description} onChange={set('description')} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label>Type</label>
            <select value={form.type} onChange={set('type')}>
              {['watch_ad', 'survey', 'data_entry', 'share_link', 'visit_website', 'promo'].map(x => <option key={x}>{x}</option>)}
            </select></div>
          <div className="field" style={{ flex: 1 }}><label>Reward (৳)</label>
            <input type="number" min="0" step="0.01" value={form.reward} onChange={set('reward')} /></div>
        </div>
        <div className="field"><label>Destination link (video / ad / page)</label>
          <input value={form.link} onChange={set('link')} placeholder="https://..." /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label>Required stay time (sec)</label>
            <input type="number" min="1" value={form.timerSeconds} onChange={set('timerSeconds')} placeholder="30" /></div>
          <div className="field" style={{ flex: 1 }}><label>Times per user / day</label>
            <input type="number" min="1" value={form.dailyLimitPerUser} onChange={set('dailyLimitPerUser')} /></div>
        </div>
        <div className="field"><label>Button text</label><input value={form.buttonText} onChange={set('buttonText')} /></div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
          <input type="checkbox" checked={!!form.requiresPlan} onChange={set('requiresPlan')} /> Requires active plan
        </label>
        {editId && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
            <input type="checkbox" checked={!!form.active} onChange={set('active')} /> Task enabled
          </label>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {editId && <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={resetForm}>Cancel</button>}
          <button type="button" className="btn" style={{ flex: 1 }} disabled={busy} onClick={save}>
            {busy ? '...' : editId ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: 10 }}>All Tasks ({rows.length})</h3>
        {rows.map(t2 => (
          <div className="card" key={t2._id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <b>{t2.title}</b>{' '}
                <span className="pill open">{t2.type}</span>{' '}
                <span className={`pill ${t2.active ? 'approved' : 'rejected'}`}>{t2.active ? 'active' : 'off'}</span>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  Reward ৳{fmt(t2.reward)} · Stay {t2.timerSeconds}s · {t2.dailyLimitPerUser}/day · {t2.totalClicks || 0} clicks
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Link: {t2.link || '—'}
                </div>
              </div>
              <div className="row-actions">
                <button type="button" className="btn xs" onClick={() => startEdit(t2)}>Edit</button>
                <button type="button" className="btn xs ghost" onClick={() => addLink(t2._id)}>+ Link</button>
                <button type="button" className={`btn xs ${t2.active ? 'red' : ''}`} onClick={() => toggle(t2)}>
                  {t2.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            {t2.links?.length > 0 && (
              <div style={{ marginTop: 8, borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                <small className="muted">Extra rotation links:</small>
                {t2.links.map(l => (
                  <div key={l._id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, padding: '3px 0' }}>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</span>
                    <span className="muted">w:{l.weight} · {l.clicks}</span>
                    <button type="button" className="btn xs red" onClick={() => delLink(l._id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Social Tasks (YouTube, TikTok, Facebook, Telegram, Share) ----------------
const EMPTY_SOCIAL = { title: '', platform: 'youtube', link: '', reward: '20', sort: '1', active: true };

function SocialTasksAdmin({ toast }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(EMPTY_SOCIAL);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api('/api/admin/social-tasks').then(d => setRows(d.tasks)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);

  const set = k => e => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };

  const startEdit = (t2) => {
    setEditId(t2._id);
    setForm({
      title: t2.title || '',
      platform: t2.platform || 'youtube',
      link: t2.link || '',
      reward: String(t2.reward ?? 20),
      sort: String(t2.sort ?? 0),
      active: !!t2.active,
    });
  };

  const reset = () => { setEditId(null); setForm(EMPTY_SOCIAL); };

  const save = async () => {
    setBusy(true);
    try {
      const body = {
        title: form.title,
        platform: form.platform,
        link: form.link,
        reward: Number(form.reward) || 0,
        sort: Number(form.sort) || 0,
        active: !!form.active,
      };
      if (editId) {
        await api(`/api/admin/social-tasks/${editId}`, { method: 'PUT', body });
        toast('Social task updated ✓', 'ok');
      } else {
        await api('/api/admin/social-tasks', { method: 'POST', body });
        toast('Social task created ✓', 'ok');
      }
      reset();
      load();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const toggle = async (t2) => {
    try {
      await api(`/api/admin/social-tasks/${t2._id}`, { method: 'PUT', body: { active: !t2.active } });
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this social task?')) return;
    try {
      await api(`/api/admin/social-tasks/${id}`, { method: 'DELETE' });
      toast('Deleted', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  if (!rows) return <span className="spinner" />;

  return (
    <div className="grid-2">
      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginBottom: 8 }}>{editId ? '✏️ Edit Social Task' : '➕ Social Task'}</h3>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Change YouTube / TikTok / Facebook / Telegram links &amp; rewards anytime. Edits stay saved.
        </p>
        <div className="field"><label>Title</label><input value={form.title} onChange={set('title')} /></div>
        <div className="field"><label>Platform</label>
          <select value={form.platform} onChange={set('platform')}>
            {['youtube', 'tiktok', 'facebook', 'telegram', 'instagram', 'share'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="field"><label>Link / URL</label>
          <input value={form.link} onChange={set('link')} placeholder="https://..." /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field" style={{ flex: 1 }}><label>Reward (coins)</label>
            <input type="number" min="0" value={form.reward} onChange={set('reward')} /></div>
          <div className="field" style={{ flex: 1 }}><label>Sort</label>
            <input type="number" value={form.sort} onChange={set('sort')} /></div>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
          <input type="checkbox" checked={!!form.active} onChange={set('active')} /> Enabled
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {editId && <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={reset}>Cancel</button>}
          <button type="button" className="btn" style={{ flex: 1 }} disabled={busy} onClick={save}>
            {busy ? '...' : editId ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 10 }}>All Social Tasks ({rows.length})</h3>
        {rows.map(t2 => (
          <div className="card" key={t2._id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <b>{t2.title}</b>{' '}
                <span className="pill open">{t2.platform}</span>{' '}
                <span className={`pill ${t2.active ? 'approved' : 'rejected'}`}>{t2.active ? 'active' : 'off'}</span>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>🪙 {t2.reward} · sort {t2.sort}</div>
                <div className="muted" style={{ fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t2.link || '(no link)'}
                </div>
              </div>
              <div className="row-actions">
                <button type="button" className="btn xs" onClick={() => startEdit(t2)}>Edit</button>
                <button type="button" className="btn xs ghost" onClick={() => toggle(t2)}>{t2.active ? 'Disable' : 'Enable'}</button>
                <button type="button" className="btn xs red" onClick={() => del(t2._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Banners ----------------
function Banners({ toast, reload }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', bgColor: '#16A34A', ctaText: '', ctaLink: '', imageUrl: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('upload'); // upload | builder

  const load = () => api('/api/admin/banners').then(d => setRows(d.banners)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : '');
  };

  const publishUpload = async () => {
    if (!file) return toast('Choose a JPG/PNG banner image', 'err');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', form.title || 'Banner');
      fd.append('subtitle', form.subtitle || '');
      fd.append('ctaText', form.ctaText || '');
      fd.append('ctaLink', form.ctaLink || '');
      fd.append('bgColor', form.bgColor || '#0F2A4A');
      await api('/api/admin/banners/upload', { method: 'POST', formData: fd });
      toast('Banner image published ✓', 'ok');
      setFile(null);
      setPreview('');
      setForm({ title: '', subtitle: '', bgColor: '#16A34A', ctaText: '', ctaLink: '', imageUrl: '' });
      load();
      reload();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const createBuilder = async () => {
    try {
      await api('/api/admin/banners', { method: 'POST', body: form });
      toast('Banner added ✓', 'ok');
      reload();
      load();
    } catch (e) { toast(e.message, 'err'); }
  };

  const toggle = async (b) => {
    try { await api(`/api/admin/banners/${b._id}`, { method: 'PUT', body: { active: !b.active } }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const del = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await api(`/api/admin/banners/${id}`, { method: 'DELETE' }); load(); } catch (e) { toast(e.message, 'err'); }
  };

  if (!rows) return <span className="spinner" />;

  return (
    <div className="grid-2">
      <div className="card" style={{ margin: 0 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" className={`btn xs ${mode === 'upload' ? '' : 'ghost'}`} onClick={() => setMode('upload')}>Upload JPG</button>
          <button type="button" className={`btn xs ${mode === 'builder' ? '' : 'ghost'}`} onClick={() => setMode('builder')}>Text Builder</button>
        </div>

        {mode === 'upload' ? (
          <>
            <h3 style={{ marginBottom: 8 }}>⬆ Upload ready banner</h3>
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
              Upload a finished JPG/PNG (same size as home banner). Leave subtitle &amp; CTA empty for a clean image-only slide.
            </p>
            <div className="field">
              <label>Banner image (JPG / PNG)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
            </div>
            {preview && (
              <div style={{
                marginBottom: 12, borderRadius: 12, overflow: 'hidden', minHeight: 120,
                background: `url(${preview}) center/cover`, border: '1px solid #E2E8F0',
              }} />
            )}
            <div className="field"><label>Title (optional label in admin)</label>
              <input value={form.title} onChange={set('title')} placeholder="Banner" /></div>
            <div className="field"><label>Optional click link</label>
              <input value={form.ctaLink} onChange={set('ctaLink')} placeholder="/app/plans" /></div>
            <div className="field"><label>Optional overlay subtitle (leave empty for image-only)</label>
              <input value={form.subtitle} onChange={set('subtitle')} /></div>
            <div className="field"><label>Optional CTA button text</label>
              <input value={form.ctaText} onChange={set('ctaText')} placeholder="Leave empty for image-only" /></div>
            <button type="button" className="btn full" disabled={busy} onClick={publishUpload}>
              {busy ? 'Uploading…' : 'Publish Banner Image'}
            </button>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: 12 }}>➕ Text / color banner</h3>
            <div className="field"><label>Title</label><input value={form.title} onChange={set('title')} /></div>
            <div className="field"><label>Subtitle</label><input value={form.subtitle} onChange={set('subtitle')} /></div>
            <div className="field"><label>Image URL (optional)</label>
              <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="field" style={{ flex: 1 }}><label>BG Color</label>
                <input type="color" value={form.bgColor} onChange={set('bgColor')} style={{ height: 44 }} /></div>
              <div className="field" style={{ flex: 1 }}><label>CTA Text</label>
                <input value={form.ctaText} onChange={set('ctaText')} /></div>
            </div>
            <div className="field"><label>CTA Link</label>
              <input value={form.ctaLink} onChange={set('ctaLink')} placeholder="/app/plans" /></div>
            <button type="button" className="btn full" onClick={createBuilder}>Add Banner</button>
          </>
        )}
      </div>
      <div>
        <h3 style={{ marginBottom: 10 }}>Live Banners ({rows.length})</h3>
        {rows.map(b => (
          <div className="card" key={b._id} style={{ marginBottom: 10, borderLeft: `6px solid ${b.bgColor}` }}>
            {b.imageUrl && (
              <div style={{
                height: 90, borderRadius: 10, marginBottom: 8,
                background: `url(${b.imageUrl}) center/cover`, border: '1px solid #E2E8F0',
              }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <b>{b.title}</b> <span className={`pill ${b.active ? 'approved' : 'rejected'}`}>{b.active ? 'live' : 'off'}</span>
                <div className="muted" style={{ fontSize: 12.5 }}>{b.subtitle || (b.imageUrl ? 'Image banner' : '')}</div>
                {b.ctaText && <div className="muted" style={{ fontSize: 12 }}>CTA: {b.ctaText} → {b.ctaLink}</div>}
                {b.imageUrl && !b.ctaText && b.ctaLink && (
                  <div className="muted" style={{ fontSize: 12 }}>Tap → {b.ctaLink}</div>
                )}
              </div>
              <div className="row-actions">
                <button type="button" className="btn xs ghost" onClick={() => toggle(b)}>{b.active ? 'Hide' : 'Show'}</button>
                <button type="button" className="btn xs red" onClick={() => del(b._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Tickets ----------------
function Tickets({ toast, reload }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/api/admin/tickets').then(d => setRows(d.tickets)).catch(e => toast(e.message, 'err')); }, []);
  const respond = async (tk) => {
    const message = prompt(`Reply to "${tk.subject}" from ${tk.user?.name}:`);
    if (!message) return;
    try { await api(`/api/admin/tickets/${tk._id}/reply`, { method: 'POST', body: { message } }); toast('Reply sent ✓', 'ok'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const close = async (tk) => {
    try { await api(`/api/admin/tickets/${tk._id}/reply`, { method: 'POST', body: { close: true } }); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return rows.length === 0 ? <div className="empty">No tickets</div> : rows.map(tk => (
    <div className="card" key={tk._id} style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <b>{tk.subject}</b> <span className={`pill ${tk.status}`}>{tk.status}</span>
          <div className="muted" style={{ fontSize: 12.5 }}>{tk.user?.name} ({tk.user?.phone}) · {fmtDate(tk.updatedAt)}</div>
          <div style={{ marginTop: 8 }}>
            {tk.messages.map((m, i) => (
              <div key={i} style={{ fontSize: 13, padding: '4px 0' }}>
                <b>{m.from === 'user' ? '👤' : '🛠'}</b> {m.text}
              </div>
            ))}
          </div>
        </div>
        <div className="row-actions">
          {tk.status !== 'closed' && <button className="btn xs" onClick={() => respond(tk)}>Reply</button>}
          {tk.status !== 'closed' && <button className="btn xs ghost" onClick={() => close(tk)}>Close</button>}
        </div>
      </div>
    </div>
  ));
}

// ---------------- FAQs ----------------
function Faqs({ toast, reload }) {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState(''); const [a, setA] = useState('');
  useEffect(() => { api('/api/admin/faqs').then(d => setRows(d.faqs)).catch(e => toast(e.message, 'err')); }, []);
  const create = async () => {
    try { await api('/api/admin/faqs', { method: 'POST', body: { question: q, answer: a } }); toast('FAQ added ✓', 'ok'); reload(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const del = async (id) => {
    try { await api(`/api/admin/faqs/${id}`, { method: 'DELETE' }); reload(); } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (
    <div className="grid-2">
      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginBottom: 12 }}>➕ New FAQ</h3>
        <div className="field"><label>Question</label><input value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="field"><label>Answer</label><textarea rows={3} value={a} onChange={e => setA(e.target.value)} /></div>
        <button className="btn full" onClick={create}>Add FAQ</button>
      </div>
      <div>
        {rows.map(f => (
          <div className="card" key={f._id} style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <div><b>{f.question}</b><div className="muted" style={{ fontSize: 13 }}>{f.answer}</div></div>
            <button className="btn xs red" style={{ flexShrink: 0 }} onClick={() => del(f._id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Video Tutorials ----------------
function VideoTutorials({ toast }) {
  const empty = { title: '', description: '', videoUrl: '', active: true };
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const load = () => api('/api/admin/tutorials').then(d => setRows(d.tutorials)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return toast('Title is required', 'err');
    try {
      if (editId) {
        await api(`/api/admin/tutorials/${editId}`, { method: 'PUT', body: form });
        toast('Tutorial updated ✓', 'ok');
      } else {
        await api('/api/admin/tutorials', { method: 'POST', body: form });
        toast('Tutorial added ✓', 'ok');
      }
      setForm(empty); setEditId(null); load();
    } catch (e) { toast(e.message, 'err'); }
  };
  const startEdit = (v) => {
    setEditId(v._id);
    setForm({ title: v.title || '', description: v.description || '', videoUrl: v.videoUrl || '', active: v.active !== false });
  };
  const del = async (id) => {
    if (!confirm('Delete this tutorial?')) return;
    try { await api(`/api/admin/tutorials/${id}`, { method: 'DELETE' }); toast('Deleted ✓', 'ok'); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const toggle = async (v) => {
    try { await api(`/api/admin/tutorials/${v._id}`, { method: 'PUT', body: { active: !v.active } }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const move = async (index, dir) => {
    if (!rows) return;
    const next = [...rows];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setRows(next);
    try {
      const d = await api('/api/admin/tutorials/reorder', { method: 'POST', body: { order: next.map(r => r._id) } });
      setRows(d.tutorials);
    } catch (e) { toast(e.message, 'err'); load(); }
  };

  if (!rows) return <span className="spinner" />;
  return (
    <div className="grid-2">
      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginBottom: 12 }}>{editId ? '✏️ Edit Tutorial' : '➕ New Tutorial'}</h3>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>
          Paste a YouTube watch/shorts link or a direct video file URL (.mp4). Videos show on the homepage and Help button when Active + URL is set.
        </p>
        <div className="field"><label>Title</label><input value={form.title} onChange={set('title')} placeholder="How to Buy a Package" /></div>
        <div className="field"><label>Description (optional)</label><input value={form.description} onChange={set('description')} /></div>
        <div className="field"><label>Video URL (YouTube or self-hosted)</label><input value={form.videoUrl} onChange={set('videoUrl')} placeholder="https://www.youtube.com/watch?v=..." /></div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13.5 }}>
          <input type="checkbox" checked={!!form.active} onChange={set('active')} /> Active (visible to users)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn full" onClick={save}>{editId ? 'Save Changes' : 'Add Tutorial'}</button>
          {editId && <button className="btn ghost" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </div>
      <div>
        {rows.length === 0 && <div className="empty">No tutorials yet</div>}
        {rows.map((v, i) => (
          <div className="card" key={v._id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <b>{v.title}</b>{' '}
                <span className={`pill ${v.active && v.videoUrl ? 'approved' : 'rejected'}`}>
                  {v.active && v.videoUrl ? 'live' : (!v.videoUrl ? 'no url' : 'off')}
                </span>
                {v.description && <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{v.description}</div>}
                {v.videoUrl && <div className="muted" style={{ fontSize: 11.5, marginTop: 4, wordBreak: 'break-all' }}>{v.videoUrl}</div>}
              </div>
              <div className="row-actions" style={{ flexShrink: 0 }}>
                <button className="btn xs ghost" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
                <button className="btn xs ghost" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="Move down">↓</button>
                <button className="btn xs ghost" onClick={() => toggle(v)}>{v.active ? 'Hide' : 'Show'}</button>
                <button className="btn xs" onClick={() => startEdit(v)}>Edit</button>
                <button className="btn xs red" onClick={() => del(v._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Broadcast ----------------
function Broadcast({ toast }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const send = async () => {
    try {
      await api('/api/admin/broadcast', { method: 'POST', body: { title, body } });
      toast('Notification sent to all users ✓', 'ok');
      setTitle(''); setBody('');
    } catch (e) { toast(e.message, 'err'); }
  };
  return (
    <div className="card" style={{ maxWidth: 540 }}>
      <h3 style={{ marginBottom: 12 }}>📣 Broadcast Notification (all users)</h3>
      <div className="field"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="field"><label>Message</label><textarea rows={3} value={body} onChange={e => setBody(e.target.value)} /></div>
      <button className="btn full" onClick={send}>Send Broadcast</button>
    </div>
  );
}

// ---------------- Plan Orders (Crypto) ----------------
function PlanOrders({ toast, reload }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { api('/api/admin/plan-orders').then(d => setRows(d.orders)).catch(e => toast(e.message, 'err')); }, []);
  const review = async (id, action) => {
    try {
      await api(`/api/admin/plan-orders/${id}/review`, { method: 'POST', body: { action } });
      toast(action === 'approve' ? 'Plan activated' : 'Rejected', 'ok');
      reload();
      api('/api/admin/plan-orders').then(d => setRows(d.orders));
    } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (
    <div>
      {rows.length === 0 ? <div className="empty">No plan orders yet</div> : rows.map(o => (
        <div className="card" key={o._id} style={{ marginBottom: 10 }}>
          <div><b>{o.user?.name}</b> · {o.user?.phone} · {o.plan?.name}</div>
          <div className="muted" style={{ fontSize: 12 }}>Tx: {o.txHash} · ${o.amountUsd} · {o.status}</div>
          {o.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn xs" onClick={() => review(o._id, 'approve')}>Approve</button>
              <button className="btn xs red" onClick={() => review(o._id, 'reject')}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------- Games Config ----------------
function GamesConfig({ toast }) {
  const [games, setGames] = useState(null);
  useEffect(() => {
    api('/api/admin/settings').then(d => setGames(d.settings?.games || {})).catch(e => toast(e.message, 'err'));
  }, []);
  if (!games) return <span className="spinner" />;
  const save = async () => {
    try {
      await api('/api/admin/settings', { method: 'POST', body: { games } });
      toast('Game settings saved', 'ok');
    } catch (e) { toast(e.message, 'err'); }
  };
  const prizesStr = (games.spinPrizes || []).join(', ');
  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3 style={{ marginBottom: 12 }}>Games & Rewards</h3>
      <div className="field"><label>Daily Coin Reward</label>
        <input type="number" value={games.dailyCoinReward ?? 10} onChange={e => setGames(g => ({ ...g, dailyCoinReward: +e.target.value }))} /></div>
      <div className="field"><label>User Win Rate (0.30 = 30% user wins)</label>
        <input type="number" step="0.01" value={games.userWinRate ?? 0.3} onChange={e => setGames(g => ({ ...g, userWinRate: +e.target.value }))} /></div>
      <div className="field"><label>Spin Wheel Prizes (comma separated, 0 = unlucky)</label>
        <textarea rows={2} value={prizesStr} onChange={e => setGames(g => ({ ...g, spinPrizes: e.target.value.split(',').map(x => +x.trim()).filter(x => !Number.isNaN(x)) }))} /></div>
      <div className="field"><label>Spin Cost (coins)</label>
        <input type="number" value={games.spinCost ?? 20} onChange={e => setGames(g => ({ ...g, spinCost: +e.target.value }))} /></div>
      <div className="field"><label>Ludo Entry / Win</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="Entry" value={games.ludoEntry ?? 50} onChange={e => setGames(g => ({ ...g, ludoEntry: +e.target.value }))} />
          <input type="number" placeholder="Win" value={games.ludoWin ?? 120} onChange={e => setGames(g => ({ ...g, ludoWin: +e.target.value }))} />
        </div>
      </div>
      <div className="field"><label>Stock Entry / Win</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" value={games.stockEntry ?? 30} onChange={e => setGames(g => ({ ...g, stockEntry: +e.target.value }))} />
          <input type="number" value={games.stockWin ?? 55} onChange={e => setGames(g => ({ ...g, stockWin: +e.target.value }))} />
        </div>
      </div>
      <button className="btn full" onClick={save}>Save Game Settings</button>
    </div>
  );
}

// ---------------- Agents ----------------
function Agents({ toast }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '', username: '' });
  const load = () => api('/api/admin/agents').then(d => setRows(d.agents)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);
  const create = async () => {
    try {
      await api('/api/admin/agents', { method: 'POST', body: form });
      toast('Agent created ✓', 'ok');
      setForm({ name: '', phone: '', password: '', username: '' });
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  const adjust = async (a) => {
    const amt = prompt(`Adjust agent coins for ${a.name}.\nEnter amount (negative to deduct):`);
    if (amt === null) return;
    try {
      await api(`/api/admin/agents/${a.id}/adjust-coins`, { method: 'POST', body: { coins: Number(amt) } });
      toast('Agent coins updated ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (<>
    <div className="card" style={{ marginBottom: 14 }}>
      <h3>Create Agent</h3>
      <div className="field"><label>Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div className="field"><label>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="017XXXXXXXX" /></div>
      <div className="field"><label>Username (optional)</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
      <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
      <button className="btn" onClick={create}>Create Agent</button>
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>Name</th><th>Username</th><th>Phone</th><th>Coins</th><th>Transferred</th><th>Action</th></tr></thead>
      <tbody>{rows.map(a => (
        <tr key={a.id}>
          <td>{a.name}</td><td>@{a.username}</td><td>{a.phone}</td>
          <td><b>{a.agentCoins?.toLocaleString()}</b></td>
          <td>{a.agentTotalTransferred?.toLocaleString()}</td>
          <td><button className="btn xs" onClick={() => adjust(a)}>Adjust Coins</button></td>
        </tr>
      ))}</tbody>
    </table></div>
  </>);
}

function AgentPurchases({ toast }) {
  const [rows, setRows] = useState(null);
  const load = () => api('/api/admin/agent-purchases').then(d => setRows(d.purchases)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);
  const review = async (id, action) => {
    try {
      await api(`/api/admin/agent-purchases/${id}/review`, { method: 'POST', body: { action } });
      toast(action + 'd ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (
    <div className="table-wrap"><table>
      <thead><tr><th>Agent</th><th>Coins</th><th>Paid ৳</th><th>Method</th><th>TrxID</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>{rows.map(p => (
        <tr key={p._id}>
          <td>{p.agent?.name}<br /><small className="muted">@{p.agent?.username}</small></td>
          <td><b>{p.coins}</b></td><td>৳{fmt(p.tkPaid)}</td><td>{p.method}</td><td>{p.trxId}</td>
          <td>{fmtDate(p.createdAt)}</td><td><span className={`pill ${p.status}`}>{p.status}</span></td>
          <td>{p.status === 'pending' ? (
            <div className="row-actions">
              <button className="btn xs" onClick={() => review(p._id, 'approve')}>Approve</button>
              <button className="btn xs red" onClick={() => review(p._id, 'reject')}>Reject</button>
            </div>) : '—'}</td>
        </tr>))}</tbody>
    </table></div>
  );
}

function AgentCommissions({ toast }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState(null);
  const load = () => api('/api/admin/agent-commissions?month=' + month).then(d => setRows(d.rows)).catch(e => toast(e.message, 'err'));
  useEffect(() => { load(); }, [month]);
  const pay = async (agentId) => {
    try {
      await api('/api/admin/agent-commissions/pay', { method: 'POST', body: { agentId, month } });
      toast('Commission marked paid ✓', 'ok');
      load();
    } catch (e) { toast(e.message, 'err'); }
  };
  if (!rows) return <span className="spinner" />;
  return (<>
    <div className="field" style={{ maxWidth: 220, marginBottom: 14 }}>
      <label>Month</label>
      <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>Agent</th><th>Transfers</th><th>Volume (coins)</th><th>Commission ৳</th><th>Unpaid ৳</th><th>Action</th></tr></thead>
      <tbody>{rows.length ? rows.map(r => (
        <tr key={r.agent._id}>
          <td>{r.agent.name}<br /><small className="muted">@{r.agent.username}</small></td>
          <td>{r.transferCount}</td><td>{r.totalCoins?.toLocaleString()}</td>
          <td>৳{fmt(r.totalCommission)}</td><td>৳{fmt(r.unpaidCommission)}</td>
          <td>{r.unpaidCommission > 0 ? <button className="btn xs" onClick={() => pay(r.agent._id)}>Mark Paid</button> : 'Paid'}</td>
        </tr>
      )) : <tr><td colSpan={6}>No agent activity this month</td></tr>}</tbody>
    </table></div>
  </>);
}

// ---------------- Settings ----------------
function Settings({ toast }) {
  const [s, setS] = useState(null);
  useEffect(() => { api('/api/admin/settings').then(d => setS(d.settings)).catch(e => toast(e.message, 'err')); }, []);
  if (!s) return <span className="spinner" />;
  const features = { deposits: true, withdrawals: true, tasks: true, referral: true, tickets: true, plans: true, ...(s.features || {}) };
  const fields = [
    ['site_name', 'Site Name'], ['notice', 'Homepage Notice'],
    ['min_deposit', 'Minimum Deposit (৳)'], ['min_withdraw', 'Minimum Withdraw (৳)'],
    ['daily_withdraw_limit', 'Daily Withdraw Limit (৳)'], ['processing_hours', 'Processing Time (hours)'],
    ['referral_percent', 'Referral Commission (%)'], ['signup_bonus', 'Signup Bonus (৳)'],
    ['helpline', 'HelpLine Link (Telegram/WhatsApp)'],
    ['payment_bkash', 'bKash Receive Number'], ['payment_nagad', 'Nagad Receive Number'],
    ['payment_rocket', 'Rocket Receive Number'], ['payment_upi', 'UPI ID'], ['payment_paytm', 'Paytm Number'],
    ['bsc_wallet', 'BSC Wallet Address (Binance Chain)'], ['bsc_qr_url', 'BSC QR Image URL (optional)'],
    ['google_client_id', 'Google OAuth Client ID'],
    ['facebook_app_id', 'Facebook App ID'],
    ['facebook_app_secret', 'Facebook App Secret'],
    ['android_apk_url', 'Android APK Download URL (optional — leave empty to use Install App / PWA)'],
    ['agent_commission_percent', 'Agent Monthly Commission (%)'],
  ];
  const save = async () => {
    try { await api('/api/admin/settings', { method: 'POST', body: s }); toast('Settings saved ✓', 'ok'); }
    catch (e) { toast(e.message, 'err'); }
  };
  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3 style={{ marginBottom: 12 }}>⚙️ Platform Settings</h3>
      {fields.map(([k, label]) => (
        <div className="field" key={k}><label>{label}</label>
          <input value={s[k] ?? ''} onChange={e => setS(x => ({ ...x, [k]: e.target.value }))} /></div>
      ))}
      <div className="field">
        <label>OTP Dev Mode (show OTP on screen — turn OFF when SMS gateway connected)</label>
        <select value={String(s.otp_dev_mode ?? true)} onChange={e => setS(x => ({ ...x, otp_dev_mode: e.target.value === 'true' }))}>
          <option value="true">ON (dev)</option>
          <option value="false">OFF (production)</option>
        </select>
      </div>
      <h4 style={{ margin: '16px 0 10px' }}>Feature Toggles</h4>
      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        {[
          ['deposits', 'Deposits'], ['withdrawals', 'Withdrawals'], ['tasks', 'Daily Tasks'],
          ['plans', 'Plan Purchases'], ['referral', 'Referral System'], ['tickets', 'Support Tickets'],
        ].map(([key, label]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
            <input type="checkbox" checked={features[key] !== false}
              onChange={e => setS(x => ({ ...x, features: { ...features, [key]: e.target.checked } }))} />
            {label}
          </label>
        ))}
      </div>
      <button className="btn full" onClick={save}>Save Settings</button>
    </div>
  );
}
