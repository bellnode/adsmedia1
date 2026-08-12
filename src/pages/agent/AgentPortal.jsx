import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, logout } from '../../api.js';
import Logo from '../../components/Logo.jsx';
import { fmt, fmtDate, useToast } from '../../components/ui.jsx';

const TABS = [
  ['dashboard', 'Dashboard'],
  ['buy', 'Buy Coins'],
  ['transfer', 'Deposit to User'],
  ['history', 'History'],
];

export default function AgentPortal() {
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [config, setConfig] = useState({});

  const load = () => {
    api('/api/agent/dashboard').then(setData).catch(e => {
      if (e.message?.includes('403') || e.message?.includes('Agent')) nav('/app');
      else toast(e.message, 'err');
    });
  };

  useEffect(() => {
    api('/api/user/me').then(d => {
      if (d.user.role !== 'agent') nav(d.user.role === 'admin' ? '/admin' : '/app');
      else load();
    }).catch(() => nav('/login'));
    api('/api/public/config').then(d => setConfig(d.config || {})).catch(() => {});
  }, []);

  if (!data) return (
    <div className="agent-shell">
      <span className="spinner" />
    </div>
  );

  const user = data.user;

  return (
    <div className="agent-shell">
      <header className="agent-top">
        <Logo size={40} light />
        <div className="agent-top-actions">
          <span className="agent-badge">Agent Portal</span>
          <button type="button" className="btn xs ghost light" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="agent-balance-card">
        <div className="lbl">Agent Coin Wallet</div>
        <div className="big">{user.agentCoins?.toLocaleString()} coins</div>
        <div className="sub">
          This month: {data.monthVolume?.toLocaleString()} coins transferred ·
          Commission: ৳{fmt(data.monthCommission)} ({data.commissionPercent}%)
        </div>
      </div>

      <div className="agent-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={tab === id ? 'sel' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      <div className="agent-body page">
        {tab === 'dashboard' && (
          <>
            <div className="card">
              <h3>How it works</h3>
              <ol className="agent-steps">
                <li>Buy coins from admin via bKash / Nagad</li>
                <li>After approval, coins appear in your wallet</li>
                <li>Deposit to users by entering their <b>username</b> only</li>
                <li>Monthly commission is paid on your transfer volume</li>
              </ol>
            </div>
            <div className="card">
              <h3>Recent Transfers</h3>
              {data.transfers?.length ? data.transfers.slice(0, 5).map(t => (
                <div className="list-row" key={t._id}>
                  <div className="grow">
                    <div className="t1">@{t.targetUsername}</div>
                    <div className="t2">{fmtDate(t.createdAt)}</div>
                  </div>
                  <div className="amount-neg">-{t.coins} coins</div>
                </div>
              )) : <div className="empty">No transfers yet</div>}
            </div>
          </>
        )}

        {tab === 'buy' && (
          <BuyCoins config={config} toast={toast} onDone={() => { load(); setTab('history'); }} />
        )}

        {tab === 'transfer' && (
          <TransferCoins toast={toast} onDone={load} />
        )}

        {tab === 'history' && (
          <HistoryPanel purchases={data.purchases} transfers={data.transfers} />
        )}
      </div>
    </div>
  );
}

function BuyCoins({ config, toast, onDone }) {
  const [form, setForm] = useState({ coins: '', tkPaid: '', method: 'bKash', senderNumber: '', trxId: '' });
  const [busy, setBusy] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setBusy(true);
    try {
      const d = await api('/api/agent/purchase', { method: 'POST', body: form });
      toast(d.message, 'ok');
      onDone?.();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const receive = form.method === 'bKash' ? config.payment_bkash : config.payment_nagad;

  return (
    <div className="card">
      <h3>Buy Agent Coins</h3>
      <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
        Pay via bKash or Nagad, then submit transaction ID. Admin will approve and credit coins.
      </p>
      <div className="pay-methods" style={{ marginBottom: 12 }}>
        {['bKash', 'Nagad'].map(m => (
          <button key={m} type="button" className={`pay-method ${m === 'bKash' ? 'pm-bkash' : 'pm-nagad'} ${form.method === m ? 'sel' : ''}`}
            onClick={() => setForm(f => ({ ...f, method: m }))}>{m}</button>
        ))}
      </div>
      {receive && (
        <div className="agent-receive-box">
          Send payment to: <b>{receive}</b> ({form.method})
        </div>
      )}
      <div className="field"><label>Coins to buy (min 100)</label><input type="number" value={form.coins} onChange={set('coins')} placeholder="1000" /></div>
      <div className="field"><label>Amount paid (৳)</label><input type="number" value={form.tkPaid} onChange={set('tkPaid')} placeholder="500" /></div>
      <div className="field"><label>Your {form.method} number</label><input value={form.senderNumber} onChange={set('senderNumber')} placeholder="01XXXXXXXXX" /></div>
      <div className="field"><label>Transaction ID</label><input value={form.trxId} onChange={set('trxId')} placeholder="TrxID" /></div>
      <button type="button" className="btn full" disabled={busy} onClick={submit}>Submit Purchase Request</button>
    </div>
  );
}

function TransferCoins({ toast, onDone }) {
  const [username, setUsername] = useState('');
  const [coins, setCoins] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const d = await api('/api/agent/transfer', { method: 'POST', body: { username, coins } });
      toast(d.message, 'ok');
      setUsername('');
      setCoins('');
      onDone?.();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <div className="card">
      <h3>Deposit to User</h3>
      <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
        Enter the user&apos;s username only. Coins will be added to their account instantly.
      </p>
      <div className="field"><label>Username</label><input value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" /></div>
      <div className="field"><label>Coins</label><input type="number" value={coins} onChange={e => setCoins(e.target.value)} placeholder="500" /></div>
      <button type="button" className="btn full blue" disabled={busy} onClick={submit}>Send Coins</button>
    </div>
  );
}

function HistoryPanel({ purchases, transfers }) {
  return (
    <>
      <div className="card">
        <h3>Purchase History</h3>
        {!purchases?.length ? <div className="empty">No purchases</div> : purchases.map(p => (
          <div className="list-row" key={p._id}>
            <div className="grow">
              <div className="t1">+{p.coins} coins · {p.method}</div>
              <div className="t2">{p.trxId} · {fmtDate(p.createdAt)}</div>
            </div>
            <span className={`pill ${p.status}`}>{p.status}</span>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Transfer History</h3>
        {!transfers?.length ? <div className="empty">No transfers</div> : transfers.map(t => (
          <div className="list-row" key={t._id}>
            <div className="grow">
              <div className="t1">@{t.targetUsername}</div>
              <div className="t2">{fmtDate(t.createdAt)}</div>
            </div>
            <div className="amount-neg">-{t.coins}</div>
          </div>
        ))}
      </div>
    </>
  );
}
