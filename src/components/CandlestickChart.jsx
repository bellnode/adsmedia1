import { useEffect, useRef, useState, useCallback } from 'react';

function makeCandle(prevClose, volatility = 0.8) {
  const open = prevClose;
  const change = (Math.random() - 0.47) * volatility;
  const close = +(open + change).toFixed(2);
  const high = +(Math.max(open, close) + Math.random() * 0.5).toFixed(2);
  const low = +(Math.min(open, close) - Math.random() * 0.5).toFixed(2);
  const vol = Math.random();
  return { open, close, high, low, up: close >= open, vol };
}

function seedCandles(n, start = 191.5) {
  let price = start;
  return Array.from({ length: n }, () => {
    const c = makeCandle(price);
    price = c.close;
    return c;
  });
}

const TIMES = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];

function CandleShape({ c, x, y, bodyW, volY, volH, maxVol }) {
  const color = c.up ? '#4ADE80' : '#F87171';
  const bodyTop = y(Math.max(c.open, c.close));
  const bodyH = Math.max(2, Math.abs(y(c.open) - y(c.close)));
  const vh = (c.vol / maxVol) * volH;
  return (
    <g>
      <line x1={x} y1={y(c.high)} x2={x} y2={y(c.low)} stroke={color} strokeWidth="1.2" />
      <rect x={x - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} rx="1"
        style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
      <rect x={x - bodyW / 2} y={volY - vh} width={bodyW} height={vh} fill={c.up ? '#4ADE8066' : '#F8717166'} rx="1" />
    </g>
  );
}

export default function CandlestickChart({ height = 200, onMetrics }) {
  const [candles, setCandles] = useState(() => seedCandles(24));
  const tickRef = useRef(0);

  const tick = useCallback(() => {
    setCandles(prev => {
      if (!prev.length) return prev;
      const next = prev.map(c => ({ ...c }));
      const last = next[next.length - 1];
      const delta = (Math.random() - 0.48) * 0.28;
      const newClose = +(last.close + delta).toFixed(2);
      last.close = newClose;
      last.high = +Math.max(last.high, newClose + Math.random() * 0.12).toFixed(2);
      last.low = +Math.min(last.low, newClose - Math.random() * 0.12).toFixed(2);
      last.up = last.close >= last.open;
      last.vol = Math.random();

      tickRef.current += 1;
      if (tickRef.current >= 16) {
        tickRef.current = 0;
        next.push(makeCandle(newClose, 0.85));
        if (next.length > 28) next.shift();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (!onMetrics || !candles.length) return;
    const upCount = candles.filter(c => c.up).length;
    const probUp = Math.round((upCount / candles.length) * 100);
    const clamped = Math.max(20, Math.min(80, probUp));
    onMetrics({
      probUp: clamped,
      probDown: 100 - clamped,
      bullConf: Math.min(5, Math.ceil(clamped / 18)),
      bearConf: Math.min(5, Math.ceil((100 - clamped) / 18)),
      bullTrend: Math.min(5, Math.ceil(clamped / 22)),
      bearTrend: Math.min(5, Math.ceil((100 - clamped) / 22)),
    });
  }, [candles, onMetrics]);

  const chartTop = 8;
  const chartBottom = height - 28;
  const volH = 18;
  const volY = chartBottom - 4;
  const chartH = chartBottom - chartTop - volH - 4;

  const min = Math.min(...candles.map(c => c.low)) - 0.5;
  const max = Math.max(...candles.map(c => c.high)) + 0.5;
  const range = max - min || 1;
  const y = v => chartTop + chartH - ((v - min) / range) * chartH;

  const slotW = 11;
  const bodyW = 6;
  const chartW = candles.length * slotW + 30;
  const livePrice = candles[candles.length - 1]?.close ?? 0;
  const maxVol = Math.max(...candles.map(c => c.vol), 0.01);

  const priceTicks = [0, 0.25, 0.5, 0.75, 1].map(t => +(min + range * t).toFixed(2));

  const buyIdx = candles.findIndex((c, i) => i > 2 && c.up && !candles[i - 1]?.up);
  const sellIdx = candles.findIndex((c, i) => i > 2 && !c.up && candles[i - 1]?.up);

  return (
    <div className="stock-chart-pro-v2">
      <svg viewBox={`0 0 ${chartW + 36} ${height}`} className="stock-chart-svg-v2" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chart-bg-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0f18" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={chartW + 36} height={height} fill="url(#chart-bg-v2)" rx="4" />

        {/* grid */}
        {priceTicks.map((p, i) => {
          const gy = y(p);
          return (
            <g key={i}>
              <line x1="4" y1={gy} x2={chartW} y2={gy} stroke="rgba(51,65,85,.4)" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={chartW + 6} y={gy + 3} fill="rgba(148,163,184,.7)" fontSize="7">{p.toFixed(2)}</text>
            </g>
          );
        })}

        {/* candles + volume */}
        {candles.map((c, i) => (
          <CandleShape
            key={i}
            c={c}
            x={8 + i * slotW + slotW / 2}
            y={y}
            bodyW={bodyW}
            volY={volY}
            volH={volH}
            maxVol={maxVol}
          />
        ))}

        {/* live price tag */}
        <rect x={chartW - 38} y={y(livePrice) - 8} width="34" height="14" rx="3" fill="#166534" />
        <text x={chartW - 21} y={y(livePrice) + 2} textAnchor="middle" fill="#4ADE80" fontSize="7" fontWeight="700">
          {livePrice.toFixed(2)}
        </text>

        {/* BUY signal */}
        {buyIdx > 0 && (
          <g>
            <rect x={8 + buyIdx * slotW} y={y(candles[buyIdx].low) + 6} width="22" height="12" rx="2" fill="#166534" />
            <text x={8 + buyIdx * slotW + 11} y={y(candles[buyIdx].low) + 15} textAnchor="middle" fill="#4ADE80" fontSize="6" fontWeight="700">BUY</text>
            <text x={8 + buyIdx * slotW + 11} y={y(candles[buyIdx].low) + 22} textAnchor="middle" fill="#4ADE80" fontSize="8">↑</text>
          </g>
        )}

        {/* SELL signal */}
        {sellIdx > 0 && (
          <g>
            <rect x={8 + sellIdx * slotW} y={y(candles[sellIdx].high) - 22} width="22" height="12" rx="2" fill="#7F1D1D" />
            <text x={8 + sellIdx * slotW + 11} y={y(candles[sellIdx].high) - 13} textAnchor="middle" fill="#F87171" fontSize="6" fontWeight="700">SELL</text>
            <text x={8 + sellIdx * slotW + 11} y={y(candles[sellIdx].high) - 6} textAnchor="middle" fill="#F87171" fontSize="8">↓</text>
          </g>
        )}

        {/* time axis */}
        {TIMES.map((t, i) => (
          <text key={t} x={8 + (i / (TIMES.length - 1)) * (chartW - 16)} y={height - 4}
            textAnchor="middle" fill="rgba(148,163,184,.6)" fontSize="6">{t}</text>
        ))}
      </svg>
    </div>
  );
}
