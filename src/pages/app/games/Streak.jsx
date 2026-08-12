import { useEffect, useState } from 'react';
import { api } from '../../../api.js';
import { TopBar, useToast } from '../../../components/ui.jsx';

export default function StreakGame() {
  const toast = useToast();
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [busy, setBusy] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    api('/api/games/config').then(d => {
      setCoins(d.user?.coins || 0);
      setStreak(d.user?.streakDays || 0);
      setRewards(Array(7).fill(d.config?.dailyCoinReward ?? 10));
    }).catch(() => {});
  }, []);

  const claim = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const d = await api('/api/games/streak/claim', { method: 'POST' });
      toast(`Day ${d.streak}: +${d.reward} coins! 🔥`, 'ok');
      setCoins(d.coins);
      setStreak(d.streak);
      setClaimed(true);
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <>
      <TopBar title="Streak Bonus" backTo="/app/games" />
      <div className="page">
        <div className="streak-hero card">
          <div style={{ fontSize: 48 }}>🔥</div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{streak} Day Streak</div>
          <div className="muted">Login daily to keep your streak!</div>
        </div>
        <div className="streak-days">
          {rewards.map((r, i) => (
            <div key={i} className={`streak-day ${i < streak ? 'done' : ''} ${i === streak && !claimed ? 'today' : ''}`}>
              <div className="d">Day {i + 1}</div>
              <div className="r">+{r} 🪙</div>
            </div>
          ))}
        </div>
        <div className="coin-pill">Balance: 🪙 {coins?.toLocaleString()}</div>
        <button className="btn full" disabled={busy || claimed} onClick={claim}>
          {claimed ? '✓ Claimed Today' : 'Claim Today\'s Bonus'}
        </button>
      </div>
    </>
  );
}
