import { useEffect, useRef } from 'react';

const LOSE_WORDS = ['BETTER', 'LUCK', 'NEXT', 'TIME'];

/** 36 segments — clockwise from top pointer */
export const REFERENCE_WHEEL = [
  { label: '500', value: 500, color: '#E53935' },
  { label: '200', value: 200, color: '#43A047' },
  { label: '100', value: 100, color: '#EC407A' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '100', value: 100, color: '#1E88E5' },
  { label: '50', value: 50, color: '#FDD835' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '50', value: 50, color: '#FF9800' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '50', value: 50, color: '#9C27B0' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '15', value: 15, color: '#00ACC1' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '15', value: 15, color: '#66BB6A' },
  { label: '5', value: 5, color: '#F06292' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '15', value: 15, color: '#43A047' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '5', value: 5, color: '#EF5350' },
  { label: 'UNLUCKY', value: 0, color: '#C62828' },
  { label: '5', value: 5, color: '#66BB6A' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '15', value: 15, color: '#26C6DA' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '5', value: 5, color: '#E53935' },
  { label: '15', value: 15, color: '#7CB342' },
  { label: 'UNLUCKY', value: 0, color: '#8E24AA' },
  { label: '15', value: 15, color: '#29B6F6' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '5', value: 5, color: '#D32F2F' },
  { label: 'UNLUCKY', value: 0, color: '#7B1FA2' },
  { label: '5', value: 5, color: '#EC407A' },
  { label: 'lose', value: 0, color: '#141414', long: true },
  { label: '15', value: 15, color: '#1565C0' },
  { label: '5', value: 5, color: '#AB47BC' },
  { label: 'lose', value: 0, color: '#141414', long: true },
];

const SEG_COUNT = REFERENCE_WHEEL.length;
const STEP = 360 / SEG_COUNT;

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function wedgeWidthAt(r, start, end) {
  return 2 * r * Math.sin((end - start) / 2);
}

function fitFont(ctx, text, maxWidth, startFs, minFs, weight = '700') {
  let fs = startFs;
  while (fs >= minFs) {
    ctx.font = `${weight} ${fs}px Arial, Helvetica, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return fs;
    fs -= 0.5;
  }
  return minFs;
}

function drawRadialText(ctx, cx, cy, r, mid, text, fs, weight = '800', alongRadius = false) {
  const x = cx + r * Math.cos(mid);
  const y = cy + r * Math.sin(mid);
  ctx.save();
  ctx.translate(x, y);
  // alongRadius: word runs rim→center (UNLUCKY); else along arc (numbers / BETTER lines)
  ctx.rotate(alongRadius ? mid : mid + Math.PI / 2);
  ctx.font = `${weight} ${fs}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(2.2, fs * 0.22);
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** Black segment: 4 words tight — BETTER/LUCK/NEXT/TIME, no extra space */
function drawLoseWords(ctx, cx, cy, hubR, segR, mid, start, end) {
  const midR = hubR + (segR - hubR) * 0.7;
  const maxW = wedgeWidthAt(midR, start, end) * 0.92;
  const fs = fitFont(ctx, 'BETTER', maxW, 11, 8.5, '800');
  const lineGap = fs * 1.02;
  const outer = segR - 18;

  LOSE_WORDS.forEach((word, i) => {
    drawRadialText(ctx, cx, cy, outer - lineGap * i, mid, word, fs, '800');
  });
}

function drawSegment(ctx, cx, cy, segR, hubR, start, end, color) {
  const mid = (start + end) / 2;
  const gx = cx + Math.cos(mid) * (segR * 0.65);
  const gy = cy + Math.sin(mid) * (segR * 0.65);

  ctx.beginPath();
  ctx.arc(cx, cy, segR, start, end);
  ctx.arc(cx, cy, hubR, end, start, true);
  ctx.closePath();

  const grad = ctx.createRadialGradient(gx, gy, hubR * 0.2, cx, cy, segR);
  grad.addColorStop(0, lighten(color, 55));
  grad.addColorStop(0.55, color);
  grad.addColorStop(1, lighten(color, -25));
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
}

function drawWheel(ctx, size) {
  const cx = size / 2;
  const cy = size / 2;
  const rimW = 16;
  const segR = cx - rimW - 6;
  const hubR = segR * 0.36;

  ctx.clearRect(0, 0, size, size);

  REFERENCE_WHEEL.forEach((seg, i) => {
    const start = deg2rad(i * STEP - 90);
    const end = deg2rad((i + 1) * STEP - 90);
    const mid = (start + end) / 2;

    drawSegment(ctx, cx, cy, segR, hubR, start, end, seg.color);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, segR, start, end);
    ctx.arc(cx, cy, hubR, end, start, true);
    ctx.closePath();
    ctx.clip();

    if (seg.long) {
      drawLoseWords(ctx, cx, cy, hubR, segR, mid, start, end);
    } else if (seg.label === 'UNLUCKY') {
      // Full word along segment length — clear like close-up pic
      const r = hubR + (segR - hubR) * 0.55;
      const maxLen = (segR - hubR) * 0.78;
      const fs = fitFont(ctx, 'UNLUCKY', maxLen, 16, 11, '800');
      drawRadialText(ctx, cx, cy, r, mid, 'UNLUCKY', fs, '800', true);
    } else {
      const r = hubR + (segR - hubR) * 0.72;
      const maxW = wedgeWidthAt(r, start, end) * 0.88;
      const startFs = seg.label.length >= 3 ? 20 : 22;
      const fs = fitFont(ctx, seg.label, maxW, startFs, 12);
      drawRadialText(ctx, cx, cy, r, mid, seg.label, fs, '800');
    }

    ctx.restore();
  });

  const rimGrad = ctx.createLinearGradient(0, 0, size, size);
  rimGrad.addColorStop(0, '#FEF3C7');
  rimGrad.addColorStop(0.3, '#F59E0B');
  rimGrad.addColorStop(0.65, '#D97706');
  rimGrad.addColorStop(1, '#FDE68A');
  ctx.beginPath();
  ctx.arc(cx, cy, segR + rimW * 0.52, 0, Math.PI * 2);
  ctx.strokeStyle = rimGrad;
  ctx.lineWidth = rimW;
  ctx.shadowColor = 'rgba(251,191,36,0.4)';
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let i = 0; i < 32; i++) {
    const a = deg2rad((i / 32) * 360 - 90);
    const br = segR + rimW * 0.52;
    const bx = cx + br * Math.cos(a);
    const by = cy + br * Math.sin(a);
    ctx.beginPath();
    ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF7D6';
    ctx.shadowColor = '#FBBF24';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

export default function CasinoSpinWheel({ rotation, spinning, onSpin, disabled }) {
  const canvasRef = useRef(null);
  const size = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawWheel(ctx, size);
  }, []);

  return (
    <div className="wheel-casino-wrap">
      <div className="wheel-casino-bokeh" aria-hidden />

      <div className="wheel-pointer-casino" aria-hidden>
        <svg width="34" height="40" viewBox="0 0 34 40" className="wheel-pointer-svg">
          <defs>
            <linearGradient id="ptrRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>
          <path
            d="M17 38 L5 10 Q17 2 29 10 Z"
            fill="url(#ptrRed)"
            stroke="#FBBF24"
            strokeWidth="2"
          />
          <circle cx="17" cy="12" r="3.5" fill="#FEF9C3" stroke="#F59E0B" strokeWidth="0.8" />
        </svg>
      </div>

      <div
        className="wheel-canvas-rotator"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? 'transform 4.5s cubic-bezier(.12,.85,.22,1)' : 'none',
        }}
      >
        <canvas ref={canvasRef} className="wheel-canvas" aria-hidden />
      </div>

      <button
        type="button"
        className="wheel-hub-casino"
        onClick={onSpin}
        disabled={disabled || spinning}
        aria-label="Spin"
      >
        <span className="hub-ring">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className="hub-rivet" style={{ transform: `rotate(${i * 22.5}deg) translateY(-30px)` }} />
          ))}
        </span>
        <span className="hub-txt">SPIN</span>
      </button>
    </div>
  );
}

export function calcSpinRotation(current, _segments, prize, extraSpins = 6) {
  const list = REFERENCE_WHEEL;
  let indices;
  if (prize > 0) {
    indices = list.map((s, i) => (s.value === prize ? i : -1)).filter(i => i >= 0);
  } else {
    indices = list.map((s, i) => (s.value === 0 ? i : -1)).filter(i => i >= 0);
  }
  const idx = indices[Math.floor(Math.random() * indices.length)] ?? 0;
  const segCenter = idx * STEP + STEP / 2;
  const normalize = ((current % 360) + 360) % 360;
  return current + 360 * extraSpins + (360 - segCenter - normalize);
}
