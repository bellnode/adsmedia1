/** Bullish / Bearish side panel for stock prediction */

function BarMeter({ filled, total = 5, color }) {
  return (
    <div className="spm-bars">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`spm-bar ${i < filled ? 'on' : ''}`} style={{ '--c': color }} />
      ))}
    </div>
  );
}

function ProbRing({ pct, color, label }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="spm-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 36 36)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="36" y="33" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">{pct}%</text>
        <text x="36" y="44" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="6" fontWeight="600">PROBABILITY</text>
      </svg>
      <div className="spm-ring-lbl" style={{ color }}>{label}</div>
    </div>
  );
}

export function StockBullPanel({ prob, confidence, trend, volume, momentum }) {
  return (
    <div className="stock-side-panel bull">
      <ProbRing pct={prob} color="#4ADE80" label="" />
      <div className="spm-row">
        <span className="spm-key">Confidence</span>
        <BarMeter filled={confidence} color="#4ADE80" />
      </div>
      <div className="spm-row">
        <span className="spm-key">Trend Strength</span>
        <BarMeter filled={trend} color="#4ADE80" />
      </div>
      <div className="spm-row">
        <span className="spm-key">Volume</span>
        <span className="spm-val green">{volume}</span>
      </div>
      <div className="spm-row">
        <span className="spm-key">Momentum</span>
        <span className="spm-val green">{momentum}</span>
      </div>
    </div>
  );
}

export function StockBearPanel({ prob, confidence, trend, volume, momentum }) {
  return (
    <div className="stock-side-panel bear">
      <ProbRing pct={prob} color="#F87171" label="" />
      <div className="spm-row">
        <span className="spm-key">Confidence</span>
        <BarMeter filled={confidence} color="#F87171" />
      </div>
      <div className="spm-row">
        <span className="spm-key">Trend Strength</span>
        <BarMeter filled={trend} color="#F87171" />
      </div>
      <div className="spm-row">
        <span className="spm-key">Volume</span>
        <span className="spm-val red">{volume}</span>
      </div>
      <div className="spm-row">
        <span className="spm-key">Momentum</span>
        <span className="spm-val red">{momentum}</span>
      </div>
    </div>
  );
}

export function StockPickCard({ dir, busy, onClick, selected }) {
  const cfg = {
    up: {
      cls: 'up', title: 'UP', sub: 'PRICE WILL GO UP',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
          <rect x="10" y="8" width="8" height="14" rx="1" fill="#4ADE80" />
          <line x1="14" y1="4" x2="14" y2="24" stroke="#4ADE80" strokeWidth="1.5" />
        </svg>
      ),
      arrow: '↑',
    },
    down: {
      cls: 'down', title: 'DOWN', sub: 'PRICE WILL GO DOWN',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
          <rect x="10" y="6" width="8" height="14" rx="1" fill="#F87171" />
          <line x1="14" y1="4" x2="14" y2="24" stroke="#F87171" strokeWidth="1.5" />
        </svg>
      ),
      arrow: '↓',
    },
    sideways: {
      cls: 'side', title: 'SIDEWAYS', sub: 'PRICE WILL MOVE SIDEWAYS',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
          <rect x="6" y="11" width="6" height="10" rx="1" fill="#A78BFA" />
          <rect x="16" y="11" width="6" height="10" rx="1" fill="#E2E8F0" />
        </svg>
      ),
      arrow: '→',
    },
  }[dir];

  return (
    <button
      type="button"
      className={`stock-pick-card ${cfg.cls} ${selected ? 'selected' : ''}`}
      disabled={busy}
      onClick={onClick}
    >
      <span className="spc-icon">{cfg.icon}</span>
      <span className="spc-title">{cfg.title}</span>
      <span className="spc-sub">{cfg.sub}</span>
      <span className="spc-arrow">{cfg.arrow}</span>
    </button>
  );
}
