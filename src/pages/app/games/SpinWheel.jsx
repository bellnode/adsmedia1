import { useEffect, useState } from 'react';
import { api } from '../../../api.js';
import { TopBar, useToast } from '../../../components/ui.jsx';
import CasinoSpinWheel, { calcSpinRotation } from '../../../components/CasinoSpinWheel.jsx';
import { playSpin, playWin } from '../../../utils/sound.js';

export default function SpinWheel() {
  const toast = useToast();
  const [cfg, setCfg] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    api('/api/games/config').then(d => { setCfg(d.config); setCoins(d.user?.coins || 0); }).catch(() => {});
  }, []);

  const prizes = cfg?.spinPrizes || [5, 15, 50, 100, 200, 500, 0, 0, 0, 0, 0, 0];

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    try {
      const d = await api('/api/games/spin', { method: 'POST' });
      const prize = d.win ? d.prize : 0;
      playSpin(4600);
      setRotation(r => calcSpinRotation(r, prizes, prize));
      setTimeout(() => {
        setResult(d);
        setCoins(d.coins);
        if (d.win) playWin();
        toast(d.win ? `Won ${d.prize} coins!` : 'Better luck next time!', d.win ? 'ok' : '');
        setSpinning(false);
      }, 4600);
    } catch (e) {
      toast(e.message, 'err');
      setSpinning(false);
    }
  };

  return (
    <>
      <TopBar title="Spin Wheel" backTo="/app/games" />
      <div className="page spin-casino-page">
        <div className="spin-casino-coins">Coins: {coins?.toLocaleString()}</div>

        <CasinoSpinWheel
          rotation={rotation}
          spinning={spinning}
          onSpin={spin}
          disabled={spinning}
        />

        {result && (
          <div className={`spin-casino-result ${result.win ? 'win' : 'lose'}`}>
            {result.freeSpin && <span className="free-tag">Free Spin!</span>}
            {result.win ? `You won ${result.prize} coins!` : 'Better luck next time!'}
          </div>
        )}

        <p className="spin-casino-foot">
          {spinning ? 'Spinning...' : `1 free spin daily · Extra spin: ${cfg?.spinCost || 20} coins`}
        </p>
      </div>
    </>
  );
}
