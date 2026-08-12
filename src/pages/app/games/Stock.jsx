import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../api.js';
import { TopBar, useToast } from '../../../components/ui.jsx';
import CandlestickChart from '../../../components/CandlestickChart.jsx';
import { StockBullPanel, StockBearPanel, StockPickCard } from '../../../components/StockPanels.jsx';

export default function StockGame() {
  const toast = useToast();
  const [cfg, setCfg] = useState(null);
  const [coins, setCoins] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [metrics, setMetrics] = useState({
    probUp: 78, probDown: 22,
    bullConf: 5, bearConf: 4,
    bullTrend: 3, bearTrend: 2,
  });

  const onMetrics = useCallback(m => setMetrics(m), []);

  useEffect(() => {
    api('/api/games/config').then(d => { setCfg(d.config); setCoins(d.user?.coins || 0); }).catch(() => {});
  }, []);

  const predict = async (direction) => {
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const d = await api('/api/games/stock', { method: 'POST', body: { direction } });
      setResult(d);
      setCoins(d.coins);
      toast(d.win ? `Correct! +${d.winAmount} coins` : 'Wrong prediction', d.win ? 'ok' : '');
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  return (
    <>
      <TopBar title="Stock Prediction" backTo="/app/games" />
      <div className="page stock-page-v2">
        <div className="stock-v2-coins">Coins: {coins?.toLocaleString()}</div>

        {/* Main dashboard row: bull panel | chart | bear panel */}
        <div className="stock-v2-dashboard">
          <StockBullPanel
            prob={metrics.probUp}
            confidence={metrics.bullConf}
            trend={metrics.bullTrend}
            volume="HIGH"
            momentum="BULLISH"
          />
          <div className="stock-v2-chart-col">
            <CandlestickChart height={210} onMetrics={onMetrics} />
          </div>
          <StockBearPanel
            prob={metrics.probDown}
            confidence={metrics.bearConf}
            trend={metrics.bearTrend}
            volume="LOW"
            momentum="BEARISH"
          />
        </div>

        {result && (
          <div className={`stock-v2-result ${result.win ? 'win' : 'lose'}`}>
            {result.openPrice != null && result.closePrice != null
              ? `${result.openPrice} → ${result.closePrice} (${result.change >= 0 ? '+' : ''}${result.change}) · `
              : ''}
            Market {result.actual?.toUpperCase()} — {result.win ? `+${result.winAmount} coins` : 'Try again'}
          </div>
        )}

        {/* Prediction cards */}
        <div className="stock-v2-picks">
          <StockPickCard dir="up" busy={busy} onClick={() => predict('up')} />
          <StockPickCard dir="down" busy={busy} onClick={() => predict('down')} />
          <StockPickCard dir="sideways" busy={busy} onClick={() => predict('sideways')} />
        </div>

        {/* Footer banner */}
        <div className="stock-v2-footer">
          <span className="star">★</span>
          <span className="txt">MAKE YOUR PREDICTION</span>
          <span className="star">★</span>
        </div>

        <p className="stock-v2-entry">
          Entry: {cfg?.stockEntry || 30} coins · Win: {cfg?.stockWin || 55} coins
        </p>
      </div>
    </>
  );
}
