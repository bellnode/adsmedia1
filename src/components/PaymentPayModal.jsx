import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useToast } from './ui.jsx';
import { playTap, playCash } from '../utils/sound.js';

function assetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return url;
}

export default function PaymentPayModal({ plan, onClose, onSuccess }) {
  const toast = useToast();
  const [methods, setMethods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/api/public/payment-methods')
      .then((d) => {
        const list = d.methods || [];
        setMethods(list);
        setSelected(list[0] || null);
      })
      .catch(() => {});
  }, []);

  if (!plan) return null;

  const usd = (plan.price / 120).toFixed(2);
  const wallet = selected?.accountDetails || '';
  const qrUrl = selected?.qrUrl
    || (wallet ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wallet)}` : '');

  const copyAddr = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet);
    playTap();
    toast('Copied!', 'ok');
  };

  const submit = async () => {
    if (!selected) return toast('Select a payment method', 'err');
    if (!txHash.trim()) return toast('Enter transaction / Trx ID', 'err');
    setBusy(true);
    try {
      await api(`/api/user/plans/${plan._id}/crypto-order`, {
        method: 'POST',
        body: { txHash: txHash.trim(), paymentMethodId: selected._id },
      });
      playCash();
      toast('Payment submitted! Plan activates after verification.', 'ok');
      onSuccess?.();
      onClose();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const steps = (selected?.instructions || 'Send exact amount → enter TxID → tap I Have Paid')
    .split(/[;\n]|→/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="pay-modal-backdrop" onClick={onClose}>
      <div className="pay-modal pay-modal-wide" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pay-back" onClick={onClose} aria-label="Close">←</button>
        <h3>Choose Payment Method</h3>
        <p className="pay-modal-sub">Select your preferred payment option · {plan.name} — ${usd}</p>

        <div className="pay-method-scroll">
          {methods.map((m) => (
            <button
              key={m._id}
              type="button"
              className={`pay-method-tile ${selected?._id === m._id ? 'sel' : ''}`}
              onClick={() => { setSelected(m); playTap(); }}
            >
              {selected?._id === m._id && <span className="pay-check">✓</span>}
              {m.iconUrl ? (
                <img src={assetUrl(m.iconUrl)} alt="" className="pay-method-icon" />
              ) : (
                <span className="pay-method-fallback">{m.name.slice(0, 2)}</span>
              )}
              <span className="pay-method-name">{m.name}</span>
            </button>
          ))}
          {methods.length === 0 && <div className="muted">No payment methods configured yet.</div>}
        </div>

        {selected && (
          <div className="pay-detail-card">
            <div className="pay-detail-head">
              {selected.iconUrl && <img src={assetUrl(selected.iconUrl)} alt="" />}
              <div>
                <div className="pay-detail-title">{selected.name}{selected.networkHint ? '' : ''} ✓</div>
                {selected.networkHint && <div className="pay-detail-hint">{selected.networkHint}</div>}
              </div>
            </div>

            {qrUrl && (
              <div className="pay-qr-wrap">
                <img src={qrUrl} alt="QR" className="pay-qr" />
              </div>
            )}

            {wallet && (
              <div className="pay-wallet">
                <span className="lbl">Wallet / Account</span>
                <code>{wallet}</code>
                <button type="button" className="btn xs ghost" onClick={copyAddr}>Copy</button>
              </div>
            )}

            {steps.length > 0 && (
              <ol className="pay-steps">
                {steps.slice(0, 5).map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            )}

            <input
              className="auth-input"
              placeholder="Enter transaction hash / TrxID"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
            <div className="pay-modal-actions">
              <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
              <button type="button" className="btn" disabled={busy} onClick={submit}>I Have Paid</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
