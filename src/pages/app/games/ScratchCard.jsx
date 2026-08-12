import { useEffect, useState } from 'react';
import { api } from '../../../api.js';
import { TopBar, useToast } from '../../../components/ui.jsx';
import { playScratch, playWin } from '../../../utils/sound.js';

export default function ScratchCard() {
  const toast = useToast();
  const [cfg, setCfg] = useState(null);
  const [coins, setCoins] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/api/games/config').then(d => { setCfg(d.config); setCoins(d.user?.coins || 0); }).catch(() => {}); }, []);

  const play = async () => {
    if (busy || revealed) return;
    setBusy(true);
    try {
      const d = await api('/api/games/scratch', { method: 'POST' });
      playScratch();
      setPrize(d);
      setCoins(d.coins);
      setRevealed(true);
      if (d.win) playWin();
      toast(d.win ? `Won ${d.prize} coins! 🎉` : 'No prize this time', d.win ? 'ok' : '');
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <>
      <TopBar title="Scratch & Win" backTo="/app/games" />
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="coin-pill">🪙 {coins?.toLocaleString()} coins</div>
        <div className={`scratch-card ${revealed ? 'revealed' : ''}`} onClick={!revealed ? play : undefined}>
          {!revealed ? (
            <div className="scratch-cover">{busy ? '...' : 'Tap to Scratch!'}</div>
          ) : (
            <div className="scratch-prize">{prize?.win ? `🎉 ${prize.prize} Coins` : '😔 No Prize'}</div>
          )}
        </div>
        <p className="muted" style={{ margin: '12px 0' }}>Cost: {cfg?.scratchCost || 15} coins per card</p>
        {revealed && <button className="btn full" onClick={() => { setRevealed(false); setPrize(null); }}>Play Again</button>}
      </div>
    </>
  );
}
