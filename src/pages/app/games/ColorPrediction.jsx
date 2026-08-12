import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../api.js';
import { TopBar, useToast } from '../../../components/ui.jsx';

const COLORS = [
  { id: 'red', label: 'RED', mult: 1.95, cls: 'red' },
  { id: 'green', label: 'GREEN', mult: 1.95, cls: 'green' },
  { id: 'violet', label: 'VIOLET', mult: 4.87, cls: 'violet' },
];

function fmtTimer(secs) {
  const s = Math.max(0, secs || 0);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function ColorDot({ color, size = 14 }) {
  return <span className={`color-dot ${color}`} style={{ width: size, height: size }} aria-hidden />;
}

export default function ColorPrediction() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState('red');
  const [amount, setAmount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await api('/api/games/color/round');
      setData(d);
      if (d.lastResult) setLastResult(d.lastResult);
      if (d.minBet && amount < d.minBet) setAmount(d.minBet);
    } catch { /* ignore poll errors */ }
  }, [amount]);

  useEffect(() => {
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [load]);

  const addAmount = (n) => setAmount(a => Math.max(data?.minBet || 10, a + n));

  const placeBet = async () => {
    if (busy || data?.myBet) return;
    setBusy(true);
    try {
      const d = await api('/api/games/color/bet', { method: 'POST', body: { color: selected, amount } });
      toast(`Bet placed on ${selected.toUpperCase()} — ${amount} coins`, 'ok');
      setData(prev => prev ? { ...prev, coins: d.coins, myBet: { color: d.color, amount: d.amount, multiplier: d.multiplier } } : prev);
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const mult = data?.multipliers || { red: 1.95, green: 1.95, violet: 4.87 };
  const secs = data?.round?.secondsLeft ?? 0;
  const canBet = !data?.myBet && secs > 3;

  return (
    <>
      <TopBar title="Color Prediction" backTo="/app/games" />
      <div className="page color-game-page">
        <div className="color-wallet">
          <span>🪙 Wallet</span>
          <strong>{(data?.coins ?? 0).toLocaleString()} coins</strong>
        </div>

        <div className="color-round-card">
          <div className="color-round-top">
            <div>
              <div className="color-round-label">Period</div>
              <div className="color-round-id">{data?.round?.roundId || '...'}</div>
            </div>
            <div className="color-timer-ring">
              <div className="color-timer-num">{fmtTimer(secs)}</div>
              <div className="color-timer-sub">Time Left</div>
            </div>
          </div>

          <div className="color-pick-row">
            {COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                className={`color-pick-btn ${c.cls} ${selected === c.id ? 'active' : ''}`}
                onClick={() => setSelected(c.id)}
                disabled={!!data?.myBet}
              >
                <span className="color-pick-name">{c.label}</span>
                <span className="color-pick-mult">{mult[c.id] || c.mult}x</span>
              </button>
            ))}
          </div>
        </div>

        <div className="color-bet-card">
          <div className="color-bet-label">Bet Amount (coins)</div>
          <input
            type="number"
            className="color-bet-input"
            value={amount}
            min={data?.minBet || 10}
            onChange={e => setAmount(Math.max(data?.minBet || 10, Number(e.target.value) || 0))}
            disabled={!!data?.myBet}
          />
          <div className="color-quick-row">
            {[10, 50, 100, 500].map(n => (
              <button key={n} type="button" className="color-quick-btn" onClick={() => addAmount(n)} disabled={!!data?.myBet}>+{n}</button>
            ))}
          </div>
          <button type="button" className="btn full color-place-btn" disabled={busy || !canBet} onClick={placeBet}>
            {data?.myBet ? `Bet: ${data.myBet.color.toUpperCase()}` : 'TAKE CHANCE'}
          </button>
          <div className="color-bet-note">Each round is random. Red/Green 1.95x · Violet 4.87x</div>
        </div>

        {lastResult && (
          <div className={`color-result-banner ${lastResult.win ? 'win' : 'lose'}`}>
            {lastResult.win
              ? `🏆 Won ${lastResult.payout} coins! Result: ${lastResult.result?.toUpperCase()} (${lastResult.resultNumber})`
              : `Result: ${lastResult.result?.toUpperCase()} (${lastResult.resultNumber}) — your pick was ${lastResult.color?.toUpperCase()}`}
          </div>
        )}

        <div className="color-history-card">
          <div className="color-history-title">Recent Results</div>
          <div className="color-history-list">
            {(data?.history || []).map(h => (
              <div key={h.roundId} className="color-history-item">
                <span className="muted">{h.roundId?.slice(-6)}</span>
                <ColorDot color={h.result} />
                <span className="color-history-num">{h.resultNumber}</span>
              </div>
            ))}
            {!data?.history?.length && <div className="muted" style={{ fontSize: 12 }}>No results yet</div>}
          </div>
        </div>
      </div>
    </>
  );
}
