import { useState } from 'react';
import { api } from '../api.js';
import { useToast } from './ui.jsx';

export default function BinancePayModal({ plan, payment, onClose, onSuccess }) {
  const toast = useToast();
  const [txHash, setTxHash] = useState('');
  const [busy, setBusy] = useState(false);

  if (!plan) return null;

  const wallet = payment?.bsc_wallet || '0x0000000000000000000000000000000000000000';
  const usd = (plan.price / 120).toFixed(2);
  const qrUrl = payment?.bsc_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wallet)}`;

  const submit = async () => {
    if (!txHash.trim()) return toast('Enter transaction hash', 'err');
    setBusy(true);
    try {
      await api(`/api/user/plans/${plan._id}/crypto-order`, {
        method: 'POST',
        body: { txHash: txHash.trim() },
      });
      toast('Payment submitted! Plan activates after verification.', 'ok');
      onSuccess?.();
      onClose();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <div className="pay-modal-backdrop" onClick={onClose}>
      <div className="pay-modal" onClick={e => e.stopPropagation()}>
        <h3>Binance Smart Chain Payment</h3>
        <p className="pay-modal-sub">{plan.name} — ${usd} USDT/BNB equivalent</p>
        <div className="pay-qr-wrap">
          <img src={qrUrl} alt="Scan QR" className="pay-qr" />
        </div>
        <div className="pay-wallet">
          <span className="lbl">Wallet Address (BSC)</span>
          <code>{wallet}</code>
          <button type="button" className="btn xs ghost" onClick={() => { navigator.clipboard.writeText(wallet); toast('Copied!', 'ok'); }}>Copy</button>
        </div>
        <ol className="pay-steps">
          <li>Open Binance app → Send via BSC network</li>
          <li>Scan QR or paste wallet address</li>
          <li>Send exact amount & paste Tx Hash below</li>
        </ol>
        <input className="auth-input" placeholder="Transaction Hash (TxID)" value={txHash} onChange={e => setTxHash(e.target.value)} />
        <div className="pay-modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn" disabled={busy} onClick={submit}>I Have Paid</button>
        </div>
      </div>
    </div>
  );
}
